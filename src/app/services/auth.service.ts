import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// This is a placeholder service for Firebase Authentication
// Once Firebase is set up, you can replace this with actual Firebase Auth

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // For development, simulate a logged-in user
    const mockUser: User = {
      uid: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User'
    };
    this.currentUserSubject.next(mockUser);
  }

  // Placeholder methods - replace with Firebase Auth implementation
  async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    // TODO: Implement Firebase Auth
    throw new Error('Firebase Auth not implemented yet');
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
    // TODO: Implement Firebase Auth
    throw new Error('Firebase Auth not implemented yet');
  }

  async signOut(): Promise<void> {
    // TODO: Implement Firebase Auth
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}