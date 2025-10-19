import { ref, set, get, push, update } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

export interface WholesalerStats {
  totalOrders: number;
  monthlyRevenue: number;
  activeRetailers: number;
  totalProducts: number;
  icon: string;
  color: string;
  change: string;
  label: string;
  value: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current: number;
  minimum: number;
  maximum: number;
  price: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  demand: 'Low' | 'Medium' | 'High';
}

export interface Order {
  id: string;
  retailer: string;
  retailerId: string;
  items: string;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  date: string;
  paymentStatus: 'Pending' | 'Paid' | 'Overdue';
}

export interface AISuggestion {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'inventory' | 'pricing' | 'marketing' | 'operations';
  actionRequired: boolean;
  createdAt: string;
}

export interface RetailerRelationship {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  creditLimit: number;
  paymentTerms: string;
}

export class WholesalerDataService {
  
  // Initialize complete dataset for new wholesaler
  static async initializeWholesalerData(wholesalerId: string, wholesalerInfo: any) {
    try {
      const wholesalerRef = ref(realtimeDb, `wholesalers/${wholesalerId}`);
      
      // Check if data already exists
      const snapshot = await get(wholesalerRef);
      if (snapshot.exists()) {
        console.log('Wholesaler data already exists');
        return;
      }

      const initialData = {
        profile: {
          id: wholesalerId,
          name: wholesalerInfo.name || 'Wholesaler',
          email: wholesalerInfo.email || '',
          phone: wholesalerInfo.phone || '',
          businessName: wholesalerInfo.businessName || '',
          address: wholesalerInfo.address || '',
          gstNumber: wholesalerInfo.gstNumber || '',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        stats: this.getInitialStats(),
        inventory: {},
        lowStock: {},
        orders: {},
        suggestions: this.getInitialSuggestions(),
        retailers: {},
        analytics: {
          monthlyData: {},
          topProducts: {},
          revenueGrowth: 0,
          customerGrowth: 0
        },
        settings: {
          notifications: true,
          autoRestock: false,
          lowStockThreshold: 10,
          currency: 'INR'
        }
      };

      await set(wholesalerRef, initialData);
      console.log('Wholesaler data initialized successfully');
      
    } catch (error) {
      console.error('Error initializing wholesaler data:', error);
      throw error;
    }
  }

  // Get initial stats structure
  private static getInitialStats() {
    return {
      totalOrders: {
        icon: 'Package',
        color: 'bg-blue-500',
        change: '+0%',
        label: 'Total Orders',
        value: '0'
      },
      monthlyRevenue: {
        icon: 'TrendingUp',
        color: 'bg-green-500',
        change: '+0%',
        label: 'Monthly Revenue',
        value: '₹0'
      },
      activeRetailers: {
        icon: 'Users',
        color: 'bg-purple-500',
        change: '+0%',
        label: 'Active Retailers',
        value: '0'
      },
      totalProducts: {
        icon: 'BarChart3',
        color: 'bg-orange-500',
        change: '+0%',
        label: 'Total Products',
        value: '0'
      }
    };
  }

  // Get initial AI suggestions
  private static getInitialSuggestions(): AISuggestion[] {
    return [
      {
        id: '1',
        message: 'Welcome! Start by adding your first product to inventory.',
        priority: 'high',
        category: 'inventory',
        actionRequired: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        message: 'Set up your retailer relationships to start receiving orders.',
        priority: 'medium',
        category: 'operations',
        actionRequired: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        message: 'Configure your notification preferences in settings.',
        priority: 'low',
        category: 'operations',
        actionRequired: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Add new inventory item
  static async addInventoryItem(wholesalerId: string, item: Omit<InventoryItem, 'id'>) {
    try {
      const inventoryRef = ref(realtimeDb, `wholesalers/${wholesalerId}/inventory`);
      const newItemRef = push(inventoryRef);
      
      const inventoryItem: InventoryItem = {
        ...item,
        id: newItemRef.key!,
        lastRestocked: new Date().toISOString()
      };

      await set(newItemRef, inventoryItem);
      
      // Update stats
      await this.updateProductCount(wholesalerId);
      
      // Check if item should be in low stock
      if (item.current <= item.minimum) {
        await this.addToLowStock(wholesalerId, inventoryItem);
      }

      return inventoryItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }

  // Add retailer relationship
  static async addRetailer(wholesalerId: string, retailer: Omit<RetailerRelationship, 'id'>) {
    try {
      const retailersRef = ref(realtimeDb, `wholesalers/${wholesalerId}/retailers`);
      const newRetailerRef = push(retailersRef);
      
      const retailerData: RetailerRelationship = {
        ...retailer,
        id: newRetailerRef.key!
      };

      await set(newRetailerRef, retailerData);
      
      // Update retailer count
      await this.updateRetailerCount(wholesalerId);
      
      return retailerData;
    } catch (error) {
      console.error('Error adding retailer:', error);
      throw error;
    }
  }

  // Add new order
  static async addOrder(wholesalerId: string, order: Omit<Order, 'id'>) {
    try {
      const ordersRef = ref(realtimeDb, `wholesalers/${wholesalerId}/orders`);
      const newOrderRef = push(ordersRef);
      
      const orderData: Order = {
        ...order,
        id: newOrderRef.key!,
        date: new Date().toISOString()
      };

      await set(newOrderRef, orderData);
      
      // Update stats
      await this.updateOrderStats(wholesalerId, order.amount);
      
      return orderData;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  // Helper methods for updating stats
  private static async updateProductCount(wholesalerId: string) {
    try {
      const inventoryRef = ref(realtimeDb, `wholesalers/${wholesalerId}/inventory`);
      const snapshot = await get(inventoryRef);
      const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      
      const statsRef = ref(realtimeDb, `wholesalers/${wholesalerId}/stats/totalProducts`);
      await update(statsRef, { value: count.toString() });
    } catch (error) {
      console.error('Error updating product count:', error);
    }
  }

  private static async updateRetailerCount(wholesalerId: string) {
    try {
      const retailersRef = ref(realtimeDb, `wholesalers/${wholesalerId}/retailers`);
      const snapshot = await get(retailersRef);
      const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      
      const statsRef = ref(realtimeDb, `wholesalers/${wholesalerId}/stats/activeRetailers`);
      await update(statsRef, { value: count.toString() });
    } catch (error) {
      console.error('Error updating retailer count:', error);
    }
  }

  private static async updateOrderStats(wholesalerId: string, amount: number) {
    try {
      // Update total orders
      const ordersRef = ref(realtimeDb, `wholesalers/${wholesalerId}/orders`);
      const ordersSnapshot = await get(ordersRef);
      const orderCount = ordersSnapshot.exists() ? Object.keys(ordersSnapshot.val()).length : 0;
      
      // Update monthly revenue (simplified - you might want more complex logic)
      const currentMonth = new Date().getMonth();
      const revenueRef = ref(realtimeDb, `wholesalers/${wholesalerId}/analytics/monthlyData/${currentMonth}`);
      const revenueSnapshot = await get(revenueRef);
      const currentRevenue = revenueSnapshot.exists() ? revenueSnapshot.val().revenue || 0 : 0;
      
      await update(ref(realtimeDb, `wholesalers/${wholesalerId}/stats`), {
        'totalOrders/value': orderCount.toString(),
        'monthlyRevenue/value': `₹${(currentRevenue + amount).toLocaleString()}`
      });
      
      await set(revenueRef, { revenue: currentRevenue + amount, orders: orderCount });
      
    } catch (error) {
      console.error('Error updating order stats:', error);
    }
  }

  private static async addToLowStock(wholesalerId: string, item: InventoryItem) {
    try {
      const lowStockRef = ref(realtimeDb, `wholesalers/${wholesalerId}/lowStock/${item.id}`);
      await set(lowStockRef, item);
    } catch (error) {
      console.error('Error adding to low stock:', error);
    }
  }

  // Get wholesaler data
  static async getWholesalerData(wholesalerId: string) {
    try {
      const wholesalerRef = ref(realtimeDb, `wholesalers/${wholesalerId}`);
      const snapshot = await get(wholesalerRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting wholesaler data:', error);
      throw error;
    }
  }
}