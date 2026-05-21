import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '../_services';

enum EmailStatus {
  Verifying,
  Failed
}

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  EmailStatus = EmailStatus;
  emailStatus = EmailStatus.Verifying;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Get token from URL query parameters
    const token = this.route.snapshot.queryParamMap.get('token');
    
    console.log('Token from URL:', token);
    console.log('Full URL:', window.location.href);
    
    // Clear token from URL for cleaner look
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });

    if (!token) {
      this.errorMessage = 'No verification token found. Please use the link from your email.';
      this.emailStatus = EmailStatus.Failed;
      return;
    }

    this.accountService.verifyEmail(token)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('Verification success:', response);
          this.alertService.success('Verification successful! You can now login.', { keepAfterRouteChange: true });
          this.router.navigate(['/account/login']);
        },
        error: (error) => {
          console.error('Verification error:', error);
          this.errorMessage = error.error?.message || 'Verification failed. The link may be invalid or expired.';
          this.emailStatus = EmailStatus.Failed;
        }
      });
  }
}