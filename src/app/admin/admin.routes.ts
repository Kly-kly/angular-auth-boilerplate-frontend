import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { AuthGuard } from '../_helpers/auth.guard';
import { Role } from '../_models/role';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'accounts', loadChildren: () => import('./accounts/accounts.routes').then(m => m.ACCOUNTS_ROUTES) }
    ]
  }
];