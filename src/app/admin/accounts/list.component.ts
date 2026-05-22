import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    console.log('Fetching from URL:', url);
    
    // Use the native fetch API to bypass Angular's HTTP interceptors
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: any) => {
        console.log('Data received:', data);
        // Handle both array and single object responses
        this.accounts = Array.isArray(data) ? data : (data ? [data] : []);
        this.loading = false;
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        this.errorMessage = error.message;
        this.alertService.error(`Failed to load accounts: ${error.message}`);
        this.loading = false;
      });
  }

  deleteAccount(id: string) {
    if (confirm('Delete this account?')) {
      // Keep using the service for delete, it's a different operation
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