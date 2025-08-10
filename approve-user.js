// Node.js script to approve users
// Run with: node approve-user.js [user-email]

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/your-service-account-key.json'); // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'range-cal'
});

async function approveUser(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { approved: true });
    
    console.log(`✅ User ${email} has been approved!`);
    console.log(`User ID: ${user.uid}`);
    
  } catch (error) {
    console.error('❌ Error approving user:', error);
  }
  
  process.exit(0);
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node approve-user.js user@example.com');
  process.exit(1);
}

approveUser(email);