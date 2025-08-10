// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyATFF6NntDiGa-v1opvdwhB75uvJ2kiLlo",
  authDomain: "range-cal.firebaseapp.com",
  projectId: "range-cal",
  storageBucket: "range-cal.firebasestorage.app",
  messagingSenderId: "103636031435",
  appId: "1:103636031435:web:9242a6ef7bc4cc46f6084e",
  measurementId: "G-80TBF7PX10"
};

// Next steps to complete setup:
// 1. Enable Authentication in Firebase Console
//    - Go to Authentication > Sign-in method
//    - Enable Email/Password and any other providers you want
// 2. Create Firestore database
//    - Go to Firestore Database > Create database
//    - Start in production mode
// 3. Set up Firestore security rules:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own links
    match /links/{linkId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    // Allow users to create new links
    match /links/{linkId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
*/