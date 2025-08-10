import { Routes } from '@angular/router';
import { SignInComponent } from './components/auth/sign-in.component';
import { PendingApprovalComponent } from './components/auth/pending-approval.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminSetupComponent } from './components/admin/admin-setup.component';
import { DemoComponent } from './components/demo/demo.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: SignInComponent },
  { path: 'pending-approval', component: PendingApprovalComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin-setup', component: AdminSetupComponent },
  { path: 'demo', component: DemoComponent },
  { path: '**', redirectTo: '' }
];
