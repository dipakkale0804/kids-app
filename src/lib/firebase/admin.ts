import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebase() {
  if (getApps().length > 0) return;
  
  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      let envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      // Strip single quotes if they were accidentally pasted into Vercel
      if (envKey.startsWith("'") && envKey.endsWith("'")) {
        envKey = envKey.slice(1, -1);
      }
      
      try {
        serviceAccount = JSON.parse(envKey);
      } catch (e) {
        serviceAccount = JSON.parse(Buffer.from(envKey, 'base64').toString('utf8'));
      }
      
      // Fix literal '\n' that get escaped when loaded from .env variables
      if (serviceAccount && serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      credential = cert(serviceAccount);
    }
    
    if (credential) {
      initializeApp({
        credential,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const getAdminAuth = () => {
  initFirebase();
  return getAuth();
};

export const getAdminDb = () => {
  initFirebase();
  return getFirestore();
};
