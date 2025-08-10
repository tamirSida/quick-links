import { Routes } from '@angular/router';
import { SignInComponent } from './components/auth/sign-in.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DemoComponent } from './components/demo/demo.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: SignInComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'demo', component: DemoComponent },
  { path: '**', redirectTo: '' }
];
