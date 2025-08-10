import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        // Check if user is logged in and approved
        if (user && user.approved === true) {
          // Check if user is admin
          if (this.adminService.isAdmin()) {
            return true;
          } else {
            // Not admin, redirect to dashboard
            this.router.navigate(['/dashboard']);
            return false;
          }
        } else if (user && user.approved === false) {
          // User not approved
          this.router.navigate(['/pending-approval']);
          return false;
        } else {
          // Not logged in
          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
}