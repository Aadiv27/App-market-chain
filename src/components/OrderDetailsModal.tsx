import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Package, 
  MapPin, 
  Phone, 
  Store, 
  User, 
  Clock, 
  CheckCircle,
  Truck,
  IndianRupee,
  Navigation
} from 'lucide-react';
import { ref, get, set, push } from 'firebase/database';
import { realtimeDb } from './lib/Firebase';
import { DistanceService } from '../services/distanceService';
import { NotificationService } from '../services/notificationService';

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
      return String(item);
    }).join(', ');
  }
  
  // For other object types, try to extract meaningful info
  if (typeof items === 'object') {
    return JSON.stringify(items);
  }
  
  return String(items);
};

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
  wholesalerId?: string;
  wholesalerShopName?: string;
  wholesalerAddress?: string;
  wholesalerPhone?: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  wholesalerInfo?: {
    id: string;
    shopName: string;
    address: string;
    phone: string;
    fullName: string;
  };
  onOrderUpdate?: (updatedOrder: Order) => void;
}

interface RetailerInfo {
  fullName: string;
  shopName: string;
  address: string;
  phone: string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  wholesalerInfo,
  onOrderUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [retailerInfo, setRetailerInfo] = useState<RetailerInfo | null>(null);
  const [packingOrder, setPackingOrder] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && order?.retailerId) {
      fetchRetailerInfo();
    }
  }, [isOpen, order?.retailerId]);

  const fetchRetailerInfo = async () => {
    if (!order?.retailerId) return;

    try {
      setLoading(true);
      const retailerRef = ref(realtimeDb, `users/${order.retailerId}`);
      const snapshot = await get(retailerRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRetailerInfo({
          fullName: data.fullName || 'N/A',
          shopName: data.shopName || 'N/A',
          address: data.address || 'N/A',
          phone: data.phone || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching retailer info:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = async () => {
    if (!wholesalerInfo?.address || !retailerInfo?.address) return;

    try {
      const distanceService = new DistanceService();
      const result = await distanceService.calculateDistance(
        wholesalerInfo.address,
        retailerInfo.address
      );
      
      setDistance(result.distance);
      setDeliveryCost(result.cost);
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to mock calculation
      const mockDistance = Math.floor(Math.random() * 50) + 5; // 5-55 km
      setDistance(mockDistance);
      setDeliveryCost(mockDistance * 10);
    }
  };

  useEffect(() => {
    if (retailerInfo && wholesalerInfo) {
      calculateDistance();
    }
  }, [retailerInfo, wholesalerInfo]);

  const handleItemPacked = async () => {
    if (!order?.id || !wholesalerInfo || !retailerInfo) return;

    try {
      setPackingOrder(true);

      // Calculate distance if not already calculated
      let finalDistance = distance;
      let finalCost = deliveryCost;

      if (!finalDistance || !finalCost) {
        const distanceService = new DistanceService();
        const result = await distanceService.calculateDistance(
          wholesalerInfo.address,
          retailerInfo.address
        );
        finalDistance = result.distance;
        finalCost = result.cost;
      }

      // Update order status in database
      const orderRef = ref(realtimeDb, `orders/wholesaler/${wholesalerInfo.id}/${order.id}`);
      const updatedOrder = {
        ...order,
        status: 'Packed' as const,
        packedAt: Date.now(),
        deliveryDistance: finalDistance,
        deliveryCost: finalCost
      };

      await set(orderRef, updatedOrder);

      // Send notification to vehicle owners
      const notificationService = new NotificationService();
      await notificationService.notifyVehicleOwners({
        orderId: order.id,
        retailer: {
          name: retailerInfo.fullName,
          shopName: retailerInfo.shopName,
          address: retailerInfo.address,
          phone: retailerInfo.phone
        },
        wholesaler: {
          name: wholesalerInfo.fullName,
          shopName: wholesalerInfo.shopName,
          address: wholesalerInfo.address,
          phone: wholesalerInfo.phone
        },
        distance: finalDistance || 0,
        deliveryCost: finalCost || 0,
        orderAmount: order.amount || 0,
        items: order.items || 'Various items'
      });

      // Call the update callback if provided
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }

      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error marking order as packed:', error);
      alert('Failed to mark order as packed. Please try again.');
    } finally {
      setPackingOrder(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#0D1B2A]">Order Details</h2>
            <p className="text-gray-600">Order ID: #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DAE49]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Information
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-gray-600 font-medium">Items:</span>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        {Array.isArray(order.items) ? (
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-[#0D1B2A]">
                                  {item.name || 'Unknown Item'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {item.quantity || 1} {item.unit || 'pcs'} × ₹{item.price || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-700">{formatOrderItems(order.items)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-[#5DAE49] flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {order.amount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Packed' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{order.date || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {(distance || deliveryCost) && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center">
                      <Navigation className="h-5 w-5 mr-2" />
                      Delivery Information
                    </h3>
                    <div className="space-y-3">
                      {distance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium">{distance} km</span>
                        </div>
                      )}
                      {deliveryCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Cost:</span>
                          <span className="font-bold text-blue-600 flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {deliveryCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {/* Retailer Info */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Retailer Information
                  </h3>
                  {retailerInfo ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{retailerInfo.fullName}</p>
                          <p className="text-sm text-gray-600">Owner</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{retailerInfo.shopName}</p>
                          <p className="text-sm text-gray-600">Shop Name</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{retailerInfo.address}</p>
                          <p className="text-sm text-gray-600">Delivery Address</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{retailerInfo.phone}</p>
                          <p className="text-sm text-gray-600">Contact Number</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DAE49] mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading retailer info...</p>
                    </div>
                  )}
                </div>

                {/* Wholesaler Info */}
                {wholesalerInfo && (
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4 flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      Wholesaler Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{wholesalerInfo.fullName}</p>
                          <p className="text-sm text-gray-600">Owner</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{wholesalerInfo.shopName}</p>
                          <p className="text-sm text-gray-600">Shop Name</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{wholesalerInfo.address}</p>
                          <p className="text-sm text-gray-600">Pickup Address</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{wholesalerInfo.phone}</p>
                          <p className="text-sm text-gray-600">Contact Number</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          
          {order.status === 'Confirmed' && (
            <button
              onClick={handleItemPacked}
              disabled={packingOrder || !retailerInfo}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                packingOrder || !retailerInfo
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#5DAE49] text-white hover:bg-green-600'
              }`}
            >
              {packingOrder ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Packing Items...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Mark Items as Packed</span>
                </>
              )}
            </button>
          )}

          {order.status === 'Packed' && (
            <button
              disabled
              className="px-6 py-2 rounded-lg font-medium bg-green-100 text-green-800 cursor-not-allowed flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Items Packed ✅</span>
            </button>
          )}

          {(order.status === 'Shipped' || order.status === 'Delivered') && (
            <button
              disabled
              className="px-6 py-2 rounded-lg font-medium bg-blue-100 text-blue-800 cursor-not-allowed flex items-center space-x-2"
            >
              <Truck className="h-4 w-4" />
              <span>{order.status}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsModal;