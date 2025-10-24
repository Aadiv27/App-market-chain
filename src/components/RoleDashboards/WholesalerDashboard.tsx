import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Bell,
  Plus,
  Search,
  Filter,
  ShoppingCart,
  UserPlus,
  Settings,
  Eye,
  CheckCircle,
  Truck,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, set as dbSet, get } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';
import KYCAlert from '../KYCAlert';

import { WholesalerDataService } from '../../services/wholesalerDataService';
import RetailerOrdersView from '../RetailerOrdersView';
import { DistanceService } from '../../services/distanceService';
import { NotificationService } from '../../services/notificationService';
import OrderDetailsModal from '../OrderDetailsModal';

// Define interfaces for type safety
interface Stat {
  icon?: string;
  color?: string;
  value?: string | number;
  label?: string;
  change?: string;
}

interface Order {
  id?: string;
  retailer?: string;
  retailerId?: string;
  retailerShopName?: string;
  retailerAddress?: string;
  retailerPhone?: string;
  items?: string;
  amount?: number;
  status?: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered';
  paymentStatus?: 'Pending' | 'Paid' | 'Overdue';
  date?: string;
  packedAt?: number;
  assignedVehicleId?: string;
  deliveryDistance?: number;
  deliveryCost?: number;
}

interface InventoryItem {
  name: string;
  category: string;
  current: number;
  minimum: number;
  maximum: number;
  price: number;
  unit: string;
  supplier?: string;
  demand: 'Low' | 'Medium' | 'High';
  lastRestocked?: string;
}

interface AISuggestion {
  priority?: 'high' | 'medium' | 'low';
  message?: string;
}

interface ProductForm {
  name: string;
  category: string;
  current: number;
  minimum: number;
  maximum: number;
  price: number;
  unit: string;
  supplier: string;
  demand: string;
}

interface RetailerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  paymentTerms: string;
  status: string;
}

interface OrderForm {
  retailer: string;
  retailerId: string;
  items: string;
  amount: number;
  status: string;
  paymentStatus: string;
}

type IconName = 
  | 'Package'
  | 'TrendingUp'
  | 'Users'
  | 'BarChart3'
  | 'AlertTriangle'
  | 'Bell'
  | 'Plus'
  | 'Search'
  | 'Filter'
  | 'ShoppingCart'
  | 'UserPlus'
  | 'Settings';

// Helper function to safely render any data and prevent object rendering errors
const safeRender = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    // Handle status arrays from RetailerDashboard orders
    if (value.length > 0 && value[0] && typeof value[0] === 'object' && value[0].status) {
      // Get the latest status (last item in array)
      const latestStatus = value[value.length - 1];
      return latestStatus.status || 'Unknown';
    }
    // For other arrays, join them as strings
    return value.map(item => safeRender(item)).join(', ');
  }
  if (typeof value === 'object') {
    // If it's an object with note, status, timestamp properties, extract the note
    if (value.note && typeof value.note === 'string') {
      return value.note;
    }
    // If it's an object with message property, extract the message
    if (value.message && typeof value.message === 'string') {
      return value.message;
    }
    // If it's a status object, extract the status
    if (value.status && typeof value.status === 'string') {
      return value.status;
    }
    // For other objects, return a safe string representation
    return 'Complex data';
  }
  return String(value);
};

// Helper function to format cart items for display
const formatOrderItems = (items: any): string => {
  if (!items) return 'No items';
  
  // If items is already a string, return it
  if (typeof items === 'string') {
    return items;
  }
  
  // If items is an array of cart items (objects with name, quantity, etc.)
  if (Array.isArray(items)) {
    return items.map(item => {
      if (typeof item === 'object' && item.name) {
        const quantity = item.quantity || 1;
        const unit = item.unit || 'pcs';
        return `${item.name} (${quantity} ${unit})`;
      }
      return safeRender(item);
    }).join(', ');
  }
  
  // For other object types, try to extract meaningful info
  if (typeof items === 'object') {
    return safeRender(items);
  }
  
  return String(items);
};

const WholesalerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Dynamic states
  const [stats, setStats] = useState<Stat[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [myInventory, setMyInventory] = useState<InventoryItem[]>([]);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  
  // Modal states for adding data
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [showAddRetailer, setShowAddRetailer] = useState<boolean>(false);
  const [showAddOrder, setShowAddOrder] = useState<boolean>(false);
  const [showRetailerOrders, setShowRetailerOrders] = useState<boolean>(false);
  
  // Order details modal states
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Packing states
  const [packingOrders, setPackingOrders] = useState<Set<string>>(new Set());
  const [wholesalerInfo, setWholesalerInfo] = useState<{
    id: string;
    shopName: string;
    address: string;
    phone: string;
    fullName: string;
  }>({
    id: '',
    shopName: '',
    address: '',
    phone: '',
    fullName: ''
  });
  
  // Form states
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    category: '',
    current: 0,
    minimum: 10,
    maximum: 100,
    price: 0,
    unit: 'kg',
    supplier: '',
    demand: 'Medium'
  });
  
  const [retailerForm, setRetailerForm] = useState<RetailerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 50000,
    paymentTerms: '30 days',
    status: 'Active'
  });
  
  const [orderForm, setOrderForm] = useState<OrderForm>({
    retailer: '',
    retailerId: '',
    items: '',
    amount: 0,
    status: 'Pending',
    paymentStatus: 'Pending'
  });

  // Order lookup states
  const [orderLookupMode, setOrderLookupMode] = useState<boolean>(false);
  const [orderIdInput, setOrderIdInput] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string>('');

  // Icon mapping function
  const getIconComponent = (iconName: IconName): React.ComponentType<any> => {
    const iconMap: Record<IconName, React.ComponentType<any>> = {
      Package,
      TrendingUp,
      Users,
      BarChart3,
      AlertTriangle,
      Bell,
      Plus,
      Search,
      Filter,
      ShoppingCart,
      UserPlus,
      Settings
    };
    return iconMap[iconName] || Package;
  };

  useEffect(() => {
    const userId = user?.id || user?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch stats
    const statsRef = ref(realtimeDb, `wholesalers/${userId}/stats`);
    onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ensure we only get valid Stat objects with proper string values
        const statsArray = Object.values(data).map((item: any) => ({
          icon: typeof item.icon === 'string' ? item.icon : 'Package',
          color: typeof item.color === 'string' ? item.color : 'bg-blue-500',
          value: typeof item.value === 'string' || typeof item.value === 'number' ? item.value : '0',
          label: typeof item.label === 'string' ? item.label : 'N/A',
          change: typeof item.change === 'string' ? item.change : '+0%'
        })) as Stat[];
        setStats(statsArray);
      } else {
        setStats([]);
      }
    });

    // Fetch low stock
    const lowStockRef = ref(realtimeDb, `wholesalers/${userId}/lowStock`);
    onValue(lowStockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLowStockItems(Object.values(data) as InventoryItem[]);
      } else {
        setLowStockItems([]);
      }
    });

    // Fetch my inventory
    const inventoryRef = ref(realtimeDb, `wholesalers/${userId}/inventory`);
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMyInventory(Object.values(data) as InventoryItem[]);
      } else {
        setMyInventory([]);
      }
    });

    // Fetch recent orders
    const ordersRef = ref(realtimeDb, `orders/wholesaler/${userId}`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Debug: Log the raw data to see what we're getting
        console.log('Raw order data:', data);
        
        // Ensure we only get valid Order objects with proper string values
        const orders = Object.values(data).map((item: any) => {
          console.log('Processing order item:', item);
          
          const processedOrder = {
            id: safeRender(item.trackingId || item.id) || 'N/A',
            retailer: safeRender(item.retailerName || item.retailer) || 'Unknown Retailer',
            retailerId: safeRender(item.retailerId) || '',
            items: formatOrderItems(item.items) || 'No items',
            amount: typeof item.total === 'number' ? item.total : (typeof item.amount === 'number' ? item.amount : 0),
            status: safeRender(item.currentStatus || item.status) || 'Pending',
            paymentStatus: safeRender(item.paymentStatus) || 'Pending',
            date: safeRender(item.date) || new Date().toISOString()
          };
          
          console.log('Processed order:', processedOrder);
          return processedOrder;
        }) as Order[];
        setRecentOrders(orders.slice(-3)); // Last 3 orders
      } else {
        setRecentOrders([]);
      }
    });

    // Fetch AI suggestions (could be computed or from ML endpoint)
    const suggestionsRef = ref(realtimeDb, `wholesalers/${userId}/suggestions`);
    onValue(suggestionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Ensure we only get valid AISuggestion objects
        const suggestions = Object.values(data).map((item: any) => {
          // Use safeRender to handle any complex objects safely
          return {
            priority: safeRender(item.priority) || 'medium',
            message: safeRender(item.message || item.note || item) || 'No message available'
          };
        }) as AISuggestion[];
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions([]);
      }
    });

    // Fetch wholesaler profile information
    const profileRef = ref(realtimeDb, `users/${userId}`);
    onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWholesalerInfo({
          id: userId,
          shopName: data.businessName || data.fullName || 'Wholesaler Shop',
          address: data.address || 'Address not provided',
          phone: data.phone || '',
          fullName: data.fullName || 'Wholesaler'
        });
      }
    });

    setLoading(false);
  }, [user?.id, user?.uid]);

  const handleRestock = async (item: InventoryItem) => {
    try {
      const userId = user?.id || user?.uid;
      if (!userId) return;
      
      // Simulate/update stock in DB
      await dbSet(ref(realtimeDb, `wholesalers/${userId}/inventory/${item.name}`), {
        ...item,
        current: item.minimum + 10 // Auto-restock logic
      });
      alert(`${item.name} restocked!`);
    } catch (err) {
      setError('Failed to restock');
      console.error('Restock error:', err);
    }
  };

  // Handler for viewing order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handler for order update from modal
  const handleOrderUpdate = (updatedOrder: Order) => {
    setRecentOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  // Handler for adding new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = user?.id || user?.uid;
      if (!userId) return;

      await WholesalerDataService.addInventoryItem(userId, {
        ...productForm,
        current: Number(productForm.current),
        minimum: Number(productForm.minimum),
        maximum: Number(productForm.maximum),
        price: Number(productForm.price),
        demand: productForm.demand as 'Low' | 'Medium' | 'High',
        lastRestocked: new Date().toISOString()
      });

      // Reset form and close modal
      setProductForm({
        name: '',
        category: '',
        current: 0,
        minimum: 10,
        maximum: 100,
        price: 0,
        unit: 'kg',
        supplier: '',
        demand: 'Medium'
      });
      setShowAddProduct(false);
      alert('Product added successfully!');
    } catch (err) {
      setError('Failed to add product');
      console.error('Add product error:', err);
    }
  };

  // Handler for adding new retailer
  const handleAddRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = user?.id || user?.uid;
      if (!userId) return;

      await WholesalerDataService.addRetailer(userId, {
        ...retailerForm,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: '',
        creditLimit: Number(retailerForm.creditLimit),
        status: retailerForm.status as 'Active' | 'Inactive' | 'Pending'
      });

      // Reset form and close modal
      setRetailerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 50000,
        paymentTerms: '30 days',
        status: 'Active'
      });
      setShowAddRetailer(false);
      alert('Retailer added successfully!');
    } catch (err) {
      setError('Failed to add retailer');
      console.error('Add retailer error:', err);
    }
  };

  // Handler for fetching order by ID
  // Helper function to parse items data and extract product names
  const parseItemsData = (itemsData: any): string => {
    if (!itemsData) return 'No items specified';
    
    // If it's already a string, return as is
    if (typeof itemsData === 'string') {
      return itemsData;
    }
    
    // If it's an array of items
    if (Array.isArray(itemsData)) {
      return itemsData.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // Try different possible field names for product name
          const name = item.name || item.productName || item.product || item.title || item.itemName;
          const quantity = item.quantity || item.qty || item.count || '';
          const unit = item.unit || '';
          
          if (name) {
            return quantity ? `${name} (${quantity}${unit ? ' ' + unit : ''})` : name;
          }
          return JSON.stringify(item);
        }
        return String(item);
      }).join(', ');
    }
    
    // If it's a single object
    if (typeof itemsData === 'object' && itemsData !== null) {
      // Check if it's a single item object
      const name = itemsData.name || itemsData.productName || itemsData.product || itemsData.title || itemsData.itemName;
      const quantity = itemsData.quantity || itemsData.qty || itemsData.count || '';
      const unit = itemsData.unit || '';
      
      if (name) {
        return quantity ? `${name} (${quantity}${unit ? ' ' + unit : ''})` : name;
      }
      
      // If it's an object with multiple items as properties
      const itemEntries = Object.entries(itemsData);
      if (itemEntries.length > 0) {
        return itemEntries.map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const itemName = (value as any).name || (value as any).productName || key;
            const itemQty = (value as any).quantity || (value as any).qty || '';
            const itemUnit = (value as any).unit || '';
            return itemQty ? `${itemName} (${itemQty}${itemUnit ? ' ' + itemUnit : ''})` : itemName;
          }
          return `${key}: ${value}`;
        }).join(', ');
      }
      
      // Fallback: try to extract meaningful information
      return JSON.stringify(itemsData);
    }
    
    // Fallback for any other type
    return String(itemsData);
  };

  const handleFetchOrderById = async () => {
    if (!orderIdInput.trim()) {
      setLookupError('Please enter an Order ID');
      return;
    }

    setLookupLoading(true);
    setLookupError('');

    try {
      const userId = user?.id || user?.uid;
      if (!userId) return;

      // Search in multiple locations for the order
      const searchPaths = [
        `orders/wholesaler/${userId}/${orderIdInput}`,
        `orders/retailer/${orderIdInput}`,
        `wholesalers/${userId}/orders/${orderIdInput}`
      ];

      let foundOrder = null;
      let orderSource = '';

      // Try to find the order in different locations
      for (const path of searchPaths) {
        try {
          const orderRef = ref(realtimeDb, path);
          const snapshot = await get(orderRef);
          if (snapshot.exists()) {
            foundOrder = snapshot.val();
            orderSource = path;
            break;
          }
        } catch (err) {
          console.log(`Order not found in ${path}`);
        }
      }

      // If not found in specific paths, search globally
      if (!foundOrder) {
        const globalOrdersRef = ref(realtimeDb, 'orders');
        const globalSnapshot = await get(globalOrdersRef);
        if (globalSnapshot.exists()) {
          const allOrders = globalSnapshot.val();
          // Search through all roles and users
          for (const role in allOrders) {
            for (const userId in allOrders[role]) {
              if (allOrders[role][userId][orderIdInput]) {
                foundOrder = allOrders[role][userId][orderIdInput];
                orderSource = `orders/${role}/${userId}/${orderIdInput}`;
                break;
              }
            }
            if (foundOrder) break;
          }
        }
      }

      if (foundOrder) {
        // Parse items data to extract product names properly
        const itemsData = foundOrder.items || foundOrder.orderItems || foundOrder.products;
        const parsedItems = parseItemsData(itemsData);

        // Populate the form with fetched order data
        setOrderForm({
          retailer: foundOrder.retailerName || foundOrder.retailer || 'Unknown Retailer',
          retailerId: foundOrder.retailerId || foundOrder.userId || '',
          items: parsedItems,
          amount: foundOrder.total || foundOrder.amount || 0,
          status: foundOrder.status || 'Pending',
          paymentStatus: foundOrder.paymentStatus || 'Pending'
        });

        setLookupError('');
        alert(`Order found! Data loaded from: ${orderSource}`);
      } else {
        setLookupError('Order not found. Please check the Order ID and try again.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setLookupError('Failed to fetch order. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Handler for adding new order
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = user?.id || user?.uid;
      if (!userId) return;

      await WholesalerDataService.addOrder(userId, {
        ...orderForm,
        amount: Number(orderForm.amount),
        status: orderForm.status as 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered',
        paymentStatus: orderForm.paymentStatus as 'Pending' | 'Paid' | 'Overdue',
        date: new Date().toISOString()
      });

      // Reset form and close modal
      setOrderForm({
        retailer: '',
        retailerId: '',
        items: '',
        amount: 0,
        status: 'Pending',
        paymentStatus: 'Pending'
      });
      setOrderIdInput('');
      setOrderLookupMode(false);
      setLookupError('');
      setShowAddOrder(false);
      alert('Order added successfully!');
    } catch (err) {
      setError('Failed to add order');
      console.error('Add order error:', err);
    }
  };

  // Handler for marking order as packed
  const handleMarkAsPacked = async (order: Order) => {
    if (!order.id) {
      alert('Order ID is missing');
      return;
    }

    try {
      // Add to packing orders to show loading state
      setPackingOrders(prev => new Set(prev).add(order.id!));

      const userId = user?.id || user?.uid;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Get retailer information from database
      let retailerInfo = {
        name: order.retailer || 'Retailer',
        shopName: order.retailerShopName || order.retailer || 'Retailer Shop',
        address: order.retailerAddress || 'Address not provided',
        phone: order.retailerPhone || '',
        email: '' // Will be fetched from database if available
      };

      // If retailer info is missing, try to fetch from database
      if (!order.retailerAddress && order.retailerId) {
        try {
          const retailerRef = ref(realtimeDb, `users/${order.retailerId}`);
          const retailerSnapshot = await new Promise((resolve, reject) => {
            onValue(retailerRef, resolve, reject, { onlyOnce: true });
          });
          
          const retailerData = (retailerSnapshot as any).val();
          if (retailerData) {
            retailerInfo = {
              name: retailerData.fullName || 'Retailer',
              shopName: retailerData.businessName || retailerData.fullName || 'Retailer Shop',
              address: retailerData.address || 'Address not provided',
              phone: retailerData.phone || '',
              email: retailerData.email || ''
            };
          }
        } catch (err) {
          console.warn('Could not fetch retailer info:', err);
        }
      }

      // Calculate distance and delivery cost
      const distanceResult = await DistanceService.calculateDistance(
        wholesalerInfo.address,
        retailerInfo.address
      );

      // Update order status to "Packed"
      const updatedOrder = {
        ...order,
        status: 'Packed' as const,
        packedAt: Date.now(),
        deliveryDistance: distanceResult.distance,
        deliveryCost: distanceResult.cost,
        retailerShopName: retailerInfo.shopName,
        retailerAddress: retailerInfo.address,
        retailerPhone: retailerInfo.phone
      };

      // Update in database
      await NotificationService.updateOrderStatus(
        userId,
        order.id,
        'Packed',
        updatedOrder
      );

      // Notify ALL vehicle owners about the new delivery opportunity
      await NotificationService.notifyVehicleOwners({
        orderId: order.id,
        retailer: {
          name: retailerInfo.name,
          shopName: retailerInfo.shopName,
          address: retailerInfo.address,
          phone: retailerInfo.phone,
          email: retailerInfo.email
        },
        wholesaler: {
          name: wholesalerInfo.fullName,
          shopName: wholesalerInfo.shopName,
          address: wholesalerInfo.address,
          phone: wholesalerInfo.phone
        },
        distance: distanceResult.distance,
        deliveryCost: distanceResult.cost,
        orderAmount: order.amount || 0,
        items: order.items || 'Various items'
      });

      // Log activity
      await NotificationService.logActivity(
        userId,
        'wholesaler',
        user?.name || 'Wholesaler',
        `Marked order ${order.id} as packed and notified all vehicle owners`,
        `Distance: ${distanceResult.distance}km, Cost: ₹${distanceResult.cost}`
      );

      // Update local state
      setRecentOrders(prev => 
        prev.map(o => o.id === order.id ? updatedOrder : o)
      );

      alert(`Order marked as packed! All vehicle owners have been notified. Distance: ${distanceResult.distance}km, Cost: ₹${distanceResult.cost}`);

    } catch (error) {
      console.error('Error marking order as packed:', error);
      alert(`Failed to mark order as packed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Remove from packing orders
      setPackingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id!);
        return newSet;
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KYC Alert */}
        <KYCAlert />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A]">
                Welcome, {user?.name || 'Wholesaler'}!
              </h1>
              <p className="text-gray-600">Manage your wholesale business efficiently</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowInventory(true)}
                className="bg-[#0D1B2A] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>My Inventory</span>
              </button>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
              <button 
                onClick={() => setShowAddRetailer(true)}
                className="bg-[#FFC947] text-[#0D1B2A] px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Retailer</span>
              </button>
              <button 
                onClick={() => setShowAddOrder(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add Order</span>
              </button>
              <button 
                onClick={() => setShowRetailerOrders(true)}
                className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Retailer Orders</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && stats.length > 0 ? stats.map((stat: Stat, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color || 'bg-[#5DAE49]'} rounded-lg flex items-center justify-center`}>
                  {stat.icon ? React.createElement(getIconComponent(stat.icon), { className: "h-6 w-6 text-white" }) : <Package className="h-6 w-6 text-white" />}
                </div>
                <span className="text-green-600 text-sm font-semibold">
                  {stat.change || '+0'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">
                {stat.value || '0'}
              </h3>
              <p className="text-gray-600 text-sm">{stat.label || 'N/A'}</p>
            </motion.div>
          )) : (
            // Default stats when no data
            ([
              { icon: 'Package', color: 'bg-blue-500', value: '0', label: 'Total Orders', change: '+0%' },
              { icon: 'TrendingUp', color: 'bg-green-500', value: '₹0', label: 'Monthly Revenue', change: '+0%' },
              { icon: 'Users', color: 'bg-purple-500', value: '0', label: 'Active Retailers', change: '+0%' },
              { icon: 'BarChart3', color: 'bg-orange-500', value: '0', label: 'Total Products', change: '+0%' }
            ] as Stat[]).map((stat: Stat, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    {stat.icon && React.createElement(getIconComponent(stat.icon), { className: "h-6 w-6 text-white" })}
                  </div>
                  <span className="text-green-600 text-sm font-semibold">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-2xl p-6 mb-8 text-white"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            AI-Powered Business Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions && aiSuggestions.length > 0 ? aiSuggestions.map((suggestion: AISuggestion, index: number) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                  suggestion.priority === 'high' ? 'bg-red-500' :
                  suggestion.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}>
                  {suggestion.priority?.toUpperCase() || 'MED'}
                </div>
                <p className="text-sm opacity-90">{safeRender(suggestion.message)}</p>
              </div>
            )) : (
              <div className="col-span-3 text-center py-4">
                <p className="text-white/70">No AI suggestions available yet</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Low Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Low Stock Alerts
                </h3>
                <button className="text-[#5DAE49] text-sm font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {lowStockItems && lowStockItems.length > 0 ? lowStockItems.map((item: InventoryItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h4 className="font-semibold text-[#0D1B2A]">{item.name || 'N/A'}</h4>
                      <p className="text-sm text-gray-600">
                        Current: {item.current || 0} | Minimum: {item.minimum || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.demand === 'High' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {item.demand || 'Medium'} Demand
                      </div>
                      <button 
                        onClick={() => handleRestock(item)}
                        className="mt-2 bg-[#5DAE49] text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No low stock items</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0D1B2A]">Recent Orders</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Search className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Retailer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: Order, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#0D1B2A]">{safeRender(order.id)}</td>
                        <td className="py-3 px-4 text-gray-600">{safeRender(order.retailer)}</td>
                        <td className="py-3 px-4 text-gray-600" title={order.items}>{order.items}</td>
                        <td className="py-3 px-4 font-semibold text-[#5DAE49]">₹{order.amount || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Packed' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {safeRender(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewOrderDetails(order)}
                              className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Details</span>
                            </button>
                            
                            {/* Mark as Packed Button - Always visible for all orders */}
                            {order.status === 'Packed' ? (
                              <button
                                disabled
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 cursor-not-allowed flex items-center space-x-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Packed ✅</span>
                              </button>
                            ) : order.status === 'Shipped' ? (
                              <button
                                disabled
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 cursor-not-allowed flex items-center space-x-1"
                              >
                                <Truck className="h-3 w-3" />
                                <span>Shipped</span>
                              </button>
                            ) : order.status === 'Delivered' ? (
                              <button
                                disabled
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 cursor-not-allowed flex items-center space-x-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Delivered</span>
                              </button>
                            ) : (
                              // Show Mark as Packed button for all other statuses (Pending, Confirmed, etc.)
                              <button
                                onClick={() => handleMarkAsPacked(order)}
                                disabled={packingOrders.has(order.id || '')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                                  packingOrders.has(order.id || '')
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : order.status === 'Pending'
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {packingOrders.has(order.id || '') ? (
                                  <>
                                    <Clock className="h-3 w-3 animate-spin" />
                                    <span>Packing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Package className="h-3 w-3" />
                                    <span>Mark as Packed</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="w-full bg-[#5DAE49] text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </button>
                <button 
                  onClick={() => setShowAddRetailer(true)}
                  className="w-full bg-[#FFC947] text-[#0D1B2A] p-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Retailer</span>
                </button>
                <button 
                  onClick={() => setShowAddOrder(true)}
                  className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create New Order</span>
                </button>
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders Fulfilled</span>
                  <span className="font-bold text-[#5DAE49]">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-bold text-[#FFC947]">4.8 ⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-bold text-[#0D1B2A]">2.3 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Return Rate</span>
                  <span className="font-bold text-green-600">1.2%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.current}
                    onChange={(e) => setProductForm({...productForm, current: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.minimum}
                    onChange={(e) => setProductForm({...productForm, minimum: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="pieces">pieces</option>
                    <option value="liters">liters</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={productForm.supplier}
                  onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demand Level</label>
                <select
                  value={productForm.demand}
                  onChange={(e) => setProductForm({...productForm, demand: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Retailer Modal */}
      {showAddRetailer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">Add New Retailer</h3>
            <form onSubmit={handleAddRetailer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retailer Name</label>
                <input
                  type="text"
                  required
                  value={retailerForm.name}
                  onChange={(e) => setRetailerForm({...retailerForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={retailerForm.email}
                  onChange={(e) => setRetailerForm({...retailerForm, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={retailerForm.phone}
                  onChange={(e) => setRetailerForm({...retailerForm, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  required
                  value={retailerForm.address}
                  onChange={(e) => setRetailerForm({...retailerForm, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={retailerForm.creditLimit}
                    onChange={(e) => setRetailerForm({...retailerForm, creditLimit: Number(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={retailerForm.paymentTerms}
                    onChange={(e) => setRetailerForm({...retailerForm, paymentTerms: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  >
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="45 days">45 days</option>
                    <option value="60 days">60 days</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRetailer(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC947] text-[#0D1B2A] py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Add Retailer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">Create New Order</h3>
            
            {/* Order Input Mode Toggle */}
            <div className="mb-6">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderLookupMode(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !orderLookupMode 
                      ? 'bg-white text-[#0D1B2A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setOrderLookupMode(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    orderLookupMode 
                      ? 'bg-white text-[#0D1B2A] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Order ID Lookup
                </button>
              </div>
            </div>

            {/* Order ID Lookup Section */}
            {orderLookupMode && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Fetch Order by ID</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g., order_123456)"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleFetchOrderById}
                    disabled={lookupLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {lookupLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Fetching...</span>
                      </div>
                    ) : (
                      'Fetch'
                    )}
                  </button>
                </div>
                {lookupError && (
                  <p className="mt-2 text-sm text-red-600">{lookupError}</p>
                )}
                <p className="mt-2 text-xs text-blue-600">
                  This will search for the order across all databases and auto-fill the form below.
                </p>
              </div>
            )}

            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retailer Name</label>
                <input
                  type="text"
                  required
                  value={orderForm.retailer}
                  onChange={(e) => setOrderForm({...orderForm, retailer: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  placeholder="Enter retailer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retailer ID</label>
                <input
                  type="text"
                  value={orderForm.retailerId}
                  onChange={(e) => setOrderForm({...orderForm, retailerId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  placeholder="Retailer ID (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items Description</label>
                <textarea
                  required
                  value={orderForm.items}
                  onChange={(e) => setOrderForm({...orderForm, items: e.target.value})}
                  placeholder="e.g., 50kg Rice, 20kg Wheat, 10L Oil"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm({...orderForm, amount: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={orderForm.paymentStatus}
                    onChange={(e) => setOrderForm({...orderForm, paymentStatus: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddOrder(false);
                    setOrderLookupMode(false);
                    setOrderIdInput('');
                    setLookupError('');
                    setOrderForm({
                      retailer: '',
                      retailerId: '',
                      items: '',
                      amount: 0,
                      status: 'Pending',
                      paymentStatus: 'Pending'
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0D1B2A]">My Inventory</h3>
              <button
                onClick={() => setShowInventory(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {!myInventory || myInventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products in inventory yet</p>
                <p className="text-gray-400 text-sm">Add products using the "Add Product" button</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myInventory.map((item: InventoryItem, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[#0D1B2A] text-lg">{item.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.demand === 'High' ? 'bg-red-100 text-red-800' :
                        item.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.demand} Demand
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className={`font-medium ${
                          item.current <= item.minimum ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.current} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Stock:</span>
                        <span className="font-medium">{item.minimum} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-[#5DAE49]">₹{item.price}/{item.unit}</span>
                      </div>
                      {item.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span className="font-medium">{item.supplier}</span>
                        </div>
                      )}
                    </div>
                    
                    {item.current <= item.minimum && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-600 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Low Stock Alert!</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex space-x-2">
                      <button 
                        onClick={() => handleRestock(item)}
                        className="flex-1 bg-[#5DAE49] text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Restock
                      </button>
                      <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total Products: <span className="font-medium text-[#0D1B2A]">{myInventory ? myInventory.length : 0}</span>
                </div>
                <button
                  onClick={() => {
                    setShowInventory(false);
                    setShowAddProduct(true);
                  }}
                  className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retailer Orders View Modal */}
      {showRetailerOrders && (
        <RetailerOrdersView 
          isOpen={showRetailerOrders}
          onClose={() => setShowRetailerOrders(false)}
          wholesalerId={user?.id || ''}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        wholesalerInfo={wholesalerInfo}
        onOrderUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default WholesalerDashboard;