import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickLink } from '../../models/link.model';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="link-card" 
         [class.edit-mode]="editMode"
         (click)="!editMode && openLink()"
         draggable="{{editMode}}"
         (dragstart)="onDragStart($event)"
         (dragover)="onDragOver($event)"
         (drop)="onDrop($event)">
      <div class="card-header">
        <div class="icon-container">
          <i [class]="link.icon"></i>
          <div class="cluster-badge" *ngIf="link.isCluster" title="{{ link.clusterUrls.length }} URLs in cluster">
            <i class="fas fa-layer-group"></i>
            <span>{{ link.clusterUrls.length }}</span>
          </div>
        </div>
        <div class="card-actions" [class.always-visible]="editMode">
          <button 
            class="action-btn"
            (click)="onEdit($event)"
            title="Edit link">
            <i class="fas fa-edit"></i>
          </button>
          
          <!-- Show remove from view button only for non-default views -->
          <button 
            *ngIf="!isDefaultView && currentViewId"
            class="action-btn remove-btn"
            (click)="onRemoveFromView($event)"
            title="Remove from this view">
            <i class="fas fa-minus"></i>
          </button>
          
          <button 
            class="action-btn delete-btn"
            (click)="onDelete($event)"
            [title]="isDefaultView ? 'Delete link permanently' : 'Delete link from all views'">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title">{{ link.title }}</h3>
        <p class="card-description" *ngIf="link.description">
          {{ link.description }}
        </p>
        <div class="card-url">
          <i class="fas fa-external-link-alt"></i>
          {{ getDisplayUrl() }}
        </div>
      </div>

      <div class="card-footer" *ngIf="link.tags.length > 0">
        <div class="tags">
          <span 
            *ngFor="let tag of link.tags.slice(0, 3)"
            class="tag">
            {{ tag }}
          </span>
          <span 
            *ngIf="link.tags.length > 3"
            class="tag-more">
            +{{ link.tags.length - 3 }} more
          </span>
        </div>
      </div>

      <div class="card-hover-overlay" *ngIf="!editMode">
        <i [class]="link.isCluster ? 'fas fa-layer-group' : 'fas fa-external-link-alt'"></i>
        <span>{{ link.isCluster ? 'Open Cluster' : 'Open Link' }}</span>
      </div>
      
      <div class="drag-indicator" *ngIf="editMode">
        <i class="fas fa-grip-vertical"></i>
      </div>
    </div>
  `,
  styles: [`
    .link-card {
      position: relative;
      background-color: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }

    .link-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-color);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .icon-container {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-container i {
      font-size: 1.5rem;
      color: white;
    }

    .card-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .link-card:hover .card-actions,
    .card-actions.always-visible {
      opacity: 1;
    }

    .action-btn {
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: var(--radius-sm);
      background-color: var(--background-color);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background-color: var(--primary-color);
      color: white;
    }

    .delete-btn:hover {
      background-color: #ef4444;
    }

    .remove-btn:hover {
      background-color: #f97316;
    }

    .card-content {
      flex: 1;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .card-description {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-url {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }

    .card-url i {
      opacity: 0.7;
    }

    .card-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .tag {
      padding: 0.25rem 0.5rem;
      background-color: var(--background-color);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.625rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .tag-more {
      padding: 0.25rem 0.5rem;
      font-size: 0.625rem;
      color: var(--text-secondary);
      font-style: italic;
    }

    .card-hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      opacity: 0;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .card-hover-overlay i {
      font-size: 2rem;
    }

    .link-card:hover .card-hover-overlay {
      opacity: 0.95;
    }

    .link-card.edit-mode {
      cursor: grab;
      transform: scale(1.02);
    }

    .link-card.edit-mode:active {
      cursor: grabbing;
    }

    .drag-indicator {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background-color: var(--primary-color);
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      opacity: 0.8;
      z-index: 10;
    }

    .icon-container {
      position: relative;
    }

    .cluster-badge {
      position: absolute;
      top: -0.35rem;
      right: -0.35rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border-radius: 50%;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
      border: 2px solid white;
      z-index: 10;
    }

    .cluster-badge i {
      display: none;
    }

    @media (max-width: 640px) {
      .link-card {
        min-height: 160px;
        padding: 1rem;
      }

      .icon-container {
        width: 2.5rem;
        height: 2.5rem;
      }

      .icon-container i {
        font-size: 1.25rem;
      }

      .card-title {
        font-size: 1rem;
      }
    }
  `]
})
export class LinkCardComponent {
  @Input() link!: QuickLink;
  @Input() editMode = false;
  @Input() index = 0;
  @Input() currentViewId: string | null = null;
  @Input() isDefaultView = false;
  @Output() edit = new EventEmitter<QuickLink>();
  @Output() delete = new EventEmitter<string>();
  @Output() removeFromView = new EventEmitter<{ linkId: string; viewId: string }>();
  @Output() reorder = new EventEmitter<{ fromIndex: number; toIndex: number }>();

  openLink() {
    if (this.link.isCluster && this.link.clusterUrls.length > 0) {
      this.openCluster();
    } else {
      window.open(this.link.url, '_blank', 'noopener,noreferrer');
    }
  }

  private openCluster() {
    if (this.link.clusterUrls.length === 0) return;
    
    // Open each URL as a new tab
    this.link.clusterUrls.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, index * 50);
    });
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.link);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.link.id);
  }

  onRemoveFromView(event: Event) {
    event.stopPropagation();
    if (this.currentViewId) {
      this.removeFromView.emit({ linkId: this.link.id, viewId: this.currentViewId });
    }
  }

  getDisplayUrl(): string {
    try {
      const url = new URL(this.link.url);
      return url.hostname;
    } catch {
      return this.link.url;
    }
  }

  onDragStart(event: DragEvent) {
    if (!this.editMode) {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData('text/plain', this.index.toString());
  }

  onDragOver(event: DragEvent) {
    if (!this.editMode) return;
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    if (!this.editMode) return;
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0');
    const toIndex = this.index;
    
    if (fromIndex !== toIndex) {
      this.reorder.emit({ fromIndex, toIndex });
    }
  }
}