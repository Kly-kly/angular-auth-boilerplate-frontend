import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../_services';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  constructor(private accountService: AccountService) {}

  get account() {
    return this.accountService.accountValue;
  }
}