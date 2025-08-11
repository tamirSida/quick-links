import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sign-in-container">
      <div class="sign-in-card">
        <div class="brand-header">
          <div class="brand-icon">
            <i class="fas fa-link"></i>
          </div>
          <h1 class="brand-title">Quick Links</h1>
          <p class="brand-subtitle">Your personal homepage for developer tools</p>
        </div>


        <form class="auth-form" (ngSubmit)="onSubmit()" #authForm="ngForm">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-envelope"></i>
              Email
            </label>
            <input 
              type="email" 
              class="form-input"
              placeholder="Enter your email"
              [(ngModel)]="email"
              name="email"
              required
              #emailInput="ngModel">
            <div class="error-message" *ngIf="emailInput.invalid && emailInput.touched">
              Please enter a valid email
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              Password
            </label>
            <input 
              type="password" 
              class="form-input"
              placeholder="Enter your password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              #passwordInput="ngModel">
            <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-group remember-me">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="checkbox-input"
                [(ngModel)]="rememberMe"
                name="rememberMe">
              <span class="checkbox-custom"></span>
              Remember me
            </label>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary auth-btn"
              [disabled]="authForm.invalid || loading">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              <i class="fas fa-sign-in-alt" *ngIf="!loading"></i>
              {{ loading ? 'Please wait...' : 'Sign In' }}
            </button>
          </div>

          <div class="error-message auth-error" *ngIf="errorMessage">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="request-access-section">
          <div class="divider">
            <span>New User?</span>
          </div>
          <button 
            type="button" 
            class="btn btn-secondary request-btn"
            (click)="requestAccess()">
            <i class="fas fa-user-plus"></i>
            Request Access
          </button>
        </div>

        <div class="footer-links">
          <p class="text-sm">
            Perfect for developers who want quick access to their tools and resources
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sign-in-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      padding: 1rem;
    }

    .sign-in-card {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 3rem 2rem;
      width: 100%;
      max-width: 420px;
      border: 1px solid var(--border-color);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .brand-icon i {
      font-size: 2rem;
      color: white;
    }

    .brand-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0;
    }

    .auth-tabs {
      display: flex;
      background: var(--background-color);
      border-radius: var(--radius-md);
      padding: 0.25rem;
      margin-bottom: 2rem;
    }

    .tab-btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      color: var(--text-secondary);
      font-weight: 500;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .tab-btn.active {
      background: var(--surface-color);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    .auth-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-label i {
      color: var(--primary-color);
      width: 1rem;
    }

    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--surface-color);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .auth-btn {
      width: 100%;
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      gap: 0.5rem;
      justify-content: center;
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .remember-me {
      margin-bottom: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      cursor: pointer;
      font-weight: 500;
    }

    .checkbox-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .checkbox-custom {
      width: 1.25rem;
      height: 1.25rem;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      position: relative;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .checkbox-input:checked + .checkbox-custom {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .checkbox-custom:hover {
      border-color: var(--primary-color);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .auth-error {
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: var(--radius-sm);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .demo-section {
      margin-bottom: 2rem;
    }

    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-color);
    }

    .divider span {
      background: var(--surface-color);
      padding: 0 1.5rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      position: relative;
      z-index: 1;
    }

    .request-access-section {
      margin-bottom: 2rem;
    }

    .request-btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      gap: 0.5rem;
      justify-content: center;
    }

    .footer-links {
      text-align: center;
      color: var(--text-secondary);
    }

    .text-sm {
      font-size: 0.75rem;
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 480px) {
      .sign-in-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .brand-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class SignInComponent {
  email = '';
  password = '';
  rememberMe = true;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  async onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithEmailAndPassword(this.email, this.password, this.rememberMe);
      // Go directly to dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  requestAccess() {
    this.router.navigate(['/request-access']);
  }


  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}