import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private router: Router,
    private cdr: ChangeDetectorRef
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
    this.errorMessage = '';
    this.alertService.clear();
    this.cdr.detectChanges();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('Login success:', response);
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.log('Login error:', error);
          this.loading = false;
          
          if (error.error?.message === 'Invalid credentials') {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.error?.message === 'Please verify your email first') {
            this.errorMessage = 'Please verify your email address before logging in.';
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
          
          this.cdr.detectChanges();
        }
      });
  }
}