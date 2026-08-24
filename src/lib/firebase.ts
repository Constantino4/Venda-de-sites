import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut, 
  onAuthStateChanged,
  type User,
  type AuthError
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (Singleton Pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Firestore with databaseId support
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

// Export Auth
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Current application base URL and authorized callback handlers
export const APP_AUTH_CONFIG = {
  authDomain: firebaseConfig.authDomain || 'studio-9909916558-6949c.firebaseapp.com',
  callbackUrl: `https://${firebaseConfig.authDomain || 'studio-9909916558-6949c.firebaseapp.com'}/__/auth/handler`,
  productionAppUrl: 'https://ais-pre-o34fdgj3pna42sqf37qhxo-5633841879.europe-west1.run.app',
  devAppUrl: 'https://ais-dev-o34fdgj3pna42sqf37qhxo-5633841879.europe-west1.run.app'
};

// Configure Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

// Export Storage
export const storage = getStorage(app);

// Storage Bucket configuration details
export const STORAGE_BUCKET_NAME = firebaseConfig.storageBucket || 'studio-9909916558-6949c.firebasestorage.app';
export const PRIVATE_ZIPS_PREFIX = 'private_zips';
export const PUBLIC_DEMOS_PREFIX = 'public_demos';

// Validate Firestore Connection (Skill Constraint)
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection test successful');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Client is offline. Check Firebase configuration.');
    }
    return false;
  }
}

/**
 * Upload a private product ZIP file to Firebase Storage
 * Path format: private_zips/{productId}/v{versionNumber}/{filename}
 */
export async function uploadPrivateZipToFirebase(
  productId: string,
  versionNumber: string,
  file: File | Blob,
  filename: string
): Promise<{ path: string; downloadUrl: string }> {
  const filePath = `${PRIVATE_ZIPS_PREFIX}/${productId}/v${versionNumber}/${filename}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: 'application/zip',
    customMetadata: {
      productId,
      versionNumber,
      accessLevel: 'private_sale_only',
      uploadedAt: new Date().toISOString()
    }
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    path: filePath,
    downloadUrl
  };
}

/**
 * Upload a public demo file/asset to Firebase Storage
 * Path format: public_demos/{productId}/v{versionNumber}/{filename}
 */
export async function uploadPublicDemoToFirebase(
  productId: string,
  versionNumber: string,
  file: File | Blob,
  filename: string,
  contentType: string = 'text/html'
): Promise<{ path: string; downloadUrl: string }> {
  const filePath = `${PUBLIC_DEMOS_PREFIX}/${productId}/v${versionNumber}/${filename}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType,
    customMetadata: {
      productId,
      versionNumber,
      accessLevel: 'public_demo_preview',
      uploadedAt: new Date().toISOString()
    }
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    path: filePath,
    downloadUrl
  };
}

/**
 * Get download URL for a private ZIP file in Firebase Storage
 */
export async function getPrivateZipUrlFromFirebase(
  productId: string,
  versionNumber: string,
  filename: string
): Promise<string> {
  const filePath = `${PRIVATE_ZIPS_PREFIX}/${productId}/v${versionNumber}/${filename}`;
  const storageRef = ref(storage, filePath);
  return await getDownloadURL(storageRef);
}

/**
 * Get public demo URL in Firebase Storage
 */
export async function getPublicDemoUrlFromFirebase(
  productId: string,
  versionNumber: string,
  filename: string = 'index.html'
): Promise<string> {
  const filePath = `${PUBLIC_DEMOS_PREFIX}/${productId}/v${versionNumber}/${filename}`;
  const storageRef = ref(storage, filePath);
  return await getDownloadURL(storageRef);
}
