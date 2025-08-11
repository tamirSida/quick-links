import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  approved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    console.log('🚀 AuthService constructor called');
    // Initialize persistence and auth state listener
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Set default persistence to session (will be overridden by sign-in preference)
      await setPersistence(auth, browserSessionPersistence);
      console.log('✅ Firebase persistence initialized to SESSION (default)');
    } catch (error) {
      console.log('❌ Persistence setup failed:', error);
    }
    
    // Listen to Firebase Auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          approved: true // Everyone is approved now
        };
        
        console.log('👤 Setting user:', { email: user.email });
        this.currentUserSubject.next(user);
      } else {
        console.log('❌ No user found - setting to null');
        this.currentUserSubject.next(null);
      }
    });
  }

  async signInWithEmailAndPassword(email: string, password: string, rememberMe: boolean = true): Promise<User> {
    try {
      // Set persistence based on rememberMe preference
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      console.log(`🔐 Authentication persistence set to: ${rememberMe ? 'LOCAL (remembered)' : 'SESSION (not remembered)'}`);
      
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Auth state change listener will handle setting the user
      return {
        uid: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || undefined,
        approved: false // Will be set by the auth state listener
      };
    } catch (error: any) {
      throw error;
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Track user registration for admin dashboard
      // We'll import AdminService dynamically to avoid circular dependency
      const { AdminService } = await import('./admin.service');
      const adminService = new AdminService();
      await adminService.trackUserRegistration(credential.user);
      
      const user: User = {
        uid: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || undefined,
        approved: false // New users start unapproved
      };
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value || null;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isApproved(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user !== undefined && user.approved === true;
  }
}