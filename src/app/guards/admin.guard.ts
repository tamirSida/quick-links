import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { map, filter, take } from 'rxjs/operators';
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
      filter(user => user !== undefined), // Wait for auth state to be determined
      take(1), // Take only the first valid value
      map(user => {
        if (user && this.adminService.isAdmin()) {
          return true; // User is authenticated and is admin
        } else if (user) {
          // User is authenticated but not admin
          this.router.navigate(['/dashboard']);
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