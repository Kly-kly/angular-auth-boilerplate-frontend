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
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log('=== LOGIN ERROR DEBUG ===');
          console.log('Status:', err.status);
          console.log('Error object:', err);
          console.log('Error error property:', err.error);
          
          // Stop loading
          this.loading = false;
          
          // Extract error message
          let errorMessage = 'Login failed. Please try again.';
          
          if (err.status === 401) {
            // Check if error.error has a message property
            if (err.error && err.error.message) {
              errorMessage = err.error.message;
              // Make it more user-friendly
              if (errorMessage === 'Invalid credentials') {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
              }
            } else {
              errorMessage = 'Invalid email or password. Please try again.';
            }
          } else if (err.status === 0) {
            errorMessage = 'Cannot connect to server. Please check your internet connection.';
          } else if (err.error && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          console.log('Showing error message:', errorMessage);
          this.alertService.error(errorMessage);
        }
      });
  }
}