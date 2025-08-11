export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  userId: string;
  viewIds: string[]; // Array of view IDs this link belongs to
  isCluster: boolean; // Whether this is a cluster of multiple links
  clusterUrls: string[]; // Array of URLs to open when cluster is clicked
  openInSeparateWindows: boolean; // Whether to open cluster URLs in separate windows
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
  isCluster?: boolean;
  clusterUrls?: string[];
  openInSeparateWindows?: boolean;
}