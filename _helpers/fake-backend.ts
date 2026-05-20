import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';
import { Role } from '../_models';

const accountsKey = 'angular-auth-accounts';
let accounts: any[] = [];

const loadAccounts = () => {
  const stored = localStorage.getItem(accountsKey);
  accounts = stored ? JSON.parse(stored) : [];
};
loadAccounts();

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, body } = request;

    return handleRoute();

    function handleRoute() {
      switch (true) {
        case url.endsWith('/accounts/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/accounts/register') && method === 'POST':
          return register();
        case url.endsWith('/accounts/verify-email') && method === 'POST':
          return verifyEmail();
        case url.endsWith('/accounts/forgot-password') && method === 'POST':
          return forgotPassword();
        case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
          return validateResetToken();
        case url.endsWith('/accounts/reset-password') && method === 'POST':
          return resetPassword();
        case url.endsWith('/accounts') && method === 'GET':
          return getAccounts();
        case url.match(/\/accounts\/\d+$/) && method === 'GET':
          return getAccountById();
        case url.endsWith('/accounts') && method === 'POST':
          return createAccount();
        case url.match(/\/accounts\/\d+$/) && method === 'PUT':
          return updateAccount();
        case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
          return deleteAccount();
        case url.endsWith('/accounts/refresh-token') && method === 'POST':
          return refreshToken();
        case url.endsWith('/accounts/revoke-token') && method === 'POST':
          return revokeToken();
        default:
          return next.handle(request);
      }
    }

    function authenticate() {
      const { email, password } = body;
      const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
      if (!account) return error('Email or password is incorrect');
      
      account.refreshTokens = account.refreshTokens || [];
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
      return ok({
        ...basicDetails(account),
        jwtToken: generateJwtToken(account)
      });
    }

    function register() {
      const account = body;
      
      if (accounts.find(x => x.email === account.email)) {
        showNotification('Email Already Registered', `${account.email} is already registered.`, 'warning');
        return ok();
      }
      
      account.id = accounts.length + 1;
      account.role = accounts.length === 0 ? Role.Admin : Role.User;
      account.verificationToken = Date.now().toString();
      account.isVerified = false;
      account.refreshTokens = [];
      delete account.confirmPassword;
      accounts.push(account);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
      const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
      showVerificationModal(account.email, verifyUrl);
      
      return ok();
    }

    function verifyEmail() {
      const { token } = body;
      const account = accounts.find(x => x.verificationToken === token);
      if (!account) return error('Verification failed');
      account.isVerified = true;
      delete account.verificationToken;
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      showNotification('Email Verified!', 'Your email has been verified. You can now login.', 'success');
      return ok();
    }

    function forgotPassword() {
      const { email } = body;
      const account = accounts.find(x => x.email === email);
      if (account) {
        const resetToken = Date.now().toString();
        account.resetToken = resetToken;
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        const resetUrl = `${location.origin}/account/reset-password?token=${resetToken}`;
        showResetModal(account.email, resetUrl);
      } else {
        showNotification('Email Not Found', 'No account found with that email.', 'warning');
      }
      return ok();
    }

    function validateResetToken() {
      const { token } = body;
      const account = accounts.find(x => x.resetToken === token);
      if (!account) return error('Invalid token');
      return ok();
    }

    function resetPassword() {
      const { token, password } = body;
      const account = accounts.find(x => x.resetToken === token);
      if (!account) return error('Invalid token');
      account.password = password;
      delete account.resetToken;
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      showNotification('Password Reset', 'Your password has been reset successfully.', 'success');
      return ok();
    }

    function getAccounts() {
      if (!isAuthenticated()) return unauthorized();
      return ok(accounts.map(x => basicDetails(x)));
    }

    function getAccountById() {
      if (!isAuthenticated()) return unauthorized();
      const account = accounts.find(x => x.id === idFromUrl());
      return ok(basicDetails(account));
    }

    function createAccount() {
      if (!isAuthorized(Role.Admin)) return unauthorized();
      const account = body;
      account.id = accounts.length + 1;
      account.isVerified = true;
      delete account.confirmPassword;
      accounts.push(account);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      return ok();
    }

    function updateAccount() {
      if (!isAuthenticated()) return unauthorized();
      const params = body;
      const account = accounts.find(x => x.id === idFromUrl());
      if (account.id !== currentAccount()?.id && !isAuthorized(Role.Admin)) {
        return unauthorized();
      }
      Object.assign(account, params);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      return ok(basicDetails(account));
    }

    function deleteAccount() {
      if (!isAuthenticated()) return unauthorized();
      const account = accounts.find(x => x.id === idFromUrl());
      if (account.id !== currentAccount()?.id && !isAuthorized(Role.Admin)) {
        return unauthorized();
      }
      accounts = accounts.filter(x => x.id !== idFromUrl());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      return ok();
    }

    function refreshToken() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return unauthorized();
      const account = accounts.find(x => x.refreshTokens?.includes(refreshToken));
      if (!account) return unauthorized();
      account.refreshTokens = account.refreshTokens.filter((x: any) => x !== refreshToken);
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      return ok({
        ...basicDetails(account),
        jwtToken: generateJwtToken(account)
      });
    }

    function revokeToken() {
      if (!isAuthenticated()) return unauthorized();
      const refreshToken = getRefreshToken();
      const account = accounts.find(x => x.refreshTokens?.includes(refreshToken));
      if (account) {
        account.refreshTokens = account.refreshTokens.filter((x: any) => x !== refreshToken);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
      }
      return ok();
    }

    function ok(body?: any) {
      return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
    }

    function error(message: string) {
      return throwError(() => ({ error: { message } })).pipe(materialize(), delay(500), dematerialize());
    }

    function unauthorized() {
      return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } })).pipe(materialize(), delay(500), dematerialize());
    }

    function basicDetails(account: any) {
      const { id, title, firstName, lastName, email, role, isVerified } = account;
      return { id, title, firstName, lastName, email, role, isVerified };
    }

    function isAuthenticated() {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer fake-jwt-token')) return false;
      const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
      const tokenExpired = Date.now() > (jwtToken.exp * 1000);
      return !tokenExpired;
    }

    function isAuthorized(role: any) {
      const account = currentAccount();
      return account?.role === role;
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }

    function currentAccount() {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer fake-jwt-token')) return null;
      const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
      const tokenExpired = Date.now() > (jwtToken.exp * 1000);
      if (tokenExpired) return null;
      return accounts.find(x => x.id === jwtToken.id);
    }

    function generateJwtToken(account: any) {
      const tokenPayload = { exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000), id: account.id };
      return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
    }

    function generateRefreshToken() {
      const token = new Date().getTime().toString();
      const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
      document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
      return token;
    }

    function getRefreshToken() {
      return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
    }
  }
}

