export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  userId: string;
  viewIds: string[]; // Array of view IDs this link belongs to
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLinkRequest {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  viewIds?: string[];
}