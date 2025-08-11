import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../../services/theme.service';
import { LinksService } from '../../services/links.service';
import { ViewsService } from '../../services/views.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { QuickLink } from '../../models/link.model';
import { View } from '../../models/view.model';
import { LinkWizardComponent } from '../link-wizard/link-wizard.component';
import { LinkCardComponent } from '../link-card/link-card.component';
import { ViewWizardComponent } from '../view-wizard/view-wizard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkWizardComponent, LinkCardComponent, ViewWizardComponent],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="container">
          <div class="header-content">
            <h1 class="dashboard-title">
              <i class="fas fa-link"></i>
              Quick Links
            </h1>
            
            <div class="header-actions">
              <div class="actions-grid" [class.admin]="isAdmin()">
                <div class="theme-selector">
                  <label class="theme-label">
                    <i class="fas fa-palette"></i>
                    Theme
                  </label>
                  <div class="theme-dropdown" [class.open]="themeDropdownOpen">
                    <button 
                      class="theme-current"
                      (click)="toggleThemeDropdown()">
                      <div class="theme-preview">
                        <div class="theme-preview-colors">
                          <div class="theme-color primary" [style.background]="getCurrentThemeColors().primary"></div>
                          <div class="theme-color background" [style.background]="getCurrentBackgroundColor()"></div>
                        </div>
                        <span class="theme-name">{{ getThemeName(currentTheme) }}</span>
                      </div>
                      <i class="fas fa-chevron-down" [class.rotated]="themeDropdownOpen"></i>
                    </button>
                    <div class="theme-options" *ngIf="themeDropdownOpen">
                      <button 
                        *ngFor="let theme of themes"
                        class="theme-option"
                        [class.active]="theme.value === currentTheme"
                        (click)="selectTheme(theme.value)">
                        <div class="theme-colors">
                          <div class="color-primary" [style.background]="theme.primary"></div>
                          <div class="color-secondary" [style.background]="theme.secondary"></div>
                          <div class="color-background" [style.background]="theme.background"></div>
                        </div>
                        <span class="theme-option-name">{{ theme.name }}</span>
                        <i class="fas fa-check" *ngIf="theme.value === currentTheme"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="add-link-section">
                  <label class="add-link-label">
                    <i class="fas fa-plus-circle"></i>
                    Add
                  </label>
                  <button 
                    class="btn btn-primary add-link-btn"
                    (click)="showWizard = true"
                    title="Add Link"
                    [disabled]="editMode">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <div class="edit-mode-section">
                  <label class="add-link-label">
                    <i class="fas fa-edit"></i>
                    Edit
                  </label>
                  <button 
                    class="btn edit-mode-btn"
                    [class.btn-warning]="editMode"
                    [class.btn-secondary]="!editMode"
                    (click)="toggleEditMode()"
                    [title]="editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'">
                    <i [class]="editMode ? 'fas fa-check' : 'fas fa-edit'"></i>
                  </button>
                </div>

                <div class="admin-section" *ngIf="isAdmin()">
                  <label class="add-link-label">
                    <i class="fas fa-user-shield"></i>
                    Admin
                  </label>
                  <button 
                    class="btn btn-warning admin-btn"
                    (click)="goToAdmin()"
                    title="Admin Dashboard">
                    <i class="fas fa-cog"></i>
                  </button>
                </div>

                <div class="sign-out-section">
                  <label class="add-link-label">
                    <i class="fas fa-sign-out-alt"></i>
                    Account
                  </label>
                  <button 
                    class="btn btn-secondary sign-out-btn"
                    (click)="signOut()"
                    title="Sign Out">
                    <i class="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="container">
          <!-- View Tabs -->
          <div class="view-tabs" *ngIf="views.length > 0">
            <div class="tabs-container">
              <button 
                *ngFor="let view of views"
                class="tab-button"
                [class.active]="currentView?.id === view.id"
                (click)="selectView(view)"
                [style.--tab-color]="view.color">
                <div class="tab-content">
                  <div class="tab-icon" [style.background]="view.color">
                    <i [class]="view.icon"></i>
                  </div>
                  <span class="tab-name">{{ view.name }}</span>
                  <span class="link-count" *ngIf="getViewLinkCount(view.id) > 0">
                    {{ getViewLinkCount(view.id) }}
                  </span>
                </div>
              </button>
              
              <button 
                class="tab-button add-view-tab"
                (click)="showViewWizard = true"
                title="Create New View">
                <div class="tab-content">
                  <div class="tab-icon add-icon">
                    <i class="fas fa-plus"></i>
                  </div>
                  <span class="tab-name">New View</span>
                </div>
              </button>
            </div>
            
            <div class="view-actions" *ngIf="currentView && !currentView.isDefault">
              <button 
                class="btn btn-sm btn-secondary"
                (click)="editCurrentView()"
                title="Edit View">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn btn-sm btn-danger"
                (click)="deleteCurrentView()"
                title="Delete View">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="search-section mb-6">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-input search-input"
                placeholder="Search your links..."
                [(ngModel)]="searchQuery"
                (input)="onSearchChange()">
            </div>
            
            <div class="tags-filter mt-4" *ngIf="availableTags.length > 0">
              <span class="filter-label">Filter by tags:</span>
              <div class="tags-list">
                <button 
                  *ngFor="let tag of availableTags"
                  class="tag-filter"
                  [class.active]="selectedTags.includes(tag)"
                  (click)="toggleTag(tag)">
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <div class="links-grid" *ngIf="filteredLinks.length > 0" [class.edit-mode]="editMode">
            <div class="grid grid-cols-4">
              <app-link-card 
                *ngFor="let link of filteredLinks; let i = index"
                [link]="link"
                [editMode]="editMode"
                [index]="i"
                [currentViewId]="currentView?.id || null"
                [isDefaultView]="currentView?.isDefault || false"
                (edit)="editLink($event)"
                (delete)="deleteLink($event)"
                (removeFromView)="removeLinkFromView($event)"
                (reorder)="reorderLinks($event)">
              </app-link-card>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredLinks.length === 0">
            <div class="empty-state-content">
              <i class="fas fa-link empty-icon"></i>
              <h3>No links found</h3>
              <p *ngIf="searchQuery || selectedTags.length > 0">
                Try adjusting your search or filters
              </p>
              <p *ngIf="!searchQuery && selectedTags.length === 0 && !editMode">
                Get started by adding your first quick link
              </p>
              <p *ngIf="editMode">
                Exit edit mode to add new links
              </p>
              <button 
                class="btn btn-primary mt-4"
                (click)="showWizard = true"
                [disabled]="editMode"
                *ngIf="!editMode">
                <i class="fas fa-plus"></i>
                Add Your First Link
              </button>
            </div>
          </div>

          <div class="edit-mode-banner" *ngIf="editMode && filteredLinks.length > 0">
            <div class="banner-content">
              <i class="fas fa-info-circle"></i>
              <span>Edit mode active: Tap edit/delete buttons or drag to reorder links</span>
              <button class="btn btn-sm btn-warning" (click)="toggleEditMode()">
                <i class="fas fa-check"></i>
                Done
              </button>
            </div>
          </div>

          <div class="cluster-notice-banner" *ngIf="hasClusterLinks() && !clusterNoticedismissed">
            <div class="banner-content">
              <i class="fas fa-layer-group"></i>
              <span>You have cluster links! For best experience, <strong>allow popups</strong> for this site to open multiple URLs at once.</span>
              <button class="btn btn-sm btn-secondary" (click)="showClusterHelp()">
                <i class="fas fa-question-circle"></i>
                Help
              </button>
              <button class="btn btn-sm btn-secondary" (click)="dismissClusterNotice(false)">
                <i class="fas fa-times"></i>
                Dismiss
              </button>
              <button class="btn btn-sm btn-secondary" (click)="dismissClusterNotice(true)">
                <i class="fas fa-eye-slash"></i>
                Don't show again
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <app-link-wizard
      *ngIf="showWizard"
      [editLink]="editingLink"
      (save)="onLinkSave($event)"
      (cancel)="onWizardCancel()">
    </app-link-wizard>

    <app-view-wizard
      *ngIf="showViewWizard"
      [editView]="editingView"
      [availableLinks]="links"
      (save)="onViewSave($event)"
      (cancel)="onViewWizardCancel()">
    </app-view-wizard>
  `,
  styles: [`
    .dashboard-header {
      background: linear-gradient(135deg, var(--surface-color) 0%, var(--background-color) 100%);
      border-bottom: 1px solid var(--border-color);
      padding: 2.5rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .dashboard-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 1rem;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dashboard-title i {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 2.5rem;
      align-items: end;
      width: 100%;
      min-width: 450px;
    }

    .actions-grid.admin {
      grid-template-columns: 1fr auto auto auto auto;
      min-width: 550px;
    }

    .theme-selector,
    .add-link-section,
    .edit-mode-section,
    .admin-section,
    .sign-out-section {
      position: relative;
    }

    .theme-label,
    .add-link-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .theme-label i,
    .add-link-label i {
      color: var(--primary-color);
      font-size: 1rem;
    }

    .theme-dropdown {
      position: relative;
      min-width: 180px;
    }

    .theme-current {
      width: 100%;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .theme-current:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .theme-dropdown.open .theme-current {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .theme-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .theme-preview-colors {
      display: flex;
      gap: 0.25rem;
    }

    .theme-color {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .theme-color.background {
      border: 2px solid var(--border-color);
    }

    .theme-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .theme-current i {
      color: var(--text-secondary);
      transition: transform 0.3s ease;
      font-size: 0.75rem;
    }

    .theme-current i.rotated {
      transform: rotate(180deg);
    }

    .theme-options {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 320px;
      overflow-y: auto;
      animation: dropdownSlide 0.3s ease;
    }

    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .theme-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid var(--border-color);
    }

    .theme-option:last-child {
      border-bottom: none;
    }

    .theme-option:hover {
      background: var(--background-color);
      transform: translateX(4px);
    }

    .theme-option.active {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
    }

    .theme-option.active .theme-option-name {
      color: white;
      font-weight: 600;
    }

    .theme-colors {
      display: flex;
      gap: 0.25rem;
    }

    .color-primary,
    .color-secondary,
    .color-background {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .color-background {
      border: 2px solid rgba(0, 0, 0, 0.2);
    }

    .theme-option-name {
      flex: 1;
      text-align: left;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .theme-option i {
      color: white;
      font-size: 0.875rem;
    }

    .add-link-btn {
      width: 100%;
      min-width: 3.5rem;
      height: 3.5rem;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .add-link-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .add-link-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-link-btn i {
      font-size: 1.25rem;
    }

    .edit-mode-btn {
      width: 100%;
      min-width: 3.5rem;
      height: 3.5rem;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .edit-mode-btn:hover {
      transform: translateY(-2px);
    }

    .edit-mode-btn i {
      font-size: 1.25rem;
    }

    .sign-out-btn {
      width: 100%;
      min-width: 3.5rem;
      height: 3.5rem;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sign-out-btn:hover {
      transform: translateY(-2px);
    }

    .sign-out-btn i {
      font-size: 1.25rem;
    }

    .admin-btn {
      width: 100%;
      min-width: 3.5rem;
      height: 3.5rem;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #f59e0b;
      color: white;
    }

    .admin-btn:hover {
      background: #d97706;
      transform: translateY(-2px);
    }

    .admin-btn i {
      font-size: 1.25rem;
    }

    .dashboard-main {
      padding: 2rem 0;
    }

    .search-box {
      position: relative;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
    }

    .search-input {
      padding-left: 2.5rem;
    }

    .tags-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .filter-label {
      font-weight: 500;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-filter {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--border-color);
      background-color: var(--surface-color);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tag-filter:hover,
    .tag-filter.active {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .links-grid {
      margin-top: 2rem;
    }

    .links-grid.edit-mode {
      animation: none;
    }

    .links-grid.edit-mode .link-card {
      animation: wiggle 0.5s ease-in-out infinite alternate;
    }

    @keyframes wiggle {
      0% {
        transform: rotate(-1deg) scale(1.02);
      }
      100% {
        transform: rotate(1deg) scale(1.02);
      }
    }

    .edit-mode-banner {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 1px solid #f59e0b;
      border-radius: var(--radius-lg);
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.875rem;
      color: #92400e;
    }

    .banner-content i {
      color: #f59e0b;
      font-size: 1rem;
    }

    .banner-content span {
      flex: 1;
      font-weight: 500;
    }

    .cluster-notice-banner {
      background: linear-gradient(135deg, #e0f2fe, #b3e5fc);
      border: 1px solid #0288d1;
      border-radius: var(--radius-lg);
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(2, 136, 209, 0.15);
    }

    .cluster-notice-banner .banner-content {
      color: #01579b;
    }

    .cluster-notice-banner i {
      color: #0288d1;
      font-size: 1rem;
    }

    .view-tabs {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .tabs-container {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      flex: 1;
    }

    .tab-button {
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      background: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      min-width: fit-content;
    }

    .tab-button:hover {
      transform: translateY(-1px);
    }

    .tab-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      background-color: var(--surface-color);
      transition: all 0.3s ease;
    }

    .tab-button.active .tab-content {
      border-color: var(--tab-color, var(--primary-color));
      background-color: var(--background-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-icon {
      width: 2rem;
      height: 2rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .tab-icon.add-icon {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    }

    .tab-name {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .link-count {
      background-color: var(--tab-color, var(--primary-color));
      color: white;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem;
      border-radius: 50%;
      min-width: 1.5rem;
      min-height: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-view-tab .tab-content {
      border-style: dashed;
      border-color: var(--primary-color);
      opacity: 0.8;
    }

    .add-view-tab:hover .tab-content {
      opacity: 1;
      background-color: var(--primary-color);
      border-style: solid;
    }

    .add-view-tab:hover .tab-name {
      color: white;
    }

    .view-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
    }

    .empty-state-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    @media (max-width: 968px) {
      .header-content {
        gap: 2rem;
        padding: 0 1rem;
      }

      .dashboard-title {
        font-size: 2rem;
      }

      .header-actions {
        gap: 1.5rem;
      }

      .theme-dropdown {
        min-width: 160px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        padding: 1.5rem 0;
      }

      .header-content {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
      }

      .dashboard-title {
        font-size: 1.75rem;
        justify-content: center;
        text-align: center;
      }

      .actions-grid {
        grid-template-columns: 1fr auto auto;
        gap: 1.5rem;
        min-width: auto;
      }

      .view-tabs {
        flex-direction: column;
        gap: 1rem;
      }

      .tabs-container {
        justify-content: flex-start;
      }

      .view-actions {
        justify-content: center;
      }

      .theme-dropdown {
        min-width: 160px;
      }

      .add-link-btn {
        min-width: 3rem;
        height: 3rem;
        font-size: 1rem;
      }

      .add-link-btn i {
        font-size: 1rem;
      }

      .search-box {
        max-width: none;
      }

      .tags-filter {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .actions-grid {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        justify-items: stretch;
      }

      .banner-content {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
      }

      .tab-content {
        padding: 0.5rem 0.75rem;
      }

      .tab-name {
        font-size: 0.75rem;
      }

      .add-link-section {
        justify-self: center;
      }

      .add-link-btn {
        width: 3rem;
        height: 3rem;
        margin: 0 auto;
      }

      .theme-dropdown {
        min-width: auto;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  showWizard = false;
  editingLink: QuickLink | null = null;
  currentTheme: Theme = 'light';
  themeDropdownOpen = false;
  searchQuery = '';
  selectedTags: string[] = [];
  editMode = false;
  showViewWizard = false;
  editingView: View | null = null;
  clusterNoticedismissed = false;
  
  links: QuickLink[] = [];
  filteredLinks: QuickLink[] = [];
  availableTags: string[] = [];
  
  views: View[] = [];
  currentView: View | null = null;

  themes = [
    { value: 'light' as Theme, name: 'Light', primary: '#667eea', secondary: '#764ba2', background: '#f8fafc' },
    { value: 'dark' as Theme, name: 'Dark', primary: '#6366f1', secondary: '#8b5cf6', background: '#0f172a' },
    { value: 'ocean' as Theme, name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4', background: '#f0f9ff' },
    { value: 'forest' as Theme, name: 'Forest', primary: '#059669', secondary: '#10b981', background: '#f0fdf4' },
    { value: 'sunset' as Theme, name: 'Sunset', primary: '#f59e0b', secondary: '#f97316', background: '#fffbeb' },
    { value: 'rose' as Theme, name: 'Rose', primary: '#e11d48', secondary: '#f43f5e', background: '#fff1f2' },
    { value: 'purple' as Theme, name: 'Purple', primary: '#8b5cf6', secondary: '#a855f7', background: '#faf5ff' },
    { value: 'emerald' as Theme, name: 'Emerald', primary: '#10b981', secondary: '#34d399', background: '#ecfdf5' },
    { value: 'slate' as Theme, name: 'Slate', primary: '#64748b', secondary: '#94a3b8', background: '#f8fafc' },
    { value: 'cyber' as Theme, name: 'Cyber', primary: '#00d9ff', secondary: '#1de9b6', background: '#0a0a0a' },
    { value: 'warm' as Theme, name: 'Warm', primary: '#dc2626', secondary: '#ea580c', background: '#fefaf8' }
  ];

  getCurrentThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--primary-color').trim(),
      secondary: style.getPropertyValue('--secondary-color').trim()
    };
  }

  getCurrentBackgroundColor(): string {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--background-color').trim();
  }


  constructor(
    private themeService: ThemeService,
    private linksService: LinksService,
    private viewsService: ViewsService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    
    // Check if cluster notice was permanently dismissed
    this.clusterNoticedismissed = localStorage.getItem('clusterNoticeDissmissedPermanently') === 'true';
    
    // Subscribe to links from the service
    this.linksService.getUserLinks().subscribe(links => {
      this.links = links;
      this.updateFilteredLinks();
      this.updateAvailableTags();
    });
    
    // Subscribe to views from the service
    this.viewsService.getUserViews().subscribe(views => {
      this.views = views;
    });
    
    // Subscribe to current view
    this.viewsService.getCurrentView().subscribe(view => {
      this.currentView = view;
      this.updateFilteredLinks();
    });
  }

  toggleThemeDropdown() {
    this.themeDropdownOpen = !this.themeDropdownOpen;
  }

  selectTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.themeDropdownOpen = false;
  }

  getThemeColor(theme: Theme): string {
    if (theme === this.currentTheme) {
      return this.getCurrentThemeColors().primary;
    }
    const themeData = this.themes.find(t => t.value === theme);
    return themeData ? themeData.primary : '#667eea';
  }

  getThemeName(theme: Theme): string {
    const themeData = this.themes.find(t => t.value === theme);
    return themeData ? themeData.name : 'Light';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.theme-dropdown');
    if (!dropdown && this.themeDropdownOpen) {
      this.themeDropdownOpen = false;
    }
  }

  onSearchChange() {
    this.updateFilteredLinks();
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.updateFilteredLinks();
  }

  updateFilteredLinks() {
    let filtered = this.links;
    
    // Filter by current view first
    if (this.currentView) {
      if (this.currentView.isDefault) {
        // Default "All Links" view shows all links
        filtered = this.links;
      } else {
        // Custom view shows only links that belong to this view
        filtered = this.links.filter(link => 
          link.viewIds && link.viewIds.includes(this.currentView!.id)
        );
      }
    }

    // Then apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query) ||
        link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Finally apply tag filter
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(link =>
        this.selectedTags.some(selectedTag => 
          link.tags.includes(selectedTag)
        )
      );
    }

    this.filteredLinks = filtered;
  }

  editLink(link: QuickLink) {
    this.editingLink = link;
    this.showWizard = true;
  }

  async deleteLink(linkId: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await this.linksService.deleteLink(linkId);
        // The service will automatically update the links observable
      } catch (error) {
        console.error('Error deleting link:', error);
        alert('Failed to delete link. Please try again.');
      }
    }
  }

  async onLinkSave(linkData: any) {
    try {
      if (this.editingLink) {
        await this.linksService.updateLink(this.editingLink.id, linkData);
      } else {
        // Add to current view only (not to "All Links" if we're in a custom view)
        const viewId = this.currentView && !this.currentView.isDefault ? 
          this.currentView.id : undefined;
        
        const newLink = await this.linksService.addLink(linkData, viewId);
        
        // If we're in a custom view, make sure the link is associated properly
        if (viewId && this.currentView) {
          await this.viewsService.addLinkToView(viewId, newLink.id);
        }
      }
      this.onWizardCancel();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Failed to save link. Please try again.');
    }
  }

  onWizardCancel() {
    this.showWizard = false;
    this.editingLink = null;
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  isAdmin(): boolean {
    return this.adminService.isAdmin();
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    // Reset any search/filter when entering edit mode to show all links
    if (this.editMode) {
      this.searchQuery = '';
      this.selectedTags = [];
      this.updateFilteredLinks();
    }
  }

  reorderLinks(event: { fromIndex: number; toIndex: number }) {
    const item = this.filteredLinks.splice(event.fromIndex, 1)[0];
    this.filteredLinks.splice(event.toIndex, 0, item);
    
    // Update the original links array order
    this.links = [...this.filteredLinks];
    this.updateAvailableTags();
  }

  selectView(view: View) {
    this.viewsService.setCurrentView(view);
  }

  getViewLinkCount(viewId: string): number {
    const view = this.views.find(v => v.id === viewId);
    if (view?.isDefault) {
      // "All Links" shows total count
      return this.links.length;
    }
    // Custom views show only links belonging to that view
    return this.links.filter(link => link.viewIds && link.viewIds.includes(viewId)).length;
  }

  editCurrentView() {
    if (this.currentView && !this.currentView.isDefault) {
      this.editingView = this.currentView;
      this.showViewWizard = true;
    }
  }

  async deleteCurrentView() {
    if (!this.currentView || this.currentView.isDefault) return;
    
    if (confirm(`Are you sure you want to delete the "${this.currentView.name}" view? Links in this view will not be deleted.`)) {
      try {
        await this.viewsService.deleteView(this.currentView.id);
      } catch (error) {
        console.error('Error deleting view:', error);
        alert('Failed to delete view. Please try again.');
      }
    }
  }

  async onViewSave(viewData: any) {
    try {
      if (this.editingView) {
        await this.viewsService.updateView(this.editingView.id, viewData);
      } else {
        const newView = await this.viewsService.createView(viewData);
        this.viewsService.setCurrentView(newView);
      }
      this.onViewWizardCancel();
    } catch (error) {
      console.error('Error saving view:', error);
      alert('Failed to save view. Please try again.');
    }
  }

  onViewWizardCancel() {
    this.showViewWizard = false;
    this.editingView = null;
  }

  async removeLinkFromView(event: { linkId: string; viewId: string }) {
    if (confirm('Remove this link from the current view? The link will still exist in other views.')) {
      try {
        await this.viewsService.removeLinkFromView(event.viewId, event.linkId);
        await this.linksService.removeLinkFromView(event.linkId, event.viewId);
      } catch (error) {
        console.error('Error removing link from view:', error);
        alert('Failed to remove link from view. Please try again.');
      }
    }
  }

  hasClusterLinks(): boolean {
    return this.links.some(link => link.isCluster);
  }

  showClusterHelp() {
    const helpMessage = `Cluster links open multiple URLs at once.

To use clusters properly, please allow popups:

• Chrome: Click popup blocked icon in address bar → "Always allow"
• Firefox: Click shield icon → "Disable Blocking"  
• Safari: Safari → Preferences → Websites → Pop-up Windows → Allow
• Edge: Click popup blocked icon → "Always allow"

Look for orange badges on cluster links!`;
    
    alert(helpMessage);
  }

  dismissClusterNotice(permanent: boolean) {
    this.clusterNoticedismissed = true;
    if (permanent) {
      // Store permanent dismissal in localStorage
      localStorage.setItem('clusterNoticeDissmissedPermanently', 'true');
    }
  }

  private updateAvailableTags() {
    const tagSet = new Set<string>();
    this.filteredLinks.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    this.availableTags = Array.from(tagSet).sort();
  }
}