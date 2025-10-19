import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  ShoppingCart, 
  Calendar,
  DollarSign,
  Eye,
  X,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { ref, onValue, get } from 'firebase/database';
import { realtimeDb } from './lib/Firebase';
import { useAuth } from '../contexts/AuthContext';

interface RetailerInfo {
  id: string;
  name: string;
  email?: string;
  phone: string;
  shopName?: string;
  shopAddress?: string;
  address?: string;
  fullName?: string;
  role?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface Order {
  id: string;
  retailerId: string;
  retailerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  currentStatus: string;
  date: string;
  trackingId?: string;
  wholesalerUid?: string;
  orderFrom?: string;
}

interface RetailerOrdersViewProps {
  onClose: () => void;
}

const RetailerOrdersView: React.FC<RetailerOrdersViewProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [retailersInfo, setRetailersInfo] = useState<Record<string, RetailerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const fetchOrdersAndRetailers = async () => {
      if (!user?.id && !user?.uid) {
        setLoading(false);
        return;
      }

      const wholesalerId = user.id || user.uid;
      
      try {
        // Fetch orders from wholesaler's orders
        const ordersRef = ref(realtimeDb, `orders/wholesaler/${wholesalerId}`);
        onValue(ordersRef, async (snapshot) => {
          const ordersData = snapshot.val();
          if (ordersData) {
            const ordersList = Object.values(ordersData) as Order[];
            setOrders(ordersList);

            // Fetch retailer information for each unique retailer
            const uniqueRetailerIds = [...new Set(ordersList.map(order => order.retailerId))];
            const retailersInfoMap: Record<string, RetailerInfo> = {};

            for (const retailerId of uniqueRetailerIds) {
              try {
                // Try to get retailer info from users collection
                const userRef = ref(realtimeDb, `users/${retailerId}`);
                const userSnapshot = await get(userRef);
                
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.val();
                  retailersInfoMap[retailerId] = {
                    id: retailerId,
                    name: userData.fullName || userData.name || 'Unknown Retailer',
                    email: userData.email || '',
                    phone: userData.phoneNumber || userData.phone || '',
                    shopName: userData.shopName || userData.businessName || '',
                    shopAddress: userData.address || userData.businessAddress || '',
                    fullName: userData.fullName || userData.name || '',
                    role: userData.role || 'retailer'
                  };
                } else {
                  // Fallback: create basic info from order data
                  const orderWithRetailer = ordersList.find(o => o.retailerId === retailerId);
                  retailersInfoMap[retailerId] = {
                    id: retailerId,
                    name: orderWithRetailer?.retailerName || 'Unknown Retailer',
                    email: '',
                    phone: '',
                    shopName: '',
                    shopAddress: '',
                    fullName: orderWithRetailer?.retailerName || 'Unknown Retailer',
                    role: 'retailer'
                  };
                }
              } catch (error) {
                console.error(`Error fetching retailer info for ${retailerId}:`, error);
                // Create fallback retailer info
                const orderWithRetailer = ordersList.find(o => o.retailerId === retailerId);
                retailersInfoMap[retailerId] = {
                  id: retailerId,
                  name: orderWithRetailer?.retailerName || 'Unknown Retailer',
                  email: '',
                  phone: '',
                  shopName: '',
                  shopAddress: '',
                  fullName: orderWithRetailer?.retailerName || 'Unknown Retailer',
                  role: 'retailer'
                };
              }
            }

            setRetailersInfo(retailersInfoMap);
          } else {
            setOrders([]);
            setRetailersInfo({});
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching orders and retailers:', error);
        setLoading(false);
      }
    };

    fetchOrdersAndRetailers();
  }, [user?.id, user?.uid]);

  const filteredOrders = orders.filter(order => {
    const retailer = retailersInfo[order.retailerId];
    const matchesSearch = !searchQuery || 
      order.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (retailer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (retailer?.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalOrderValue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getUniqueRetailersCount = () => {
    return new Set(filteredOrders.map(order => order.retailerId)).size;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DAE49] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading retailer orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#0D1B2A]">Retailer Orders</h2>
            <p className="text-gray-600">View all orders from your retailers</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{filteredOrders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-green-900">₹{getTotalOrderValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Retailers</p>
                <p className="text-2xl font-bold text-purple-900">{getUniqueRetailersCount()}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-900">
                  {filteredOrders.filter(o => o.currentStatus === 'pending').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 p-6 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by retailer name, shop name, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button className="px-4 py-2 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-auto p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No retailers have placed orders yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Retailer Info</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Shop Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const retailer = retailersInfo[order.retailerId];
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#0D1B2A]">
                          {order.trackingId || order.id}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {retailer?.fullName || retailer?.name || order.retailerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {order.retailerId.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {retailer?.shopName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {retailer?.shopAddress || retailer?.address || 'Address not available'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-1" />
                              {retailer?.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {retailer?.email || 'Email not available'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {Array.isArray(order.items) ? (
                              <div>
                                <span className="font-medium">{order.items.length} items</span>
                                <div className="text-gray-500 text-xs">
                                  {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                  {order.items.length > 2 && '...'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Items info not available</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#5DAE49]">
                          ₹{order.total?.toLocaleString() || '0'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.currentStatus || order.status)}`}>
                            {(order.currentStatus || order.status || 'Unknown').charAt(0).toUpperCase() + 
                             (order.currentStatus || order.status || 'Unknown').slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(order.date)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2 text-[#5DAE49] hover:bg-green-50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0D1B2A]">Order Details</h3>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Order ID</label>
                      <p className="text-gray-900">{selectedOrder.trackingId || selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <p className="text-gray-900">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.currentStatus || selectedOrder.status)}`}>
                        {(selectedOrder.currentStatus || selectedOrder.status || 'Unknown').charAt(0).toUpperCase() + 
                         (selectedOrder.currentStatus || selectedOrder.status || 'Unknown').slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-gray-900 font-semibold">₹{selectedOrder.total?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  {/* Retailer Info */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Retailer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{retailersInfo[selectedOrder.retailerId]?.fullName || selectedOrder.retailerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Shop Name</label>
                        <p className="text-gray-900">{retailersInfo[selectedOrder.retailerId]?.shopName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{retailersInfo[selectedOrder.retailerId]?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{retailersInfo[selectedOrder.retailerId]?.email || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Shop Address</label>
                        <p className="text-gray-900">{retailersInfo[selectedOrder.retailerId]?.shopAddress || retailersInfo[selectedOrder.retailerId]?.address || 'Address not available'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} {item.unit || 'units'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-sm text-gray-600">₹{item.price} per {item.unit || 'unit'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No item details available</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RetailerOrdersView;