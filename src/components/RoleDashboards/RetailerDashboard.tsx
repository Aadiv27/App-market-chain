import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Search, 
  Filter,
  Heart,
  AlertCircle,
  UserCheck,
  Clock,
  Check,
  X,
  MapPin,
  Plus,
  Minus,
  Star,
  Truck
} from 'lucide-react';
import { ref, onValue, set as dbSet, push } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';
import KYCAlert from '../KYCAlert';

import { useNavigationReset } from '../../hooks/useNavigationReset';

// Define interfaces for type safety
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  stock?: number;
  description?: string;
  wholesalerId?: string;
  wholesalerName?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderStatus {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  note?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus[];
  currentStatus: OrderStatus['status'];
  date: string;
  wholesalerUid?: string;
  trackingId?: string;
}

interface InventoryItem {
  name: string;
  stock: number;
}

interface Wholesaler {
  id: string;
  name: string;
  shopName: string;
  location: string;
  rating?: number;
}

const RetailerDashboard = React.memo(() => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [lowStockItems, setLowStockItems] = useState<[string, InventoryItem][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showCart, setShowCart] = useState<boolean>(false);
  const [isOrderMode, setIsOrderMode] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // FMCG Categories with specific items
  const categories = ['all', 'rice', 'sugar', 'pulses', 'dairy', 'snacks', 'beverages', 'spices', 'oil', 'flour'];

  // Status icons mapping
  const statusIcons = {
    pending: Clock,
    confirmed: UserCheck,
    shipped: MapPin,
    delivered: Check,
    cancelled: X
  };

  // Debounce search query to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products from wholesalers (real-time from Firebase)
  useEffect(() => {
    if (user?.id) {
      try {
        const productsRef = ref(realtimeDb, `products`);
        const unsubscribe = onValue(productsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
              const productsArray = Object.entries(data)
                .filter(([_, product]) => product && typeof product === 'object')
                .map(([id, product]: [string, unknown]) => ({
                  id,
                  ...(product as Omit<Product, 'id'>)
                })) as Product[];
              setProducts(productsArray);
            } else {
              setProducts([]);
            }
            setLoading(false);
            setError(''); // Clear any previous errors
          } catch (parseError) {
            console.error('Error parsing products data:', parseError);
            setError('Failed to parse products data');
            setLoading(false);
          }
        }, (err) => {
          setError('Failed to load products');
          console.error('Products fetch error:', err);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (initError) {
        console.error('Error initializing products listener:', initError);
        setError('Failed to initialize products');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch real wholesalers from users collection (only those who have signed up)
  useEffect(() => {
    try {
      const usersRef = ref(realtimeDb, `users`);
      const unsubscribe = onValue(usersRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data && typeof data === 'object') {
            const wholesalersArray = Object.entries(data)
              .filter(([_, user]) => {
                const userData = user as any;
                return userData && 
                       typeof userData === 'object' && 
                       (userData.role === 'wholesaler' || userData.activeRole?.type === 'wholesaler');
              })
              .map(([id, user]: [string, unknown]) => {
                const userData = user as any;
                return {
                  id,
                  name: userData.name || 'Unknown Wholesaler',
                  shopName: userData.shopName || userData.businessName || userData.name || 'Unknown Shop',
                  location: userData.location || userData.address || 'Unknown Location',
                  rating: userData.rating || 4.0
                };
              }) as Wholesaler[];
            setWholesalers(wholesalersArray);
            console.log('🏪 Real wholesalers loaded:', wholesalersArray.length);
          } else {
            setWholesalers([]);
            console.log('🏪 No wholesalers found in users collection');
          }
        } catch (parseError) {
          console.error('Error parsing wholesalers data:', parseError);
          setWholesalers([]);
        }
      }, (err) => {
        console.error('Wholesalers fetch error:', err);
        setWholesalers([]);
      });
      return () => unsubscribe();
    } catch (initError) {
      console.error('Error initializing wholesalers listener:', initError);
      setWholesalers([]);
    }
  }, []);

  // Fetch order history with tracking updates
  useEffect(() => {
    if (user?.id) {
      const ordersRef = ref(realtimeDb, `orders/retailer/${user.id}`);
      const unsubscribe = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ordersArray = Object.entries(data).map(([id, orderData]: [string, unknown]) => {
            const order = orderData as Omit<Order, 'id'>;
            const currentStatus = order.status && order.status.length > 0 
              ? order.status[order.status.length - 1].status 
              : 'pending';
            return {
              id,
              ...order,
              currentStatus
            } as Order;
          });
          setOrders(ordersArray);
        } else {
          setOrders([]);
        }
      }, (err) => {
        console.error('Order fetch error:', err);
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Fetch low-stock alerts (from retailer's inventory)
  useEffect(() => {
    if (user?.id) {
      const inventoryRef = ref(realtimeDb, `inventory/${user.id}`);
      const unsubscribe = onValue(inventoryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const lowStock = Object.entries(data).filter(([_, item]: [string, unknown]) => 
            (item as InventoryItem).stock && (item as InventoryItem).stock < 10
          ) as [string, InventoryItem][];
          setLowStockItems(lowStock);
        } else {
          setLowStockItems([]);
        }
      }, (err) => {
        console.error('Inventory fetch error:', err);
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Cart functions
  const addToCart = (product: Product) => {
    if (!product || !product.id) {
      console.error('Invalid product data');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 999) } // Max quantity limit
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId) {
      console.error('Invalid product ID');
      return;
    }
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Limit quantity to reasonable bounds
    const validQuantity = Math.min(Math.max(quantity, 1), 999);
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: validQuantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return total + (price * quantity);
    }, 0);
  };

  // Product selection functions for order mode
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const startOrderMode = () => {
    setIsOrderMode(true);
    setSelectedProducts(new Set());
    setShowCart(false);
  };

  const exitOrderMode = () => {
    setIsOrderMode(false);
    setSelectedProducts(new Set());
  };

  const proceedToCart = () => {
    // Add all selected products to cart
    const productsToAdd = products.filter(product => selectedProducts.has(product.id));
    
    // Clear existing cart and add selected products
    setCart(productsToAdd.map(product => ({ ...product, quantity: 1 })));
    
    // Exit order mode and show cart
    setIsOrderMode(false);
    setSelectedProducts(new Set());
    setShowCart(true);
  };

  // Place order function
  const placeOrder = async () => {
    if (cart.length === 0 || !user?.id) return;
    
    if (wholesalers.length === 0) {
      alert('No wholesalers are currently available. Only registered wholesalers can receive orders.');
      return;
    }
    
    if (!selectedWholesaler) {
      alert('Please select a wholesaler before placing the order.');
      return;
    }

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const newOrder: Omit<Order, 'id'> = {
        items: cart,
        total: getTotalPrice(),
        status: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully'
        }],
        currentStatus: 'pending',
        date: new Date().toISOString(),
        wholesalerUid: selectedWholesaler,
        trackingId: orderId
      };

      // Save order to retailer's orders
      const retailerOrderRef = ref(realtimeDb, `orders/retailer/${user.id}/${orderId}`);
      await dbSet(retailerOrderRef, newOrder);
      
      // Save order to wholesaler's incoming orders
      const wholesalerOrderRef = ref(realtimeDb, `orders/wholesaler/${selectedWholesaler}/${orderId}`);
      const wholesalerOrder = {
        ...newOrder,
        retailerId: user.id,
        retailerName: user.name || 'Unknown Retailer',
        orderFrom: 'retailer'
      };
      await dbSet(wholesalerOrderRef, wholesalerOrder);
      
      // Update wholesaler's order statistics
      const wholesalerStatsRef = ref(realtimeDb, `wholesalers/${selectedWholesaler}/stats`);
      const statsSnapshot = await new Promise((resolve) => {
        onValue(wholesalerStatsRef, resolve, { onlyOnce: true });
      });
      const currentStats = (statsSnapshot as any).val() || { totalOrders: 0, totalRevenue: 0 };
      
      await dbSet(wholesalerStatsRef, {
        totalOrders: (currentStats.totalOrders || 0) + 1,
        totalRevenue: (currentStats.totalRevenue || 0) + getTotalPrice(),
        lastOrderDate: new Date().toISOString()
      });
      
      // Clear cart after successful order
      setCart([]);
      setSelectedWholesaler(null);
      setShowCart(false);
      alert(`Order placed successfully! Order ID: ${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  // Memoized filtered products to prevent excessive re-calculations
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product || !product.name || !product.category) return false;
      
      const productName = String(product.name).toLowerCase();
      const productCategory = String(product.category).toLowerCase();
      const searchTerm = String(debouncedSearchQuery).toLowerCase();
      const filterCat = String(filterCategory).toLowerCase();
      
      const matchesSearch = productName.includes(searchTerm) || productCategory.includes(searchTerm);
      const matchesCategory = filterCat === 'all' || productCategory === filterCat;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchQuery, filterCategory]);

  // Memoized status color function
  const getStatusColor = useCallback((status: OrderStatus['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DAE49] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Retailer Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
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
                Retailer Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your inventory and orders</p>
            </div>
            <div className="flex items-center space-x-4">
              {!isOrderMode ? (
                <>
                  <button
                    onClick={startOrderMode}
                    className="bg-gradient-to-r from-[#5DAE49] to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <Package className="h-5 w-5" />
                    <span>Order & Product Selection</span>
                  </button>
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Cart</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.size} products selected
                  </span>
                  <button
                    onClick={proceedToCart}
                    disabled={selectedProducts.size === 0}
                    className={`px-6 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                      selectedProducts.size > 0
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Proceed to Cart</span>
                  </button>
                  <button
                    onClick={exitOrderMode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Exit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{products.length}</h3>
            <p className="text-gray-600 text-sm">Available Products</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{orders.length}</h3>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{lowStockItems.length}</h3>
            <p className="text-gray-600 text-sm">Low Stock Alerts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{wholesalers.length}</h3>
            <p className="text-gray-600 text-sm">Wholesalers</p>
          </motion.div>
        </div>

        {/* Quick Order Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">Quick Order - Popular FMCG Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['Rice', 'Sugar', 'Pulses', 'Oil', 'Flour', 'Spices'].map((item) => {
              const matchingProducts = products.filter(p => {
                if (!p || !p.category || !p.name) return false;
                const category = String(p.category).toLowerCase();
                const name = String(p.name).toLowerCase();
                const itemLower = String(item).toLowerCase();
                return category === itemLower || name.includes(itemLower);
              });
              const hasProducts = matchingProducts.length > 0;
              
              return (
                <button
                  key={item}
                  onClick={() => {
                    setFilterCategory(item.toLowerCase());
                    setSearchQuery('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    hasProducts 
                      ? 'border-[#5DAE49] bg-green-50 hover:bg-green-100 text-[#5DAE49]' 
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!hasProducts}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">{item}</div>
                    <div className="text-xs mt-1">
                      {hasProducts ? `${matchingProducts.length} items` : 'No items'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0D1B2A]">
                  {isOrderMode ? 'Select Products for Order' : 'Available Products'}
                </h2>
                {isOrderMode && (
                  <div className="text-sm text-gray-600">
                    Click on products to select them for your order
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.id === product.id);
                  const isInCart = !!cartItem;
                  const isSelected = selectedProducts.has(product.id);
                  
                  // Debug: Log product image URL (remove this in production)
                  if (process.env.NODE_ENV === 'development' && product.image) {
                    console.log(`Product ${product.name} has image: ${product.image}`);
                  }
                  
                  return (
                    <div 
                      key={product.id} 
                      className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                        isOrderMode 
                          ? isSelected 
                            ? 'border-[#5DAE49] bg-green-50 shadow-md' 
                            : 'border-gray-200 hover:border-[#5DAE49] hover:shadow-md bg-white'
                          : 'border-gray-200 hover:shadow-md bg-white'
                      }`}
                      onClick={isOrderMode ? () => toggleProductSelection(product.id) : undefined}
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden group">
                        {product.image ? (
                          <>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide loading placeholder when image loads
                                const target = e.target as HTMLImageElement;
                                const loadingDiv = target.parentElement?.querySelector('.loading-placeholder');
                                if (loadingDiv) {
                                  loadingDiv.classList.add('hidden');
                                }
                              }}
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallbackDiv = target.parentElement?.querySelector('.fallback-placeholder');
                                if (fallbackDiv) {
                                  fallbackDiv.classList.remove('hidden');
                                }
                                const loadingDiv = target.parentElement?.querySelector('.loading-placeholder');
                                if (loadingDiv) {
                                  loadingDiv.classList.add('hidden');
                                }
                              }}
                            />
                            {/* Loading placeholder */}
                            <div className="loading-placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div className="text-center">
                                <div className="animate-pulse">
                                  <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                                  <div className="h-3 w-20 bg-gray-300 rounded mx-auto mb-1"></div>
                                  <div className="h-2 w-16 bg-gray-300 rounded mx-auto"></div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null}
                        
                        {/* Fallback placeholder */}
                        <div className={`fallback-placeholder ${product.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
                          <div className="text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm font-medium truncate px-2">{product.name}</p>
                            <p className="text-gray-400 text-xs uppercase">{product.category}</p>
                          </div>
                        </div>
                        
                        {/* Category badge overlay */}
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm ${
                            product.category === 'rice' ? 'bg-yellow-100/90 text-yellow-800' :
                            product.category === 'sugar' ? 'bg-pink-100/90 text-pink-800' :
                            product.category === 'pulses' ? 'bg-green-100/90 text-green-800' :
                            product.category === 'dairy' ? 'bg-blue-100/90 text-blue-800' :
                            product.category === 'spices' ? 'bg-red-100/90 text-red-800' :
                            product.category === 'oil' ? 'bg-orange-100/90 text-orange-800' :
                            product.category === 'snacks' ? 'bg-purple-100/90 text-purple-800' :
                            product.category === 'beverages' ? 'bg-indigo-100/90 text-indigo-800' :
                            product.category === 'flour' ? 'bg-amber-100/90 text-amber-800' :
                            'bg-gray-100/90 text-gray-800'
                          }`}>
                            {product.category.toUpperCase()}
                          </span>
                        </div>

                        {/* Selection indicator for order mode */}
                        {isOrderMode && (
                          <div className="absolute top-2 left-2">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm ${
                              isSelected 
                                ? 'bg-[#5DAE49] border-[#5DAE49]' 
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-[#0D1B2A] text-lg leading-tight">{product.name}</h3>
                        </div>
                      
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-xl font-bold text-[#5DAE49]">
                              ₹{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                            </span>
                            {product.wholesalerName && (
                              <p className="text-xs text-gray-500">by {String(product.wholesalerName)}</p>
                            )}
                          </div>
                          {product.stock && typeof product.stock === 'number' && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              product.stock > 50 ? 'bg-green-100 text-green-800' :
                              product.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Stock: {product.stock}
                            </div>
                          )}
                        </div>
                        
                        {!isOrderMode && (
                          <div className="flex items-center justify-between">
                            {!isInCart ? (
                              <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add to Cart</span>
                              </button>
                            ) : (
                              <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                <button
                                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                  className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-medium text-lg px-4">{cartItem.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                                  className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isOrderMode && isSelected && (
                          <div className="mt-3 p-2 bg-green-100 rounded-lg">
                            <p className="text-green-800 text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Selected for order
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart */}
            {showCart && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Shopping Cart</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">Total: ₹{getTotalPrice()}</span>
                    </div>
                    
                    {/* Wholesaler Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Wholesaler *
                      </label>
                      <select
                        value={selectedWholesaler || ''}
                        onChange={(e) => setSelectedWholesaler(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent text-sm"
                        required
                        disabled={wholesalers.length === 0}
                      >
                        <option value="">
                          {wholesalers.length === 0 
                            ? "No wholesalers available - Only registered wholesalers will appear here" 
                            : "Choose a wholesaler..."
                          }
                        </option>
                        {wholesalers.map((wholesaler) => (
                          <option key={wholesaler.id} value={wholesaler.id}>
                            {wholesaler.shopName} - {wholesaler.location}
                            {wholesaler.rating && ` (★${wholesaler.rating})`}
                          </option>
                        ))}
                      </select>
                      {wholesalers.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Only wholesalers who have signed up on the platform will appear in this list.
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={placeOrder}
                      disabled={!selectedWholesaler || wholesalers.length === 0}
                      className={`w-full py-2 rounded-lg transition-colors ${
                        selectedWholesaler && wholesalers.length > 0
                          ? 'bg-[#5DAE49] text-white hover:bg-green-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {wholesalers.length === 0 ? 'No Wholesalers Available' : 'Place Order'}
                    </button>
                  </div>
                )}
                {cart.length === 0 && (
                  <div className="text-center py-4">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Recent Orders</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {orders.slice(0, 5).map((order) => {
                  const StatusIcon = statusIcons[order.currentStatus];
                  return (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Order #{order.id.slice(-6)}</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(order.currentStatus)}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{order.currentStatus}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {order.items.length} items • ₹{order.total}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
              {orders.length === 0 && (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                </div>
              )}
            </motion.div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  Low Stock Alerts
                </h3>
                <div className="space-y-2">
                  {lowStockItems.map(([itemName, item]) => (
                    <div key={itemName} className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-yellow-600">{item.stock} left</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for Order Mode */}
      {isOrderMode && selectedProducts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={proceedToCart}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center space-x-3 text-lg font-semibold"
          >
            <ShoppingCart className="h-6 w-6" />
            <span>Proceed to Cart ({selectedProducts.size})</span>
          </button>
        </motion.div>
      )}

    </div>
  );
});

RetailerDashboard.displayName = 'RetailerDashboard';

export default RetailerDashboard;