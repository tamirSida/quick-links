import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { View, CreateViewRequest, UpdateViewRequest } from '../models/view.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ViewsService {
  private viewsSubject = new BehaviorSubject<View[]>([]);
  public views$ = this.viewsSubject.asObservable();
  
  private currentViewSubject = new BehaviorSubject<View | null>(null);
  public currentView$ = this.currentViewSubject.asObservable();
  
  private viewsCollection = collection(firestore, 'views');
  private unsubscribe: (() => void) | null = null;

  constructor(private authService: AuthService) {
    // Subscribe to auth state changes and load views accordingly
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserViews(user.uid);
      } else {
        this.viewsSubject.next([]);
        this.currentViewSubject.next(null);
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }
    });
  }

  // Get all views for current user
  getUserViews(): Observable<View[]> {
    return this.views$;
  }

  // Get current active view
  getCurrentView(): Observable<View | null> {
    return this.currentView$;
  }

  // Set current active view
  setCurrentView(view: View | null): void {
    this.currentViewSubject.next(view);
    if (view) {
      localStorage.setItem('currentViewId', view.id);
    } else {
      localStorage.removeItem('currentViewId');
    }
  }

  // Get the default "All Links" view
  getDefaultView(): View | null {
    const views = this.viewsSubject.value;
    return views.find(view => view.isDefault) || null;
  }

  // Create new view
  async createView(viewData: CreateViewRequest): Promise<View> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const currentViews = this.viewsSubject.value;
      const maxOrder = Math.max(0, ...currentViews.map(v => v.order));

      const viewToAdd = {
        ...viewData,
        userId: user.uid,
        linkIds: viewData.linkIds || [],
        isDefault: false,
        order: maxOrder + 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.viewsCollection, viewToAdd);
      
      const newView: View = {
        id: docRef.id,
        ...viewData,
        userId: user.uid,
        linkIds: viewData.linkIds || [],
        isDefault: false,
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update links to include this view ID
      if (viewData.linkIds && viewData.linkIds.length > 0) {
        await this.updateLinksWithView(newView.id, viewData.linkIds);
      }

      return newView;
    } catch (error: any) {
      console.error('Error creating view:', error);
      throw new Error('Failed to create view');
    }
  }

  // Update existing view
  async updateView(id: string, viewData: UpdateViewRequest): Promise<View> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const currentViews = this.viewsSubject.value;
      const currentView = currentViews.find(view => view.id === id);
      if (!currentView) throw new Error('View not found');

      // If linkIds are being updated, handle link associations
      if (viewData.linkIds) {
        const oldLinkIds = currentView.linkIds || [];
        const newLinkIds = viewData.linkIds;
        
        // Remove view from links that are no longer in the view
        const removedLinkIds = oldLinkIds.filter(linkId => !newLinkIds.includes(linkId));
        if (removedLinkIds.length > 0) {
          await this.removeLinksFromView(id, removedLinkIds);
        }
        
        // Add view to new links
        const addedLinkIds = newLinkIds.filter(linkId => !oldLinkIds.includes(linkId));
        if (addedLinkIds.length > 0) {
          await this.updateLinksWithView(id, addedLinkIds);
        }
      }

      const viewRef = doc(firestore, 'views', id);
      await updateDoc(viewRef, {
        ...viewData,
        updatedAt: Timestamp.now()
      });

      const viewIndex = currentViews.findIndex(view => view.id === id);
      const updatedView: View = {
        ...currentViews[viewIndex],
        ...viewData,
        updatedAt: new Date()
      };

      return updatedView;
    } catch (error: any) {
      console.error('Error updating view:', error);
      throw new Error('Failed to update view');
    }
  }

  // Delete view
  async deleteView(id: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Don't allow deletion of default view
    const view = this.viewsSubject.value.find(v => v.id === id);
    if (view?.isDefault) {
      throw new Error('Cannot delete the default view');
    }

    try {
      const viewRef = doc(firestore, 'views', id);
      await deleteDoc(viewRef);

      // If this was the current view, switch to default
      const currentView = this.currentViewSubject.value;
      if (currentView?.id === id) {
        this.setCurrentView(this.getDefaultView());
      }
    } catch (error: any) {
      console.error('Error deleting view:', error);
      throw new Error('Failed to delete view');
    }
  }

  // Add link to view
  async addLinkToView(viewId: string, linkId: string): Promise<void> {
    const currentViews = this.viewsSubject.value;
    const view = currentViews.find(v => v.id === viewId);
    
    if (!view) throw new Error('View not found');
    if (view.linkIds.includes(linkId)) return; // Already in view

    const updatedLinkIds = [...view.linkIds, linkId];
    await this.updateView(viewId, { linkIds: updatedLinkIds });
  }

  // Remove link from view
  async removeLinkFromView(viewId: string, linkId: string): Promise<void> {
    const currentViews = this.viewsSubject.value;
    const view = currentViews.find(v => v.id === viewId);
    
    if (!view) throw new Error('View not found');
    if (view.isDefault) throw new Error('Cannot remove links from default view');

    const updatedLinkIds = view.linkIds.filter(id => id !== linkId);
    await this.updateView(viewId, { linkIds: updatedLinkIds });
  }

  // Reorder views
  async reorderViews(viewIds: string[]): Promise<void> {
    const updates = viewIds.map(async (viewId, index) => {
      return this.updateView(viewId, { order: index });
    });
    
    await Promise.all(updates);
  }

  // Create default "All Links" view for new users
  async createDefaultView(): Promise<View> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const defaultViewData: CreateViewRequest = {
      name: 'All Links',
      description: 'All your links in one place',
      icon: 'fas fa-th-large',
      color: '#667eea',
      linkIds: []
    };

    try {
      const viewToAdd = {
        ...defaultViewData,
        userId: user.uid,
        isDefault: true,
        order: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.viewsCollection, viewToAdd);
      
      const newView: View = {
        id: docRef.id,
        ...defaultViewData,
        userId: user.uid,
        linkIds: [],
        isDefault: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newView;
    } catch (error: any) {
      console.error('Error creating default view:', error);
      throw new Error('Failed to create default view');
    }
  }

  // Load views for a specific user with real-time updates
  private loadUserViews(userId: string): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const userViewsQuery = query(
      this.viewsCollection,
      where('userId', '==', userId)
    );

    this.unsubscribe = onSnapshot(userViewsQuery, async (snapshot) => {
      const views: View[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'],
          description: data['description'] || '',
          icon: data['icon'],
          color: data['color'],
          userId: data['userId'],
          linkIds: data['linkIds'] || [],
          isDefault: data['isDefault'] || false,
          order: data['order'] || 0,
          createdAt: data['createdAt'] ? data['createdAt'].toDate() : new Date(),
          updatedAt: data['updatedAt'] ? data['updatedAt'].toDate() : new Date()
        };
      });

      // If no views exist, create default view
      if (views.length === 0) {
        try {
          await this.createDefaultView();
          return; // The snapshot listener will pick up the new default view
        } catch (error) {
          console.error('Error creating default view:', error);
        }
      }

      // Sort views by order on client side
      const sortedViews = views.sort((a, b) => a.order - b.order);
      this.viewsSubject.next(sortedViews);

      // Set current view if not already set
      const currentView = this.currentViewSubject.value;
      if (!currentView) {
        const savedViewId = localStorage.getItem('currentViewId');
        const viewToSet = savedViewId ? 
          views.find(v => v.id === savedViewId) : 
          this.getDefaultView();
        
        this.setCurrentView(viewToSet || views[0]);
      }
    }, (error) => {
      console.error('Error loading views:', error);
    });
  }

  // Update multiple links to include a view ID
  private async updateLinksWithView(viewId: string, linkIds: string[]): Promise<void> {
    const updatePromises = linkIds.map(async (linkId) => {
      try {
        const linkRef = doc(firestore, 'links', linkId);
        const linkDoc = await getDoc(linkRef);
        
        if (linkDoc.exists()) {
          const linkData = linkDoc.data();
          const currentViewIds = linkData['viewIds'] || [];
          
          if (!currentViewIds.includes(viewId)) {
            const updatedViewIds = [...currentViewIds, viewId];
            await updateDoc(linkRef, {
              viewIds: updatedViewIds,
              updatedAt: Timestamp.now()
            });
          }
        }
      } catch (error) {
        console.error(`Error updating link ${linkId} with view ${viewId}:`, error);
      }
    });
    
    await Promise.all(updatePromises);
  }

  // Remove view ID from multiple links
  private async removeLinksFromView(viewId: string, linkIds: string[]): Promise<void> {
    const updatePromises = linkIds.map(async (linkId) => {
      try {
        const linkRef = doc(firestore, 'links', linkId);
        const linkDoc = await getDoc(linkRef);
        
        if (linkDoc.exists()) {
          const linkData = linkDoc.data();
          const currentViewIds = linkData['viewIds'] || [];
          
          if (currentViewIds.includes(viewId)) {
            const updatedViewIds = currentViewIds.filter((id: string) => id !== viewId);
            await updateDoc(linkRef, {
              viewIds: updatedViewIds,
              updatedAt: Timestamp.now()
            });
          }
        }
      } catch (error) {
        console.error(`Error removing view ${viewId} from link ${linkId}:`, error);
      }
    });
    
    await Promise.all(updatePromises);
  }

  // Clean up subscription when service is destroyed
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}