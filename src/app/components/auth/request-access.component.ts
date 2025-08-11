import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="request-access-container">
      <div class="request-access-card">
        <div class="brand-header">
          <div class="brand-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h1 class="brand-title">Request Access</h1>
          <p class="brand-subtitle">Join the Quick Links community</p>
        </div>

        <div class="success-message" *ngIf="submitted">
          <i class="fas fa-check-circle"></i>
          <h3>Request Submitted!</h3>
          <p>Thank you for your interest in Quick Links. We'll review your request and get back to you soon.</p>
          <button class="btn btn-primary" (click)="goToSignIn()">
            <i class="fas fa-arrow-left"></i>
            Back to Sign In
          </button>
        </div>

        <!-- JavaScript form (static HTML form is in /public/netlify-forms.html for detection) -->
        <form 
          *ngIf="!submitted"
          name="access-requests"
          class="request-form"
          (ngSubmit)="onSubmit($event)"
          #requestForm="ngForm">
          
          <!-- Hidden form-name input for Netlify -->
          <input type="hidden" name="form-name" value="access-requests" />
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user"></i>
              Full Name *
            </label>
            <input 
              type="text" 
              name="name"
              class="form-input"
              placeholder="Enter your full name"
              [(ngModel)]="formData.name"
              required
              #nameInput="ngModel">
            <div class="error-message" *ngIf="nameInput.invalid && nameInput.touched">
              Please enter your full name
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-envelope"></i>
              Email Address *
            </label>
            <input 
              type="email" 
              name="email"
              class="form-input"
              placeholder="Enter your email address"
              [(ngModel)]="formData.email"
              required
              #emailInput="ngModel">
            <div class="error-message" *ngIf="emailInput.invalid && emailInput.touched">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-bullhorn"></i>
              How did you hear about Quick Links? *
            </label>
            <select 
              name="referral_source"
              class="form-input"
              [(ngModel)]="formData.referralSource"
              required
              #referralInput="ngModel">
              <option value="">Select an option</option>
              <option value="friend">Friend or colleague</option>
              <option value="social-media">Social media</option>
              <option value="search-engine">Search engine</option>
              <option value="github">GitHub</option>
              <option value="dev-community">Developer community/forum</option>
              <option value="blog">Blog or article</option>
              <option value="other">Other</option>
            </select>
            <div class="error-message" *ngIf="referralInput.invalid && referralInput.touched">
              Please select how you heard about us
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-comment"></i>
              Additional Comments
            </label>
            <textarea 
              name="comments"
              class="form-input"
              placeholder="Tell us about your use case or any questions you have (optional)"
              [(ngModel)]="formData.comments"
              rows="4">
            </textarea>
            <div class="form-hint">
              Optional: Let us know what you're looking to use Quick Links for or any specific features you're interested in.
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="goToSignIn()">
              <i class="fas fa-arrow-left"></i>
              Back to Sign In
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="requestForm.invalid || loading">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              <i class="fas fa-paper-plane" *ngIf="!loading"></i>
              {{ loading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .request-access-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      padding: 1rem;
    }

    .request-access-card {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 3rem 2rem;
      width: 100%;
      max-width: 520px;
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

    .success-message {
      text-align: center;
      padding: 2rem 1rem;
    }

    .success-message i {
      font-size: 3rem;
      color: #10b981;
      margin-bottom: 1rem;
    }

    .success-message h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .success-message p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .request-form {
      margin-bottom: 1rem;
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

    select.form-input {
      cursor: pointer;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    .form-hint {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
      font-style: italic;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      margin-top: 2rem;
    }

    .btn {
      padding: 0.875rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .btn-secondary {
      background: var(--background-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--surface-color);
      color: var(--text-primary);
      border-color: var(--primary-color);
    }

    @media (max-width: 640px) {
      .request-access-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .form-actions {
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
      }

      .brand-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class RequestAccessComponent {
  submitted = false;
  loading = false;
  
  formData = {
    name: '',
    email: '',
    referralSource: '',
    comments: ''
  };

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  async onSubmit(event: Event) {
    if (this.loading) return;
    
    event.preventDefault();
    this.loading = true;

    try {
      // Prepare form data for Netlify submission
      const formData = new FormData();
      formData.append('form-name', 'access-requests');
      formData.append('name', this.formData.name);
      formData.append('email', this.formData.email);
      formData.append('referral_source', this.formData.referralSource);
      formData.append('comments', this.formData.comments);

      // Submit to Netlify
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString()
      });

      this.submitted = true;
    } catch (error) {
      console.error('Error submitting form:', error);
      // In a real scenario, you might want to show an error message
      alert('There was an error submitting your request. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  goToSignIn() {
    this.router.navigate(['/']);
  }
}