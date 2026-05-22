import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AccountService, AlertService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  accounts: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.errorMessage = '';
    const url = `${environment.apiUrl}/accounts`;
    console.log('Fetching accounts from:', url);
    
    // Direct HTTP call to avoid interceptor issues
    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log('Accounts data:', data);
        // Handle both array and single object responses
        this.accounts = Array.isArray(data) ? data : (data ? [data] : []);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.errorMessage = error.message || 'Failed to load accounts';
        this.alertService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  deleteAccount(id: string) {
    if (confirm('Delete this account?')) {
      this.accountService.delete(id).subscribe({
        next: () => {
          this.accounts = this.accounts.filter(acc => acc.id !== id);
          this.alertService.success('Account deleted');
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.alertService.error('Failed to delete account');
        }
      });
    }
  }
}