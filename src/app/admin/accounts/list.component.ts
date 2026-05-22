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
    console.log('Loading accounts from:', `${environment.apiUrl}/accounts`);
    
    // Direct HTTP call to bypass any service issues
    this.http.get(`${environment.apiUrl}/accounts`).subscribe({
      next: (data: any) => {
        console.log('Accounts received:', data);
        // Handle both array and single object
        if (Array.isArray(data)) {
          this.accounts = data;
        } else if (data && typeof data === 'object') {
          this.accounts = [data];
        } else {
          this.accounts = [];
        }
        console.log('Accounts count:', this.accounts.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.alertService.error('Failed to load accounts: ' + (error.message || 'Unknown error'));
        this.loading = false;
      }
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