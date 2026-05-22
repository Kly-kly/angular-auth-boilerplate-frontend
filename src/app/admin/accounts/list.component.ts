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
    console.log('ListComponent initialized');
    this.loadAccounts();
  }

  loadAccounts() {
    console.log('loadAccounts called');
    this.loading = true;
    this.errorMessage = '';
    
    const url = `${environment.apiUrl}/accounts`;
    console.log('Fetching from URL:', url);
    
    // Use fetch instead of HttpClient to bypass any interceptor issues
    fetch(url)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data: any) => {
        console.log('Data received:', data);
        if (Array.isArray(data)) {
          this.accounts = data;
        } else if (data && typeof data === 'object') {
          this.accounts = [data];
        } else {
          this.accounts = [];
        }
        console.log('Accounts count:', this.accounts.length);
        this.loading = false;
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        this.errorMessage = error.message;
        this.loading = false;
      });
  }

  deleteAccount(id: string) {
    if (confirm('Delete this account?')) {
      this.accountService.delete(id).subscribe({
        next: () => {
          this.accounts = this.accounts.filter(x => x.id !== id);
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