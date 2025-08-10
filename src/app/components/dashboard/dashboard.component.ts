import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../services/theme.service';
import { QuickLink } from '../../models/link.model';
import { LinkWizardComponent } from '../link-wizard/link-wizard.component';
import { LinkCardComponent } from '../link-card/link-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkWizardComponent, LinkCardComponent],
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
              <div class="theme-selector">
                <label class="form-label">Theme</label>
                <select 
                  class="form-select theme-select"
                  [value]="currentTheme"
                  (change)="onThemeChange($event)">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="ocean">Ocean</option>
                  <option value="forest">Forest</option>
                </select>
              </div>
              
              <button 
                class="btn btn-primary"
                (click)="showWizard = true">
                <i class="fas fa-plus"></i>
                Add Link
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="container">
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

          <div class="links-grid" *ngIf="filteredLinks.length > 0">
            <div class="grid grid-cols-4">
              <app-link-card 
                *ngFor="let link of filteredLinks"
                [link]="link"
                (edit)="editLink($event)"
                (delete)="deleteLink($event)">
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
              <p *ngIf="!searchQuery && selectedTags.length === 0">
                Get started by adding your first quick link
              </p>
              <button 
                class="btn btn-primary mt-4"
                (click)="showWizard = true">
                <i class="fas fa-plus"></i>
                Add Your First Link
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
  `,
  styles: [`
    .dashboard-header {
      background-color: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .dashboard-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dashboard-title i {
      color: var(--primary-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .theme-selector {
      min-width: 120px;
    }

    .theme-select {
      margin-top: 0.25rem;
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

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
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
  `]
})
export class DashboardComponent implements OnInit {
  showWizard = false;
  editingLink: QuickLink | null = null;
  currentTheme: Theme = 'light';
  searchQuery = '';
  selectedTags: string[] = [];
  
  links: QuickLink[] = [];
  filteredLinks: QuickLink[] = [];
  availableTags: string[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    
    this.loadLinks();
    this.updateFilteredLinks();
  }

  onThemeChange(event: Event) {
    const theme = (event.target as HTMLSelectElement).value as Theme;
    this.themeService.setTheme(theme);
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

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query) ||
        link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

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

  deleteLink(linkId: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      this.links = this.links.filter(link => link.id !== linkId);
      this.updateFilteredLinks();
      this.updateAvailableTags();
    }
  }

  onLinkSave(linkData: any) {
    if (this.editingLink) {
      const index = this.links.findIndex(link => link.id === this.editingLink!.id);
      if (index > -1) {
        this.links[index] = { ...this.editingLink, ...linkData, updatedAt: new Date() };
      }
    } else {
      const newLink: QuickLink = {
        id: Date.now().toString(),
        ...linkData,
        userId: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.links.push(newLink);
    }
    
    this.updateFilteredLinks();
    this.updateAvailableTags();
    this.onWizardCancel();
  }

  onWizardCancel() {
    this.showWizard = false;
    this.editingLink = null;
  }

  private loadLinks() {
    const savedLinks = localStorage.getItem('quickLinks');
    if (savedLinks) {
      this.links = JSON.parse(savedLinks);
    }
    this.updateAvailableTags();
  }

  private updateAvailableTags() {
    const tagSet = new Set<string>();
    this.links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    this.availableTags = Array.from(tagSet).sort();
    localStorage.setItem('quickLinks', JSON.stringify(this.links));
  }
}