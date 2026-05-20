import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { first, finalize } from 'rxjs/operators';
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
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.forgotPassword(this.f['email'].value)
      .pipe(first(), finalize(() => this.loading = false))
      .subscribe({
        next: () => this.alertService.success('Please check your email for password reset instructions'),
        error: (error: any) => this.alertService.error(error)
      });
  }
}