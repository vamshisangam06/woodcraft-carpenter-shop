import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Product,
  Order,
  CustomFurnitureRequest,
  ServiceBooking,
  CarpenterWorker,
  InventoryItem,
  User,
  Notification,
} from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Connect directly to the provisioned Firestore database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Definition adhering strictly to Firebase Integration standard
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Initial Boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline or waiting for network.');
    }
    return false;
  }
}

// Auto-run connection test
testFirestoreConnection();

// Authentication Helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

// Firestore Database Realtime Service
export const firestoreService = {
  // Sync or save user profile
  async saveUserProfile(user: User): Promise<void> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data() as User) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  // Products
  async saveProduct(product: Product): Promise<void> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    const path = `products/${productId}`;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Orders
  async saveOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async updateOrderStatus(
    orderId: string,
    updates: Partial<Order>
  ): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Custom Quotes
  async saveQuote(quote: CustomFurnitureRequest): Promise<void> {
    const path = `quotes/${quote.id}`;
    try {
      await setDoc(doc(db, 'quotes', quote.id), quote);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async updateQuote(
    quoteId: string,
    updates: Partial<CustomFurnitureRequest>
  ): Promise<void> {
    const path = `quotes/${quoteId}`;
    try {
      await updateDoc(doc(db, 'quotes', quoteId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Service Bookings
  async saveBooking(booking: ServiceBooking): Promise<void> {
    const path = `bookings/${booking.id}`;
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async updateBooking(
    bookingId: string,
    updates: Partial<ServiceBooking>
  ): Promise<void> {
    const path = `bookings/${bookingId}`;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Inventory
  async saveInventoryItem(item: InventoryItem): Promise<void> {
    const path = `inventory/${item.id}`;
    try {
      await setDoc(doc(db, 'inventory', item.id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async updateInventoryStock(itemId: string, currentStock: number, status: InventoryItem['status']): Promise<void> {
    const path = `inventory/${itemId}`;
    try {
      await updateDoc(doc(db, 'inventory', itemId), { currentStock, status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Carpenters
  async saveCarpenter(carpenter: CarpenterWorker): Promise<void> {
    const path = `carpenters/${carpenter.id}`;
    try {
      await setDoc(doc(db, 'carpenters', carpenter.id), carpenter);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Notifications
  async saveNotification(notif: Notification): Promise<void> {
    const path = `notifications/${notif.id}`;
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async markNotificationRead(notifId: string): Promise<void> {
    const path = `notifications/${notifId}`;
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },
};
