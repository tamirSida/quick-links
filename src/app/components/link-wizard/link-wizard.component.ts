import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickLink, CreateLinkRequest } from '../../models/link.model';
import { DEV_ICONS, ICON_CATEGORIES } from '../../data/dev-icons';

@Component({
  selector: 'app-link-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wizard-overlay" (click)="onOverlayClick($event)">
      <div class="wizard-modal" (click)="$event.stopPropagation()">
        <div class="wizard-header">
          <h2 class="wizard-title">
            <i class="fas fa-magic"></i>
            {{ editLink ? 'Edit Link' : 'Add New Link' }}
          </h2>
          <button class="close-btn" (click)="onCancel()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form class="wizard-form" (ngSubmit)="onSubmit()" #linkForm="ngForm">
          <div class="form-step">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-heading"></i>
                Title *
              </label>
              <input
                type="text"
                class="form-input"
                placeholder="Enter link title"
                [(ngModel)]="formData.title"
                name="title"
                required
                #titleInput="ngModel">
              <div class="error-message" *ngIf="titleInput.invalid && titleInput.touched">
                Title is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-align-left"></i>
                Description
              </label>
              <textarea
                class="form-input"
                placeholder="Brief description of this link"
                [(ngModel)]="formData.description"
                name="description"
                rows="3">
              </textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-link"></i>
                URL *
              </label>
              <input
                type="url"
                class="form-input"
                [placeholder]="formData.isCluster ? 'Main URL (optional for clusters)' : 'https://example.com'"
                [(ngModel)]="formData.url"
                name="url"
                [required]="!formData.isCluster"
                #urlInput="ngModel">
              <div class="error-message" *ngIf="urlInput.invalid && urlInput.touched && !formData.isCluster">
                Please enter a valid URL
              </div>
            </div>

            <!-- Cluster Toggle -->
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isCluster"
                  name="isCluster"
                  (change)="onClusterToggle()">
                <i class="fas fa-layer-group"></i>
                Create Cluster (multiple links)
              </label>
              <div class="help-section" *ngIf="formData.isCluster">
                <p class="help-text">
                  Clusters allow you to open multiple URLs at once. Add 2 or more URLs below.
                </p>
                <div class="popup-notice">
                  <i class="fas fa-info-circle"></i>
                  <span><strong>Note:</strong> Please allow popups for this site to use clusters. 
                  <a href="#" (click)="showPopupHelp($event)">Need help?</a></span>
                </div>
              </div>
            </div>

            <!-- Cluster URLs -->
            <div class="form-group" *ngIf="formData.isCluster">
              <label class="form-label">
                <i class="fas fa-globe"></i>
                Cluster URLs * ({{ (formData.clusterUrls || []).length }} URLs)
              </label>
              
              <div class="cluster-url-input">
                <input
                  type="url"
                  class="form-input"
                  placeholder="https://example.com"
                  [(ngModel)]="currentClusterUrl"
                  name="currentClusterUrl"
                  (keydown.enter)="addClusterUrl($event)">
                <button
                  type="button"
                  class="btn btn-sm btn-secondary"
                  (click)="addClusterUrl($event)"
                  [disabled]="!currentClusterUrl.trim()">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              
              <div class="cluster-urls-list" *ngIf="formData.clusterUrls && formData.clusterUrls.length > 0">
                <div
                  *ngFor="let url of formData.clusterUrls; let i = index"
                  class="cluster-url-item">
                  <i class="fas fa-link"></i>
                  <span class="url-text">{{ getDisplayUrl(url) }}</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    (click)="removeClusterUrl(i)"
                    title="Remove URL">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div class="error-message" *ngIf="formData.isCluster && (!formData.clusterUrls || formData.clusterUrls.length < 2)">
                Please add at least 2 URLs for a cluster
              </div>
            </div>


            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-icons"></i>
                Icon
              </label>
              <div class="icon-selector">
                <div class="icon-categories">
                  <button
                    *ngFor="let category of iconCategories"
                    type="button"
                    class="category-btn"
                    [class.active]="selectedCategory === category"
                    (click)="selectCategory(category)">
                    {{ category }}
                  </button>
                </div>
                
                <div class="icon-preview" *ngIf="formData.icon">
                  <div class="selected-icon">
                    <i [class]="formData.icon"></i>
                    <span>{{ getIconLabel(formData.icon) }}</span>
                  </div>
                </div>

                <div class="icon-grid">
                  <button
                    *ngFor="let icon of filteredIcons"
                    type="button"
                    class="icon-option"
                    [class.selected]="formData.icon === icon.value"
                    (click)="selectIcon(icon.value)"
                    [title]="icon.label">
                    <i [class]="icon.value"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tags"></i>
                Tags
              </label>
              <div class="tags-input-container">
                <input
                  type="text"
                  class="form-input tags-input"
                  placeholder="Add a tag and press Enter"
                  [(ngModel)]="currentTag"
                  name="currentTag"
                  (keydown.enter)="addTag($event)">
                <div class="tags-list" *ngIf="formData.tags.length > 0">
                  <span
                    *ngFor="let tag of formData.tags; let i = index"
                    class="tag">
                    {{ tag }}
                    <button
                      type="button"
                      class="tag-remove"
                      (click)="removeTag(i)">
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              <i class="fas fa-times"></i>
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="linkForm.invalid || (formData.isCluster && (!formData.clusterUrls || formData.clusterUrls.length < 2))">
              <i class="fas fa-save"></i>
              {{ editLink ? 'Update' : 'Save' }} Link
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .wizard-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .wizard-modal {
      background-color: var(--surface-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid var(--border-color);
    }

    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .wizard-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .wizard-title i {
      color: var(--primary-color);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
    }

    .close-btn:hover {
      background-color: var(--background-color);
      color: var(--text-primary);
    }

    .wizard-form {
      padding: 1.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-label i {
      color: var(--text-secondary);
      width: 1rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .icon-selector {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .icon-categories {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--background-color);
    }

    .category-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      background: none;
      font-size: 0.75rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .category-btn:hover,
    .category-btn.active {
      background-color: var(--primary-color);
      color: white;
    }

    .icon-preview {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--background-color);
    }

    .selected-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }

    .selected-icon i {
      font-size: 1.5rem;
      color: var(--primary-color);
      width: 2rem;
      text-align: center;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
      gap: 0.25rem;
      padding: 1rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .icon-option {
      aspect-ratio: 1;
      border: 1px solid var(--border-color);
      background-color: var(--surface-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-option:hover {
      background-color: var(--background-color);
      border-color: var(--primary-color);
    }

    .icon-option.selected {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .icon-option i {
      font-size: 1.25rem;
    }

    .tags-input-container {
      space-y: 0.75rem;
    }

    .tags-input {
      margin-bottom: 0.75rem;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background-color: var(--primary-color);
      color: white;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-remove {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .tag-remove:hover {
      opacity: 1;
    }

    .wizard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      margin-top: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .help-section {
      margin-top: 0.5rem;
    }

    .help-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
      font-style: italic;
    }

    .popup-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 1px solid #f59e0b;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
    }

    .popup-notice i {
      color: #f59e0b;
      font-size: 0.875rem;
    }

    .popup-notice a {
      color: #d97706;
      text-decoration: underline;
      font-weight: 500;
    }

    .popup-notice a:hover {
      color: #92400e;
    }

    .cluster-url-input {
      display: flex;
      gap: 0.5rem;
    }

    .cluster-url-input .form-input {
      flex: 1;
    }

    .cluster-urls-list {
      margin-top: 1rem;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .cluster-url-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--surface-color);
    }

    .cluster-url-item:last-child {
      border-bottom: none;
    }

    .cluster-url-item i {
      color: var(--primary-color);
      width: 1rem;
    }

    .url-text {
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-primary);
      word-break: break-all;
    }


    @media (max-width: 640px) {
      .wizard-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .icon-grid {
        grid-template-columns: repeat(auto-fit, minmax(2.5rem, 1fr));
      }

      .wizard-actions {
        flex-direction: column;
      }

      .cluster-url-input {
        flex-direction: column;
      }
    }
  `]
})
export class LinkWizardComponent implements OnInit {
  @Input() editLink: QuickLink | null = null;
  @Output() save = new EventEmitter<CreateLinkRequest>();
  @Output() cancel = new EventEmitter<void>();

  formData: CreateLinkRequest = {
    title: '',
    description: '',
    url: '',
    icon: 'fas fa-link',
    tags: [],
    isCluster: false,
    clusterUrls: []
  };

  currentTag = '';
  currentClusterUrl = '';
  selectedCategory = 'All';
  iconCategories = ICON_CATEGORIES;
  devIcons = DEV_ICONS;

  get filteredIcons() {
    if (this.selectedCategory === 'All') {
      return this.devIcons;
    }
    return this.devIcons.filter(icon => icon.category === this.selectedCategory);
  }

  ngOnInit() {
    if (this.editLink) {
      this.formData = {
        title: this.editLink.title,
        description: this.editLink.description,
        url: this.editLink.url,
        icon: this.editLink.icon,
        tags: [...this.editLink.tags],
        isCluster: this.editLink.isCluster || false,
        clusterUrls: [...(this.editLink.clusterUrls || [])]
      };
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  selectIcon(icon: string) {
    this.formData.icon = icon;
  }

  getIconLabel(iconValue: string): string {
    const icon = this.devIcons.find(i => i.value === iconValue);
    return icon ? icon.label : 'Custom Icon';
  }

  addTag(event: Event) {
    event.preventDefault();
    const tag = this.currentTag.trim();
    if (tag && !this.formData.tags.includes(tag)) {
      this.formData.tags.push(tag);
      this.currentTag = '';
    }
  }

  removeTag(index: number) {
    this.formData.tags.splice(index, 1);
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.save.emit(this.formData);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onClusterToggle() {
    if (this.formData.isCluster) {
      // Initialize cluster arrays
      this.formData.clusterUrls = this.formData.clusterUrls || [];
      // If there's a main URL, add it to cluster URLs
      if (this.formData.url && this.formData.url.trim()) {
        this.formData.clusterUrls.push(this.formData.url);
        this.formData.url = ''; // Clear main URL for clusters
      }
    } else {
      // If switching back to single link, take first cluster URL as main URL
      if (this.formData.clusterUrls && this.formData.clusterUrls.length > 0) {
        this.formData.url = this.formData.clusterUrls[0];
      }
      this.formData.clusterUrls = [];
    }
  }

  addClusterUrl(event: Event) {
    event.preventDefault();
    const url = this.currentClusterUrl.trim();
    if (url && !this.formData.clusterUrls?.includes(url)) {
      this.formData.clusterUrls = this.formData.clusterUrls || [];
      this.formData.clusterUrls.push(url);
      this.currentClusterUrl = '';
    }
  }

  removeClusterUrl(index: number) {
    if (this.formData.clusterUrls) {
      this.formData.clusterUrls.splice(index, 1);
    }
  }

  getDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch {
      return url;
    }
  }

  showPopupHelp(event: Event) {
    event.preventDefault();
    const helpMessage = `To use clusters, please allow popups for this site:

• Chrome: Click the popup blocked icon in address bar → "Always allow"
• Firefox: Click the shield icon → "Disable Blocking"
• Safari: Safari menu → Preferences → Websites → Pop-up Windows → Allow
• Edge: Click the popup blocked icon → "Always allow"

Without popup permissions, only the first URL in your cluster will open.`;
    
    alert(helpMessage);
  }

  private isFormValid(): boolean {
    if (this.formData.isCluster) {
      return !!(this.formData.title.trim() && this.formData.clusterUrls && this.formData.clusterUrls.length >= 2);
    }
    return !!(this.formData.title.trim() && this.formData.url.trim());
  }
}