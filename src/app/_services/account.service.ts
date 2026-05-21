import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { Account } from '../_models';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // ✅ Load from localStorage on app start
    const savedAccount = localStorage.getItem('account');
    this.accountSubject = new BehaviorSubject<Account | null>(
      savedAccount ? JSON.parse(savedAccount) : null
    );
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(map(account => {
        // ✅ Save to localStorage
        localStorage.setItem('account', JSON.stringify(account));
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  logout() {
    this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
    this.stopRefreshTokenTimer();
    // ✅ Remove from localStorage
    localStorage.removeItem('account');
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(map(account => {
        // ✅ Update localStorage
        localStorage.setItem('account', JSON.stringify(account));
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
  }

  getAll() {
    return this.http.get<Account[]>(`${baseUrl}`);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  create(params: any) {
    return this.http.post(`${baseUrl}`, params);
  }

  update(id: string, params: any) {
    return this.http.put(`${baseUrl}/${id}`, params)
      .pipe(map((account: any) => {
        if (account.id === this.accountValue?.id) {
          account = { ...this.accountValue, ...account };
          // ✅ Update localStorage
          localStorage.setItem('account', JSON.stringify(account));
          this.accountSubject.next(account);
        }
        return account;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(finalize(() => {
        if (id === this.accountValue?.id) this.logout();
      }));
  }

  private refreshTokenTimeout?: any;

  private startRefreshTokenTimer() {
    // ✅ Safety check for missing token
    if (!this.accountValue?.jwtToken) {
      console.warn('No JWT token found, skipping refresh timer');
      return;
    }
    
    try {
      const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
      if (timeout > 0) {
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}