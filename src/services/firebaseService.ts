import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
   
  query, 
  where, 
  orderBy, 
  limit,
  
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../components/lib/Firebase';
import { User } from '../types/auth';

// User Management
export const userService = {
  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create or update user
  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Product Management
export const productService = {
  // Get products by category
  async getProductsByCategory(category: string) {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm: string) {
    try {
      const q = query(
        collection(db, 'products'),
        where('searchTerms', 'array-contains', searchTerm.toLowerCase()),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

// File Upload Service
export const fileUploadService = {
  // Upload file to Firebase Storage
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};

export default {
  userService,
  productService,
  fileUploadService
}; 