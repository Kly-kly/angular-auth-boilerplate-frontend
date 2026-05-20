import { Routes } from '@angular/router';
import { AuthGuard } from './_helpers/auth.guard';
import { Role } from './_models/role';

export const routes: Routes = [
  { path: '', redirectTo: '/account/login', pathMatch: 'full' },
  {
    path: 'account',
    loadChildren: () => import('./account/account.routes').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  },
  { path: '**', redirectTo: '/account/login' }
];