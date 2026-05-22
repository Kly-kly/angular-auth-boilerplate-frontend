import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService, AlertService } from '../../_services';

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
    private alertService: AlertService,
    private cdr: ChangeDetectorRef  // ✅ Add this
  ) {}

  ngOnInit() {
    console.log('🔵 Component initialized - calling loadAccounts');
    this.loadAccounts();
  }

  loadAccounts() {
    console.log('🟡 loadAccounts started');
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();  // ✅ Force update
    
    const url = 'https://klykly-auth-backend.onrender.com/accounts';
    console.log('📡 Fetching from URL:', url);
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      console.log('📥 Response received, status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: any) => {
      console.log('✅ Data parsed:', data);
      
      if (Array.isArray(data)) {
        this.accounts = data;
      } else if (data && typeof data === 'object') {
        this.accounts = [data];
      } else {
        this.accounts = [];
      }
      
      console.log('📊 Accounts count:', this.accounts.length);
      this.loading = false;
      this.cdr.detectChanges();  // ✅ Force update after data is set
      this.errorMessage = '';
    })
    .catch((error) => {
      console.error('❌ Fetch error:', error);
      this.errorMessage = error.message;
      this.loading = false;
      this.cdr.detectChanges();  // ✅ Force update on error
    });
  }

  deleteAccount(id: string) {
    if (confirm('Delete this account?')) {
      this.accountService.delete(id).subscribe({
        next: () => {
          this.accounts = this.accounts.filter(x => x.id !== id);
          this.alertService.success('Account deleted');
          this.cdr.detectChanges();  // ✅ Force update
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.alertService.error('Failed to delete account');
        }
      });
    }
  }
}