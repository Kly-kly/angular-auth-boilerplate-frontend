import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService, AlertService } from '../_services';
import { MustMatch } from '../_helpers/must-match.validator';

enum TokenStatus {
  Validating,
  Valid,
  Invalid
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  TokenStatus = TokenStatus;
  tokenStatus = TokenStatus.Validating;
  token?: string;
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef  // ✅ Add this
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    const token = this.route.snapshot.queryParams['token'];
    console.log('Token from URL:', token);
    
    // Remove token from URL to keep it clean
    this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

    if (!token) {
      this.tokenStatus = TokenStatus.Invalid;
      this.cdr.detectChanges();  // ✅ Force change detection
      return;
    }

    this.accountService.validateResetToken(token)
      .subscribe({
        next: () => {
          console.log('Token is valid');
          this.token = token;
          this.tokenStatus = TokenStatus.Valid;
          this.cdr.detectChanges();  // ✅ Force change detection to update UI
          console.log('TokenStatus changed to:', this.tokenStatus);
        },
        error: (error) => {
          console.error('Token validation error:', error);
          this.tokenStatus = TokenStatus.Invalid;
          this.cdr.detectChanges();  // ✅ Force change detection
        }
      });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.resetPassword(this.token!, this.f['password'].value, this.f['confirmPassword'].value)
      .subscribe({
        next: () => {
          this.alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true });
          this.router.navigate(['/account/login']);
        },
        error: (error: any) => {
          console.error('Reset password error:', error);
          this.alertService.error(error.error?.message || 'Failed to reset password');
          this.loading = false;
          this.cdr.detectChanges();  // ✅ Force change detection
        }
      });
  }
}