// Helper Functions for UI
function showVerificationModal(email: string, verifyUrl: string) {
  setTimeout(() => {
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalDiv.style.zIndex = '10000';
    modalDiv.style.display = 'flex';
    modalDiv.style.alignItems = 'center';
    modalDiv.style.justifyContent = 'center';
    
    modalDiv.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 25px; max-width: 500px; text-align: center;">
        <h3 style="color: #198754;">📧 Verification Email</h3>
        <p>Thanks for registering! Please verify your email:</p>
        <p><strong>${email}</strong></p>
        <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: #198754; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          ✅ Click Here to Verify
        </a>
        <p><small style="word-break: break-all;">${verifyUrl}</small></p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }, 100);
}

function showResetModal(email: string, resetUrl: string) {
  setTimeout(() => {
    const modalDiv = document.createElement('div');
    modalDiv.style.position = 'fixed';
    modalDiv.style.top = '0';
    modalDiv.style.left = '0';
    modalDiv.style.width = '100%';
    modalDiv.style.height = '100%';
    modalDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalDiv.style.zIndex = '10000';
    modalDiv.style.display = 'flex';
    modalDiv.style.alignItems = 'center';
    modalDiv.style.justifyContent = 'center';
    
    modalDiv.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 25px; max-width: 500px; text-align: center;">
        <h3 style="color: #0d6efd;">🔐 Reset Password</h3>
        <p>Click the button below to reset your password:</p>
        <p><strong>${email}</strong></p>
        <a href="${resetUrl}" target="_blank" style="display: inline-block; background: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          🔑 Reset Password
        </a>
        <p><small style="word-break: break-all;">${resetUrl}</small></p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }, 100);
}

function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning') {
  setTimeout(() => {
    const colors = {
      success: { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✅' },
      error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '❌' },
      warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404', icon: '⚠️' }
    };
    const color = colors[type];
    
    const notificationDiv = document.createElement('div');
    notificationDiv.style.position = 'fixed';
    notificationDiv.style.top = '20px';
    notificationDiv.style.right = '20px';
    notificationDiv.style.zIndex = '10001';
    notificationDiv.style.backgroundColor = color.bg;
    notificationDiv.style.borderLeft = `4px solid ${color.border}`;
    notificationDiv.style.borderRadius = '8px';
    notificationDiv.style.padding = '15px 20px';
    notificationDiv.style.maxWidth = '400px';
    notificationDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    notificationDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">${color.icon}</span>
        <div style="flex: 1;">
          <strong style="color: ${color.text};">${title}</strong>
          <p style="margin: 5px 0 0 0; color: ${color.text};">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => notificationDiv.remove(), 5000);
  }, 100);
}

export const fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};