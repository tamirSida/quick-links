import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { QuickLink, CreateLinkRequest } from '../models/link.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LinksService {
  private linksSubject = new BehaviorSubject<QuickLink[]>([]);
  public links$ = this.linksSubject.asObservable();
  private linksCollection = collection(firestore, 'links');
  private unsubscribe: (() => void) | null = null;

  constructor(private authService: AuthService) {
    // Subscribe to auth state changes and load links accordingly
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserLinks(user.uid);
      } else {
        this.linksSubject.next([]);
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }
    });
  }

  // Get all links for current user
  getUserLinks(): Observable<QuickLink[]> {
    return this.links$;
  }

  // Add new link
  async addLink(linkData: CreateLinkRequest): Promise<QuickLink> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const linkToAdd = {
        ...linkData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.linksCollection, linkToAdd);
      
      const newLink: QuickLink = {
        id: docRef.id,
        ...linkData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newLink;
    } catch (error: any) {
      console.error('Error adding link:', error);
      throw new Error('Failed to add link');
    }
  }

  // Update existing link
  async updateLink(id: string, linkData: Partial<CreateLinkRequest>): Promise<QuickLink> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const linkRef = doc(firestore, 'links', id);
      await updateDoc(linkRef, {
        ...linkData,
        updatedAt: Timestamp.now()
      });

      const currentLinks = this.linksSubject.value;
      const linkIndex = currentLinks.findIndex(link => link.id === id);
      
      if (linkIndex === -1) throw new Error('Link not found');

      const updatedLink: QuickLink = {
        ...currentLinks[linkIndex],
        ...linkData,
        updatedAt: new Date()
      };

      return updatedLink;
    } catch (error: any) {
      console.error('Error updating link:', error);
      throw new Error('Failed to update link');
    }
  }

  // Delete link
  async deleteLink(id: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const linkRef = doc(firestore, 'links', id);
      await deleteDoc(linkRef);
    } catch (error: any) {
      console.error('Error deleting link:', error);
      throw new Error('Failed to delete link');
    }
  }

  // Load links for a specific user with real-time updates
  private loadUserLinks(userId: string): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const userLinksQuery = query(
      this.linksCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(userLinksQuery, (snapshot) => {
      const links: QuickLink[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data['title'],
          description: data['description'],
          url: data['url'],
          icon: data['icon'],
          tags: data['tags'] || [],
          userId: data['userId'],
          createdAt: data['createdAt'] ? data['createdAt'].toDate() : new Date(),
          updatedAt: data['updatedAt'] ? data['updatedAt'].toDate() : new Date()
        };
      });
      this.linksSubject.next(links);
    }, (error) => {
      console.error('Error loading links:', error);
    });
  }

  // Clean up subscription when service is destroyed
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}