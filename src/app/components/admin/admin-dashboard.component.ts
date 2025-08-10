import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminUser } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <header class="admin-header">
        <div class="container">
          <div class="header-content">
            <h1 class="admin-title">
              <i class="fas fa-user-shield"></i>
              Admin Dashboard
            </h1>
            <div class="header-actions">
              <button class="btn btn-secondary" (click)="goToDashboard()">
                <i class="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-main">
        <div class="container">
          <!-- Create User Section -->
          <div class="admin-section">
            <div class="section-header">
              <h2>
                <i class="fas fa-user-plus"></i>
                Create New User
              </h2>
              <p>Users created here are automatically approved</p>
            </div>
            
            <form class="create-user-form" (ngSubmit)="createUser()" #createForm="ngForm">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    class="form-input"
                    placeholder="user@example.com"
                    [(ngModel)]="newUser.email"
                    name="email"
                    required
                    #emailInput="ngModel">
                  <div class="error-message" *ngIf="emailInput.invalid && emailInput.touched">
                    Please enter a valid email
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-input"
                    placeholder="Minimum 6 characters"
                    [(ngModel)]="newUser.password"
                    name="password"
                    required
                    minlength="6"
                    #passwordInput="ngModel">
                  <div class="error-message" *ngIf="passwordInput.invalid && passwordInput.touched">
                    Password must be at least 6 characters
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Display Name (Optional)</label>
                  <input 
                    type="text" 
                    class="form-input"
                    placeholder="User's full name"
                    [(ngModel)]="newUser.displayName"
                    name="displayName">
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="createForm.invalid || creating">
                  <i class="fas fa-spinner fa-spin" *ngIf="creating"></i>
                  <i class="fas fa-user-plus" *ngIf="!creating"></i>
                  {{ creating ? 'Creating...' : 'Create User' }}
                </button>
              </div>
              
              <div class="success-message" *ngIf="createSuccess">
                <i class="fas fa-check-circle"></i>
                User created successfully and automatically approved!
              </div>
              
              <div class="error-message" *ngIf="createError">
                <i class="fas fa-exclamation-triangle"></i>
                {{ createError }}
              </div>
            </form>
          </div>

          <!-- Users Management Section -->
          <div class="admin-section">
            <div class="section-header">
              <h2>
                <i class="fas fa-users"></i>
                User Management
              </h2>
              <p>{{ users.length }} total users</p>
            </div>
            
            <div class="users-stats">
              <div class="stat-card approved">
                <i class="fas fa-check-circle"></i>
                <div class="stat-content">
                  <div class="stat-number">{{ approvedCount }}</div>
                  <div class="stat-label">Approved</div>
                </div>
              </div>
              <div class="stat-card pending">
                <i class="fas fa-clock"></i>
                <div class="stat-content">
                  <div class="stat-number">{{ pendingCount }}</div>
                  <div class="stat-label">Pending</div>
                </div>
              </div>
            </div>

            <div class="users-actions">
              <button class="btn btn-outline" (click)="loadUsers()" [disabled]="loading">
                <i class="fas fa-sync-alt" [class.fa-spin]="loading"></i>
                Refresh Users
              </button>
            </div>

            <div class="users-table" *ngIf="users.length > 0">
              <div class="table-header">
                <div class="table-row">
                  <div class="table-cell">Email</div>
                  <div class="table-cell">Status</div>
                  <div class="table-cell">Created</div>
                  <div class="table-cell">Actions</div>
                </div>
              </div>
              <div class="table-body">
                <div class="table-row" *ngFor="let user of users">
                  <div class="table-cell">
                    <div class="user-info">
                      <div class="user-email">{{ user.email }}</div>
                      <div class="user-name" *ngIf="user.displayName">{{ user.displayName }}</div>
                    </div>
                  </div>
                  <div class="table-cell">
                    <span class="status-badge" [class]="user.approved ? 'approved' : 'pending'">
                      <i class="fas" [class]="user.approved ? 'fa-check-circle' : 'fa-clock'"></i>
                      {{ user.approved ? 'Approved' : 'Pending' }}
                    </span>
                  </div>
                  <div class="table-cell">
                    <div class="date-info">{{ formatDate(user.createdAt) }}</div>
                  </div>
                  <div class="table-cell">
                    <div class="user-actions">
                      <button 
                        *ngIf="!user.approved"
                        class="btn btn-sm btn-success"
                        (click)="approveUser(user.uid)"
                        [disabled]="actionLoading[user.uid]">
                        <i class="fas fa-check"></i>
                        Approve
                      </button>
                      <button 
                        *ngIf="user.approved"
                        class="btn btn-sm btn-warning"
                        (click)="disapproveUser(user.uid)"
                        [disabled]="actionLoading[user.uid]">
                        <i class="fas fa-times"></i>
                        Revoke
                      </button>
                      <button 
                        class="btn btn-sm btn-danger"
                        (click)="deleteUser(user.uid, user.email)"
                        [disabled]="actionLoading[user.uid]">
                        <i class="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="users.length === 0 && !loading">
              <i class="fas fa-users"></i>
              <h3>No Users Found</h3>
              <p>No users have been registered yet.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background: var(--background-color);
    }

    .admin-header {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      padding: 2rem 0;
      box-shadow: var(--shadow-lg);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .admin-title {
      font-size: 2rem;
      font-weight: 800;
      color: white;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0;
    }

    .admin-main {
      padding: 3rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .admin-section {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }

    .section-header {
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0 0 0.5rem 0;
    }

    .section-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.875rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-grid .form-group:last-child {
      grid-column: 1 / -1;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--background-color);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--surface-color);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--background-color);
    }

    .btn-outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .btn-outline:hover {
      background: var(--background-color);
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background: #d97706;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .users-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--background-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--border-color);
    }

    .stat-card i {
      font-size: 2rem;
    }

    .stat-card.approved i {
      color: #10b981;
    }

    .stat-card.pending i {
      color: #f59e0b;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .users-actions {
      margin-bottom: 2rem;
    }

    .users-table {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .table-header {
      background: var(--background-color);
      border-bottom: 1px solid var(--border-color);
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 2fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .table-header .table-row {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .table-body .table-row:last-child {
      border-bottom: none;
    }

    .table-body .table-row:hover {
      background: var(--background-color);
    }

    .table-cell {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-email {
      font-weight: 500;
      color: var(--text-primary);
    }

    .user-name {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.approved {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .status-badge.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .date-info {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .success-message,
    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .success-message {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    .empty-state p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .admin-title {
        font-size: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .table-cell {
        flex-direction: column;
        align-items: flex-start;
      }

      .user-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;
  creating = false;
  createSuccess = false;
  createError = '';
  actionLoading: { [key: string]: boolean } = {};
  
  newUser = {
    email: '',
    password: '',
    displayName: ''
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is admin
    if (!this.adminService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadUsers();
  }

  get approvedCount(): number {
    return this.users.filter(user => user.approved).length;
  }

  get pendingCount(): number {
    return this.users.filter(user => !user.approved).length;
  }

  async loadUsers() {
    this.loading = true;
    try {
      this.users = await this.adminService.getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  async createUser() {
    if (!this.newUser.email || !this.newUser.password) return;
    
    this.creating = true;
    this.createSuccess = false;
    this.createError = '';

    try {
      await this.adminService.createUser(
        this.newUser.email,
        this.newUser.password,
        this.newUser.displayName || undefined
      );
      
      this.createSuccess = true;
      this.newUser = { email: '', password: '', displayName: '' };
      
      // Refresh users list
      setTimeout(() => {
        this.loadUsers();
        this.createSuccess = false;
      }, 3000);
      
    } catch (error: any) {
      this.createError = error.message;
    } finally {
      this.creating = false;
    }
  }

  async approveUser(uid: string) {
    this.actionLoading[uid] = true;
    try {
      await this.adminService.approveUser(uid);
      await this.loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      this.actionLoading[uid] = false;
    }
  }

  async disapproveUser(uid: string) {
    this.actionLoading[uid] = true;
    try {
      await this.adminService.disapproveUser(uid);
      await this.loadUsers();
    } catch (error) {
      console.error('Error disapproving user:', error);
    } finally {
      this.actionLoading[uid] = false;
    }
  }

  async deleteUser(uid: string, email: string) {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }
    
    this.actionLoading[uid] = true;
    try {
      await this.adminService.deleteUser(uid);
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      this.actionLoading[uid] = false;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}