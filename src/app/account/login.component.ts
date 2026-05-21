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

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    
    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          // Login successful
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login error:', error);
          
          // Show user-friendly error message
          let errorMessage = 'Login failed';
          
          if (error.status === 401) {
            if (error.error?.message === 'Invalid credentials') {
              errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.error?.message === 'Please verify your email first') {
              errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
            } else {
              errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
            }
          } else if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please try again later.';
          } else {
            errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
          
          this.alertService.error(errorMessage);
          this.loading = false;
        }
      });
  }
}