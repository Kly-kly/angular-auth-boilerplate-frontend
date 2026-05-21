import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccountService } from '../_services';
import { AlertService } from '../_services';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  constructor(
    private accountService: AccountService,
    private alertService: AlertService,
    private router: Router
  ) {}

  get account() {
    return this.accountService.accountValue;
  }

  deleteAccount() {
    if (!this.account?.id) {
      this.alertService.error('No account found');
      return;
    }

    if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      this.accountService.delete(this.account.id.toString()).subscribe({
        next: () => {
          this.alertService.success('Account deleted successfully');
          this.router.navigate(['/account/login']);
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.alertService.error('Failed to delete account');
        }
      });
    }
  }
}