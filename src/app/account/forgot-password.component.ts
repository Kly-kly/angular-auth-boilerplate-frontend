import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AccountService, AlertService } from '../_services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    
    this.accountService.forgotPassword(this.f['email'].value)
      .subscribe({
        next: (response) => {
          console.log('Forgot password success:', response);
          this.alertService.success('Please check your email for password reset instructions');
          this.router.navigate(['/account/login']);
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          this.alertService.error(error.error?.message || 'Failed to send reset email');
          this.loading = false;
        }
      });
  }
}