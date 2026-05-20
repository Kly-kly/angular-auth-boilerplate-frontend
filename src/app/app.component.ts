import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AccountService } from './_services';
import { AlertComponent } from './_components/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, AlertComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  account: any = null;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.account.subscribe(x => {
      this.account = x;
    });
  }

  logout() {
    this.accountService.logout();
  }
}