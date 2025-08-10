import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuickLink, CreateLinkRequest } from '../models/link.model';
import { AuthService } from './auth.service';

// This is a placeholder service for Firestore operations
// Once Firebase is set up, you can replace this with actual Firestore calls

@Injectable({
  providedIn: 'root'
})
export class LinksService {
  private linksSubject = new BehaviorSubject<QuickLink[]>([]);
  public links$ = this.linksSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadLinks();
  }

  // Get all links for current user
  getUserLinks(): Observable<QuickLink[]> {
    return this.links$;
  }

  // Add new link
  async addLink(linkData: CreateLinkRequest): Promise<QuickLink> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const newLink: QuickLink = {
      id: Date.now().toString(), // In production, Firestore will generate this
      ...linkData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentLinks = this.linksSubject.value;
    const updatedLinks = [...currentLinks, newLink];
    this.linksSubject.next(updatedLinks);
    this.saveToLocalStorage(updatedLinks);

    // TODO: Replace with Firestore add operation
    // return await this.firestore.collection('links').add(newLink);

    return newLink;
  }

  // Update existing link
  async updateLink(id: string, linkData: Partial<CreateLinkRequest>): Promise<QuickLink> {
    const currentLinks = this.linksSubject.value;
    const linkIndex = currentLinks.findIndex(link => link.id === id);
    
    if (linkIndex === -1) throw new Error('Link not found');

    const updatedLink: QuickLink = {
      ...currentLinks[linkIndex],
      ...linkData,
      updatedAt: new Date()
    };

    const updatedLinks = [...currentLinks];
    updatedLinks[linkIndex] = updatedLink;
    this.linksSubject.next(updatedLinks);
    this.saveToLocalStorage(updatedLinks);

    // TODO: Replace with Firestore update operation
    // await this.firestore.collection('links').doc(id).update(linkData);

    return updatedLink;
  }

  // Delete link
  async deleteLink(id: string): Promise<void> {
    const currentLinks = this.linksSubject.value;
    const updatedLinks = currentLinks.filter(link => link.id !== id);
    this.linksSubject.next(updatedLinks);
    this.saveToLocalStorage(updatedLinks);

    // TODO: Replace with Firestore delete operation
    // await this.firestore.collection('links').doc(id).delete();
  }

  // Load links from localStorage (temporary solution)
  private loadLinks(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const savedLinks = localStorage.getItem(`quickLinks_${user.uid}`);
    if (savedLinks) {
      const links = JSON.parse(savedLinks).map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt)
      }));
      this.linksSubject.next(links);
    }

    // TODO: Replace with Firestore query
    // const links = await this.firestore
    //   .collection('links')
    //   .where('userId', '==', user.uid)
    //   .get();
  }

  // Save to localStorage (temporary solution)
  private saveToLocalStorage(links: QuickLink[]): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      localStorage.setItem(`quickLinks_${user.uid}`, JSON.stringify(links));
    }
  }
}