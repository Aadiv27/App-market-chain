import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  push, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  equalTo,
  limitToFirst,
  limitToLast
} from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

// User Management in Realtime Database
export const userRealtimeService = {
  // Save user data to Realtime Database
  async saveUser(userId: string, userData: any): Promise<void> {
    try {
      await set(ref(realtimeDb, `users/${userId}`), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving user to Realtime DB:', error);
      throw error;
    }
  },

  // Get user data from Realtime Database
  async getUser(userId: string): Promise<any> {
    try {
      const snapshot = await get(ref(realtimeDb, `users/${userId}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error getting user from Realtime DB:', error);
      throw error;
    }
  },

  // Update user data
  async updateUser(userId: string, updates: any): Promise<void> {
    try {
      await update(ref(realtimeDb, `users/${userId}`), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user in Realtime DB:', error);
      throw error;
    }
  },

  // Listen to user changes in real-time
  onUserChange(userId: string, callback: (data: any) => void) {
    const userRef = ref(realtimeDb, `users/${userId}`);
    
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => off(userRef);
  }
};

// Product Management in Realtime Database
export const productRealtimeService = {
  // Save product data
  async saveProduct(productId: string, productData: any): Promise<void> {
    try {
      await set(ref(realtimeDb, `products/${productId}`), {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving product to Realtime DB:', error);
      throw error;
    }
  },

  // Get all products
  async getAllProducts(): Promise<any[]> {
    try {
      const snapshot = await get(ref(realtimeDb, 'products'));
      if (snapshot.exists()) {
        const products = snapshot.val();
        return Object.keys(products).map(key => ({
          id: key,
          ...products[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting products from Realtime DB:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<any[]> {
    try {
      const productsQuery = query(
        ref(realtimeDb, 'products'),
        orderByChild('category'),
        equalTo(category)
      );
      const snapshot = await get(productsQuery);
      
      if (snapshot.exists()) {
        const products = snapshot.val();
        return Object.keys(products).map(key => ({
          id: key,
          ...products[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting products by category from Realtime DB:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<any[]> {
    try {
      const snapshot = await get(ref(realtimeDb, 'products'));
      if (snapshot.exists()) {
        const products = snapshot.val();
        const searchResults = Object.keys(products)
          .map(key => ({
            id: key,
            ...products[key]
          }))
          .filter(product => 
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        return searchResults;
      }
      return [];
    } catch (error) {
      console.error('Error searching products in Realtime DB:', error);
      throw error;
    }
  }
};

// Order Management in Realtime Database
export const orderRealtimeService = {
  // Create new order
  async createOrder(orderData: any): Promise<string> {
    try {
      const newOrderRef = push(ref(realtimeDb, 'orders'));
      const orderId = newOrderRef.key;
      
      await set(newOrderRef, {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      return orderId!;
    } catch (error) {
      console.error('Error creating order in Realtime DB:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(userId: string): Promise<any[]> {
    try {
      const ordersQuery = query(
        ref(realtimeDb, 'orders'),
        orderByChild('userId'),
        equalTo(userId)
      );
      const snapshot = await get(ordersQuery);
      
      if (snapshot.exists()) {
        const orders = snapshot.val();
        return Object.keys(orders)
          .map(key => ({
            id: key,
            ...orders[key]
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error getting user orders from Realtime DB:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      await update(ref(realtimeDb, `orders/${orderId}`), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating order status in Realtime DB:', error);
      throw error;
    }
  },

  // Listen to order changes
  onOrderChange(orderId: string, callback: (data: any) => void) {
    const orderRef = ref(realtimeDb, `orders/${orderId}`);
    
    onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });

    return () => off(orderRef);
  }
};

// Analytics in Realtime Database
export const analyticsRealtimeService = {
  // Track search query
  async trackSearch(query: string, userId: string): Promise<void> {
    try {
      const searchRef = push(ref(realtimeDb, 'analytics/searches'));
      await set(searchRef, {
        query,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking search in Realtime DB:', error);
    }
  },

  // Track voice interaction
  async trackVoiceInteraction(interaction: any): Promise<void> {
    try {
      const voiceRef = push(ref(realtimeDb, 'analytics/voice_interactions'));
      await set(voiceRef, {
        ...interaction,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking voice interaction in Realtime DB:', error);
    }
  },

  // Get analytics data
  async getAnalytics(type: 'searches' | 'voice_interactions', limit: number = 100): Promise<any[]> {
    try {
      const analyticsQuery = query(
        ref(realtimeDb, `analytics/${type}`),
        limitToLast(limit)
      );
      const snapshot = await get(analyticsQuery);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error getting analytics from Realtime DB:', error);
      throw error;
    }
  }
};

export default {
  userRealtimeService,
  productRealtimeService,
  orderRealtimeService,
  analyticsRealtimeService
}; 