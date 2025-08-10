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
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Listen to Firebase Auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check approval status from Firestore instead of custom claims
        let approved = false;
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            approved = userDoc.data()['approved'] === true;
          } else {
            // For admin user, auto-approve
            approved = firebaseUser.uid === 'KhrB5Bdod3fUb1DhjmNdtJBmU4i1';
          }
        } catch (error) {
          console.error('Error checking approval status:', error);
          // For admin user, auto-approve even if Firestore fails
          approved = firebaseUser.uid === 'KhrB5Bdod3fUb1DhjmNdtJBmU4i1';
        }
        
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          approved: approved
        };
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async signInWithEmailAndPassword(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      // Set persistence based on remember me option
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user: User = {
        uid: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || undefined
      };
      return user;
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
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isApproved(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.approved === true;
  }
}