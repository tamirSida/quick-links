# 🔧 Admin Setup Guide

## ✅ **SOLUTION: One-Time Admin Setup Page**

I've created a dedicated setup page to fix the admin approval issue!

**Visit: `http://localhost:4200/admin-setup`**

### **What it does:**
- ✅ **One-click setup** - Creates admin user document in Firestore
- ✅ **Auto-verification** - Checks if setup already exists
- ✅ **Error handling** - Shows clear error messages if something fails
- ✅ **Auto-redirect** - Takes you to sign-in after successful setup
- ✅ **Self-destructs** - Page becomes unnecessary after setup

### **Steps:**
1. **Go to** `http://localhost:4200/admin-setup`
2. **Click "Setup Admin User"**
3. **Wait for success message**
4. **Sign in normally** - you'll now have full access

### **Alternative Manual Setup:**
If the setup page fails, you can still create the document manually:
1. **Firebase Console → Firestore Database**
2. **Create document**: Collection: `users`, Document ID: `KhrB5Bdod3fUb1DhjmNdtJBmU4i1`
3. **Add fields**: `approved: true`, `email: "admin@example.com"`, `isAdmin: true`

## What Changed:
- **Before**: Used Firebase Auth custom claims (couldn't set from frontend)
- **Now**: Uses Firestore `users` collection for approval status
- **Admin user**: Auto-approved when document exists

## Expected Flow:
1. **Admin signs in** → System checks Firestore for approval
2. **If admin document exists** with `approved: true` → Dashboard access
3. **If no document exists** → Auto-creates one (should happen automatically)

## Debug Steps:
1. Open browser DevTools → Console
2. Sign in as admin user
3. Look for any Firestore errors
4. Check if admin document was created automatically

Which option would you like me to implement to fix this quickly?