import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-container">
      <div class="pending-card">
        <div class="pending-icon">
          <i class="fas fa-clock"></i>
        </div>
        
        <div class="pending-content">
          <h1 class="pending-title">Account Pending Approval</h1>
          <p class="pending-message">
            Your account has been created successfully, but access is currently pending approval.
          </p>
          
          <div class="pending-details">
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <span>{{ userEmail }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-info-circle"></i>
              <span>Administrator will review and approve your access</span>
            </div>
          </div>
          
          <div class="pending-actions">
            <button 
              class="btn btn-secondary"
              (click)="checkApproval()"
              [disabled]="checking">
              <i class="fas fa-sync-alt" [class.fa-spin]="checking"></i>
              {{ checking ? 'Checking...' : 'Check Status' }}
            </button>
            
            <button 
              class="btn btn-outline"
              (click)="signOut()">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      padding: 1rem;
    }

    .pending-card {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 3rem 2rem;
      width: 100%;
      max-width: 480px;
      border: 1px solid var(--border-color);
      text-align: center;
    }

    .pending-icon {
      width: 5rem;
      height: 5rem;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .pending-icon i {
      font-size: 2.5rem;
      color: white;
    }

    .pending-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .pending-message {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .pending-details {
      background: var(--background-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: left;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-item i {
      color: var(--primary-color);
      width: 1.25rem;
      text-align: center;
    }

    .detail-item span {
      color: var(--text-primary);
      font-weight: 500;
    }

    .pending-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.875rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      border: none;
      text-decoration: none;
      min-width: 120px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--primary-color);
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .btn-outline:hover {
      background: var(--background-color);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    @media (max-width: 480px) {
      .pending-card {
        padding: 2rem 1.5rem;
      }

      .pending-title {
        font-size: 1.5rem;
      }

      .pending-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PendingApprovalComponent {
  checking = false;
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
  }

  async checkApproval() {
    this.checking = true;
    try {
      // Force refresh the auth token to get latest approval status
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Trigger auth state refresh by forcing a re-check
        location.reload(); // This will re-trigger the auth state listener
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      this.checking = false;
    }
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}