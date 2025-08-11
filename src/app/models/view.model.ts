export interface View {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  userId: string;
  linkIds: string[]; // Array of link IDs that belong to this view
  isDefault: boolean; // If this is the default "All Links" view
  order: number; // For sorting tabs
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateViewRequest {
  name: string;
  description?: string;
  icon: string;
  color: string;
  linkIds?: string[];
}

export interface UpdateViewRequest extends Partial<CreateViewRequest> {
  order?: number;
}

export const DEFAULT_VIEW_COLORS = [
  '#667eea', // Primary blue
  '#06b6d4', // Cyan
  '#059669', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Green
  '#f97316', // Orange
  '#6366f1'  // Indigo
];

export const VIEW_ICONS = [
  { value: 'fas fa-folder', label: 'Folder' },
  { value: 'fas fa-briefcase', label: 'Work' },
  { value: 'fas fa-home', label: 'Home' },
  { value: 'fas fa-code', label: 'Development' },
  { value: 'fas fa-graduation-cap', label: 'Learning' },
  { value: 'fas fa-heart', label: 'Favorites' },
  { value: 'fas fa-star', label: 'Important' },
  { value: 'fas fa-bookmark', label: 'Bookmarks' },
  { value: 'fas fa-project-diagram', label: 'Projects' },
  { value: 'fas fa-tools', label: 'Tools' },
  { value: 'fas fa-shopping-cart', label: 'Shopping' },
  { value: 'fas fa-gamepad', label: 'Games' },
  { value: 'fas fa-music', label: 'Entertainment' },
  { value: 'fas fa-camera', label: 'Media' },
  { value: 'fas fa-plane', label: 'Travel' },
  { value: 'fas fa-dumbbell', label: 'Fitness' },
  { value: 'fas fa-utensils', label: 'Food' },
  { value: 'fas fa-book', label: 'Reading' }
];