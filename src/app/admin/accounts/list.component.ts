import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  apiUrl = '';

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    this.apiUrl = `${environment.apiUrl}/accounts`;
    console.log('🔵 Constructor - API URL:', this.apiUrl);
  }

  ngOnInit() {
    console.log('🟢 ngOnInit called');
    this.loadAccounts();
  }

  loadAccounts() {
    console.log('🟡 loadAccounts started');
    this.loading = true;
    this.errorMessage = '';
    
    const url = `${environment.apiUrl}/accounts`;
    console.log('📡 Calling URL:', url);
    
    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log('✅ Success! Data:', data);
        if (Array.isArray(data)) {
          this.accounts = data;
        } else if (data && typeof data === 'object') {
          this.accounts = [data];
        } else {
          this.accounts = [];
        }
        console.log('📊 Accounts count:', this.accounts.length);
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error:', error);
        this.errorMessage = `Status: ${error.status} - ${error.message}`;
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