export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLinkRequest {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
}