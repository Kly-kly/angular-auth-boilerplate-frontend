import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AccountService, AlertService } from '../_services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  clearError() {
    this.errorMessage = '';
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login error details:', error);
          
          // IMPORTANT: Stop loading immediately
          this.loading = false;
          
          // Set user-friendly error message
          if (error.status === 401) {
            if (error.error?.message === 'Invalid credentials') {
              this.errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.error?.message === 'Please verify your email first') {
              this.errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
            } else {
              this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
            }
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
          
          // Force change detection if needed
          setTimeout(() => {
            this.loading = false;
          }, 0);
        }
      });
  }
}