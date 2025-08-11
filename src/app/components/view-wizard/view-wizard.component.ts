import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { View, CreateViewRequest, DEFAULT_VIEW_COLORS, VIEW_ICONS } from '../../models/view.model';
import { QuickLink } from '../../models/link.model';

@Component({
  selector: 'app-view-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wizard-overlay" (click)="onOverlayClick($event)">
      <div class="wizard-modal" (click)="$event.stopPropagation()">
        <div class="wizard-header">
          <h2 class="wizard-title">
            <i class="fas fa-layer-group"></i>
            {{ editView ? 'Edit View' : 'Create New View' }}
          </h2>
          <button class="close-btn" (click)="onCancel()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form class="wizard-form" (ngSubmit)="onSubmit()" #viewForm="ngForm">
          <div class="form-step">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-heading"></i>
                View Name *
              </label>
              <input
                type="text"
                class="form-input"
                placeholder="Enter view name (e.g., Work, Personal, Projects)"
                [(ngModel)]="formData.name"
                name="name"
                required
                maxlength="50"
                #nameInput="ngModel">
              <div class="error-message" *ngIf="nameInput.invalid && nameInput.touched">
                View name is required
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-align-left"></i>
                Description
              </label>
              <textarea
                class="form-input"
                placeholder="Brief description of this view"
                [(ngModel)]="formData.description"
                name="description"
                rows="3"
                maxlength="200">
              </textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-icons"></i>
                Icon
              </label>
              <div class="icon-selector">
                <div class="icon-preview" *ngIf="formData.icon">
                  <div class="selected-icon" [style.background]="formData.color">
                    <i [class]="formData.icon"></i>
                    <span>{{ getIconLabel(formData.icon) }}</span>
                  </div>
                </div>

                <div class="icon-grid">
                  <button
                    *ngFor="let icon of viewIcons"
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
                <i class="fas fa-palette"></i>
                Color
              </label>
              <div class="color-selector">
                <button
                  *ngFor="let color of defaultColors"
                  type="button"
                  class="color-option"
                  [class.selected]="formData.color === color"
                  [style.background]="color"
                  (click)="selectColor(color)"
                  [title]="color">
                </button>
              </div>
            </div>

            <div class="form-group" *ngIf="availableLinks.length > 0">
              <label class="form-label">
                <i class="fas fa-link"></i>
                Links ({{ selectedLinkIds.length }} selected)
              </label>
              <div class="links-selector">
                <div class="select-all-section">
                  <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    (click)="toggleAllLinks()">
                    {{ allLinksSelected ? 'Deselect All' : 'Select All' }}
                  </button>
                </div>
                <div class="links-list">
                  <label
                    *ngFor="let link of availableLinks"
                    class="link-checkbox">
                    <input
                      type="checkbox"
                      [checked]="selectedLinkIds.includes(link.id)"
                      (change)="toggleLink(link.id, $event)">
                    <div class="link-preview">
                      <div class="link-icon">
                        <i [class]="link.icon"></i>
                      </div>
                      <div class="link-info">
                        <span class="link-title">{{ link.title }}</span>
                        <span class="link-url">{{ getDisplayUrl(link.url) }}</span>
                      </div>
                    </div>
                  </label>
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
              [disabled]="viewForm.invalid">
              <i class="fas fa-save"></i>
              {{ editView ? 'Update' : 'Create' }} View
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
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      color: white;
    }

    .selected-icon i {
      font-size: 1.5rem;
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

    .color-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background-color: var(--background-color);
    }

    .color-option {
      width: 3rem;
      height: 3rem;
      border: 3px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .color-option:hover {
      transform: scale(1.1);
      border-color: var(--border-color);
    }

    .color-option.selected {
      border-color: var(--text-primary);
      transform: scale(1.1);
    }

    .color-option.selected::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
    }

    .links-selector {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .select-all-section {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--background-color);
    }

    .links-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .link-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid var(--border-color);
    }

    .link-checkbox:last-child {
      border-bottom: none;
    }

    .link-checkbox:hover {
      background-color: var(--background-color);
    }

    .link-checkbox input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .link-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .link-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .link-icon i {
      font-size: 1rem;
      color: white;
    }

    .link-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .link-title {
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-url {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wizard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      margin-top: 1.5rem;
    }

    @media (max-width: 640px) {
      .wizard-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .color-selector {
        grid-template-columns: repeat(5, 1fr);
      }

      .wizard-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ViewWizardComponent implements OnInit {
  @Input() editView: View | null = null;
  @Input() availableLinks: QuickLink[] = [];
  @Output() save = new EventEmitter<CreateViewRequest>();
  @Output() cancel = new EventEmitter<void>();

  formData: CreateViewRequest = {
    name: '',
    description: '',
    icon: 'fas fa-folder',
    color: '#667eea',
    linkIds: []
  };

  selectedLinkIds: string[] = [];
  defaultColors = DEFAULT_VIEW_COLORS;
  viewIcons = VIEW_ICONS;

  get allLinksSelected(): boolean {
    return this.selectedLinkIds.length === this.availableLinks.length && this.availableLinks.length > 0;
  }

  ngOnInit() {
    if (this.editView) {
      this.formData = {
        name: this.editView.name,
        description: this.editView.description || '',
        icon: this.editView.icon,
        color: this.editView.color,
        linkIds: [...this.editView.linkIds]
      };
      this.selectedLinkIds = [...this.editView.linkIds];
    }
  }

  selectIcon(icon: string) {
    this.formData.icon = icon;
  }

  selectColor(color: string) {
    this.formData.color = color;
  }

  getIconLabel(iconValue: string): string {
    const icon = this.viewIcons.find(i => i.value === iconValue);
    return icon ? icon.label : 'Custom Icon';
  }

  toggleLink(linkId: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedLinkIds.includes(linkId)) {
        this.selectedLinkIds.push(linkId);
      }
    } else {
      this.selectedLinkIds = this.selectedLinkIds.filter(id => id !== linkId);
    }
  }

  toggleAllLinks() {
    if (this.allLinksSelected) {
      this.selectedLinkIds = [];
    } else {
      this.selectedLinkIds = this.availableLinks.map(link => link.id);
    }
  }

  getDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.formData.linkIds = [...this.selectedLinkIds];
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

  private isFormValid(): boolean {
    return !!(this.formData.name.trim());
  }
}