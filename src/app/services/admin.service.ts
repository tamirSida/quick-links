import { Injectable } from '@angular/core';
import { 
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, firestore } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  approved: boolean;
  createdAt: Date;
  lastSignIn?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private usersCollection = collection(firestore, 'users');

  constructor() {
    // Initialize admin user document if needed
    this.initializeAdminUser();
  }

  // Initialize admin user in Firestore
  private async initializeAdminUser(): Promise<void> {
    const adminUID = 'KhrB5Bdod3fUb1DhjmNdtJBmU4i1';
    try {
      const userRef = doc(firestore, 'users', adminUID);
      const adminData = {
        email: 'admin@quicklinks.com', // Placeholder
        displayName: 'Admin User',
        approved: true, // Admin is always approved
        createdAt: Timestamp.now(),
        isAdmin: true
      };
      
      // This will create the document if it doesn't exist
      await setDoc(userRef, adminData, { merge: true });
    } catch (error) {
      console.log('Admin user initialization skipped (normal on first run):', error);
    }
  }

  // Get all users (simulate Firebase Admin functionality)
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      // Since we can't access Firebase Admin SDK from frontend,
      // we'll maintain a users collection in Firestore
      const querySnapshot = await getDocs(this.usersCollection);
      const users: AdminUser[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          email: data['email'] || '',
          displayName: data['displayName'] || '',
          approved: data['approved'] || false,
          createdAt: data['createdAt']?.toDate() || new Date(),
          lastSignIn: data['lastSignIn']?.toDate()
        });
      });
      
      return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Approve a user
  async approveUser(uid: string): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, {
        approved: true,
        approvedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw new Error('Failed to approve user');
    }
  }

  // Disapprove a user
  async disapproveUser(uid: string): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, {
        approved: false,
        disapprovedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error disapproving user:', error);
      throw new Error('Failed to disapprove user');
    }
  }

  // Create a new user (auto-approved)
  async createUser(email: string, password: string, displayName?: string): Promise<AdminUser> {
    try {
      // Create the user in Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      // Add user to our users collection with approval
      const userData = {
        email: user.email || email,
        displayName: displayName || '',
        approved: true, // Auto-approved when created by admin
        createdAt: Timestamp.now(),
        createdBy: 'admin',
        approvedAt: Timestamp.now()
      };

      await addDoc(collection(firestore, 'users'), userData);

      return {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || '',
        approved: true,
        createdAt: new Date()
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  // Delete a user
  async deleteUser(uid: string): Promise<void> {
    try {
      // Remove from our users collection
      const userRef = doc(firestore, 'users', uid);
      await deleteDoc(userRef);
      
      // Note: We can't delete from Firebase Auth without Admin SDK
      // This would need to be done on the backend
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    // Check if current user UID matches the admin UID
    const currentUser = auth.currentUser;
    return currentUser?.uid === 'KhrB5Bdod3fUb1DhjmNdtJBmU4i1';
  }

  // Track user registration (call this when users sign up)
  async trackUserRegistration(user: FirebaseUser): Promise<void> {
    try {
      const userData = {
        email: user.email || '',
        displayName: user.displayName || '',
        approved: false, // New registrations need approval
        createdAt: Timestamp.now(),
        lastSignIn: Timestamp.now()
      };

      // Use the user's UID as the document ID
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, userData);
    } catch (error) {
      // If document doesn't exist, create it
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          email: user.email || '',
          displayName: user.displayName || '',
          approved: false,
          createdAt: Timestamp.now(),
          lastSignIn: Timestamp.now()
        };
        // Use setDoc instead of addDoc for specific document ID
        await setDoc(userRef, userData);
      } catch (createError) {
        console.error('Error tracking user registration:', createError);
      }
    }
  }
}