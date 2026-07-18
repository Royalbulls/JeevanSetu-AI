import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIfjdsxMovW2xfrnPOp5kgGhgMtvcGpEY",
  authDomain: "gen-lang-client-0500758025.firebaseapp.com",
  projectId: "gen-lang-client-0500758025",
  storageBucket: "gen-lang-client-0500758025.firebasestorage.app",
  messagingSenderId: "327233611299",
  appId: "1:327233611299:web:52e0e1980b2f0c9b75b396"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore using the designated databaseId from the applet configuration
export const db = getFirestore(app, "ai-studio-jeevansetuai-6a8a4ac3-3f42-4857-acc0-b15150a0ba5f");

// Helper auth functions with graceful fail-safes
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed, trying anonymous login as fallback:", error);
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (anonError) {
      console.error("Anonymous login also failed:", anonError);
      throw error;
    }
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
