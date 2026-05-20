import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccountRoutingModule
  ]
  // NO declarations array for standalone components
})
export class AccountModule { }