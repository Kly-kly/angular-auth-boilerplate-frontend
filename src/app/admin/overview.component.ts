import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h3>Admin Dashboard</h3>
        </div>
        <div class="card-body">
          <p>Welcome to the Admin Panel.</p>
          <a routerLink="/admin/accounts" class="btn btn-primary">Manage Accounts</a>
        </div>
      </div>
    </div>
  `
})
export class OverviewComponent {}