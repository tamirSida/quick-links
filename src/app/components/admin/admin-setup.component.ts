import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <div class="setup-header">
          <div class="setup-icon">
            <i class="fas fa-tools"></i>
          </div>
          <h1 class="setup-title">Admin Setup</h1>
          <p class="setup-subtitle">One-time setup for admin user</p>
        </div>

        <div class="setup-content">
          <div class="admin-info">
            <h3>Setting up admin user:</h3>
            <div class="admin-details">
              <div class="detail-item">
                <span class="label">User ID:</span>
                <code class="value">{{ adminUID }}</code>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="status" [class]="setupStatus">{{ getStatusText() }}</span>
              </div>
            </div>
          </div>

          <div class="setup-actions" *ngIf="!isSetupComplete">
            <button 
              class="btn btn-primary setup-btn"
              (click)="setupAdmin()"
              [disabled]="isLoading">
              <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
              <i class="fas fa-magic" *ngIf="!isLoading"></i>
              {{ isLoading ? 'Setting up...' : 'Setup Admin User' }}
            </button>
          </div>

          <div class="setup-success" *ngIf="isSetupComplete">
            <div class="success-message">
              <i class="fas fa-check-circle"></i>
              <div>
                <h3>Setup Complete!</h3>
                <p>Admin user has been configured successfully.</p>
              </div>
            </div>
            
            <div class="next-steps">
              <h4>Next Steps:</h4>
              <ol>
                <li>Sign in with your admin account</li>
                <li>You'll have access to the dashboard and admin panel</li>
                <li>This setup page will self-destruct after use</li>
              </ol>
            </div>

            <div class="action-buttons">
              <button class="btn btn-primary" (click)="goToSignIn()">
                <i class="fas fa-sign-in-alt"></i>
                Go to Sign In
              </button>
            </div>
          </div>

          <div class="setup-error" *ngIf="errorMessage">
            <div class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <h3>Setup Failed</h3>
                <p>{{ errorMessage }}</p>
              </div>
            </div>
            
            <button class="btn btn-secondary" (click)="retrySetup()">
              <i class="fas fa-redo"></i>
              Retry Setup
            </button>
          </div>

          <div class="already-setup" *ngIf="alreadyExists && !isSetupComplete">
            <div class="info-message">
              <i class="fas fa-info-circle"></i>
              <div>
                <h3>Already Set Up</h3>
                <p>Admin user is already configured. You can sign in normally.</p>
              </div>
            </div>
            
            <button class="btn btn-primary" (click)="goToSignIn()">
              <i class="fas fa-sign-in-alt"></i>
              Go to Sign In
            </button>
          </div>
        </div>

        <div class="setup-footer">
          <div class="warning-text">
            <i class="fas fa-shield-alt"></i>
            This is a one-time setup page. Access will be disabled after successful setup.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .setup-card {
      background: var(--surface-color, white);
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      padding: 3rem 2rem;
      width: 100%;
      max-width: 600px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .setup-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .setup-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
    }

    .setup-icon i {
      font-size: 2rem;
      color: white;
    }

    .setup-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary, #1a202c);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .setup-subtitle {
      color: var(--text-secondary, #6b7280);
      font-size: 1rem;
      margin: 0;
    }

    .setup-content {
      margin-bottom: 2rem;
    }

    .admin-info {
      background: var(--background-color, #f8fafc);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .admin-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary, #1a202c);
      margin: 0 0 1rem 0;
    }

    .admin-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-weight: 500;
      color: var(--text-secondary, #6b7280);
      font-size: 0.875rem;
    }

    .value {
      background: var(--surface-color, white);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      word-break: break-all;
    }

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }

    .status.loading {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }

    .status.complete {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .status.error {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .setup-actions {
      text-align: center;
      margin: 2rem 0;
    }

    .btn {
      padding: 0.875rem 2rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      min-width: 140px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: var(--surface-color, white);
      color: var(--text-primary, #1a202c);
      border: 2px solid var(--border-color, #e2e8f0);
    }

    .btn-secondary:hover {
      background: var(--background-color, #f8fafc);
    }

    .setup-btn {
      font-size: 1rem;
      padding: 1rem 3rem;
    }

    .setup-success,
    .setup-error,
    .already-setup {
      text-align: center;
    }

    .success-message,
    .error-message,
    .info-message {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 2rem;
    }

    .success-message {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .success-message i {
      font-size: 2rem;
      color: #059669;
      flex-shrink: 0;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .error-message i {
      font-size: 2rem;
      color: #dc2626;
      flex-shrink: 0;
    }

    .info-message {
      background: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .info-message i {
      font-size: 2rem;
      color: #2563eb;
      flex-shrink: 0;
    }

    .success-message h3,
    .error-message h3,
    .info-message h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .success-message p,
    .error-message p,
    .info-message p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .next-steps {
      background: var(--background-color, #f8fafc);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: left;
    }

    .next-steps h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary, #1a202c);
    }

    .next-steps ol {
      margin: 0;
      padding-left: 1.5rem;
      color: var(--text-secondary, #6b7280);
    }

    .next-steps li {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .setup-footer {
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding-top: 2rem;
      text-align: center;
    }

    .warning-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-secondary, #6b7280);
      font-weight: 500;
    }

    .warning-text i {
      color: #f59e0b;
    }

    @media (max-width: 640px) {
      .setup-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .setup-title {
        font-size: 1.875rem;
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .value {
        width: 100%;
        text-align: center;
      }

      .success-message,
      .error-message,
      .info-message {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AdminSetupComponent {
  adminUID = 'KhrB5Bdod3fUb1DhjmNdtJBmU4i1';
  isLoading = false;
  isSetupComplete = false;
  alreadyExists = false;
  errorMessage = '';
  setupStatus: 'pending' | 'loading' | 'complete' | 'error' = 'pending';

  constructor(private router: Router) {
    this.checkIfAdminExists();
  }

  async checkIfAdminExists() {
    try {
      const adminDoc = await getDoc(doc(firestore, 'users', this.adminUID));
      if (adminDoc.exists() && adminDoc.data()['approved'] === true) {
        this.alreadyExists = true;
        this.setupStatus = 'complete';
      }
    } catch (error) {
      console.log('Admin check failed (normal):', error);
    }
  }

  async setupAdmin() {
    this.isLoading = true;
    this.setupStatus = 'loading';
    this.errorMessage = '';

    try {
      const adminUserData = {
        email: 'admin@quicklinks.com',
        displayName: 'Admin User',
        approved: true,
        isAdmin: true,
        createdAt: Timestamp.now(),
        setupCompleted: true,
        setupDate: Timestamp.now()
      };

      const adminDocRef = doc(firestore, 'users', this.adminUID);
      await setDoc(adminDocRef, adminUserData);

      // Verify the document was created
      const verifyDoc = await getDoc(adminDocRef);
      if (verifyDoc.exists() && verifyDoc.data()['approved'] === true) {
        this.isSetupComplete = true;
        this.setupStatus = 'complete';
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          this.goToSignIn();
        }, 3000);
      } else {
        throw new Error('Document verification failed');
      }

    } catch (error: any) {
      console.error('Setup failed:', error);
      this.errorMessage = error.message || 'Failed to setup admin user. Please check Firestore permissions.';
      this.setupStatus = 'error';
    } finally {
      this.isLoading = false;
    }
  }

  retrySetup() {
    this.errorMessage = '';
    this.setupStatus = 'pending';
    this.setupAdmin();
  }

  getStatusText(): string {
    switch (this.setupStatus) {
      case 'pending': return 'Ready to setup';
      case 'loading': return 'Setting up...';
      case 'complete': return 'Setup complete';
      case 'error': return 'Setup failed';
      default: return 'Unknown';
    }
  }

  goToSignIn() {
    this.router.navigate(['/']);
  }
}