import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  account: any = null;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.accountService.account.subscribe(x => {
      this.account = x;
    });
  }

  logout() {
    this.accountService.logout();
  }
}