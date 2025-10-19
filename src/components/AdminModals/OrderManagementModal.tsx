import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  DollarSign
} from 'lucide-react';
import { ref, update, get } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

interface Order {
  id: string;
  userId: string;
  userRole: string;
  userName?: string;
  userEmail?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  createdAt: number;
  updatedAt?: number;
  deliveryAddress?: string;
  assignedVehicle?: string;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

interface OrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: () => void;
}

const OrderManagementModal: React.FC<OrderManagementModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [assignedVehicle, setAssignedVehicle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  useEffect(() => {
    if (order && isOpen) {
      fetchOrderDetails();
      fetchAvailableVehicles();
    }
  }, [order, isOpen]);

  const fetchOrderDetails = async () => {
    if (!order) return;
    
    try {
      setLoading(true);
      // Try to get more detailed order info
      const orderRef = ref(realtimeDb, `orders/${order.userRole}/${order.userId}/${order.id}`);
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        const detailedOrder = snapshot.val();
        setOrderDetails(detailedOrder);
        setNewStatus(detailedOrder.status);
        setAssignedVehicle(detailedOrder.assignedVehicle || '');
        setNotes(detailedOrder.notes || '');
      } else {
        setOrderDetails(order);
        setNewStatus(order.status);
        setAssignedVehicle(order.assignedVehicle || '');
        setNotes(order.notes || '');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
      setOrderDetails(order);
      setNewStatus(order.status);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const vehiclesRef = ref(realtimeDb, 'users');
      const snapshot = await get(vehiclesRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const vehicles = Object.values(users).filter((user: any) => 
          user.role === 'vehicle_owner' && user.isOnline
        );
        setAvailableVehicles(vehicles);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderDetails) return;

    try {
      setLoading(true);
      setError('');
      
      const updates: any = {};
      const orderPath = `orders/${orderDetails.userRole}/${orderDetails.userId}/${orderDetails.id}`;
      
      updates[`${orderPath}/status`] = newStatus;
      updates[`${orderPath}/updatedAt`] = Date.now();
      
      if (assignedVehicle) {
        updates[`${orderPath}/assignedVehicle`] = assignedVehicle;
      }
      
      if (notes) {
        updates[`${orderPath}/notes`] = notes;
      }

      // Add notification to user
      const notificationId = Date.now().toString();
      updates[`notifications/${orderDetails.userId}/${notificationId}`] = {
        id: notificationId,
        message: `Your order #${orderDetails.id} status has been updated to ${newStatus}`,
        type: 'info',
        time: new Date().toISOString(),
        read: false,
        orderId: orderDetails.id
      };

      // If assigning vehicle, notify vehicle owner
      if (assignedVehicle && assignedVehicle !== orderDetails.assignedVehicle) {
        const vehicleNotificationId = (Date.now() + 1).toString();
        updates[`notifications/${assignedVehicle}/${vehicleNotificationId}`] = {
          id: vehicleNotificationId,
          message: `New delivery assigned: Order #${orderDetails.id}`,
          type: 'info',
          time: new Date().toISOString(),
          read: false,
          orderId: orderDetails.id
        };
      }

      // Add activity log
      const activityId = Date.now().toString();
      updates[`activityLogs/admin/${activityId}`] = {
        id: activityId,
        userId: 'admin',
        userRole: 'admin',
        userName: 'Admin',
        action: `Updated order #${orderDetails.id} status to ${newStatus}`,
        timestamp: Date.now(),
        type: 'order',
        details: `Order: ${orderDetails.id}, Status: ${newStatus}, Vehicle: ${assignedVehicle || 'None'}`
      };

      await update(ref(realtimeDb), updates);
      
      setSuccess('Order updated successfully');
      onOrderUpdated();
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderDetails || !window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const updates: any = {};
      const orderPath = `orders/${orderDetails.userRole}/${orderDetails.userId}/${orderDetails.id}`;
      
      updates[`${orderPath}/status`] = 'cancelled';
      updates[`${orderPath}/updatedAt`] = Date.now();
      updates[`${orderPath}/cancelledBy`] = 'admin';

      // Add notification to user
      const notificationId = Date.now().toString();
      updates[`notifications/${orderDetails.userId}/${notificationId}`] = {
        id: notificationId,
        message: `Your order #${orderDetails.id} has been cancelled`,
        type: 'error',
        time: new Date().toISOString(),
        read: false,
        orderId: orderDetails.id
      };

      await update(ref(realtimeDb), updates);
      
      setSuccess('Order cancelled successfully');
      onOrderUpdated();
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#0D1B2A] flex items-center">
              <Package className="h-6 w-6 mr-2" />
              Order Management
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DAE49]"></div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            {orderDetails && !loading && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <div className="flex items-center mt-1">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">#{orderDetails.id}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer</label>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{orderDetails.userName || orderDetails.userEmail}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Amount</label>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-semibold">₹{orderDetails.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{formatDate(orderDetails.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(orderDetails.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer Role</label>
                      <div className="flex items-center mt-1">
                        <Eye className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 capitalize">{orderDetails.userRole.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {orderDetails.assignedVehicle && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Assigned Vehicle</label>
                        <div className="flex items-center mt-1">
                          <Truck className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{orderDetails.assignedVehicle}</span>
                        </div>
                      </div>
                    )}

                    {orderDetails.deliveryAddress && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{orderDetails.deliveryAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {orderDetails.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <span className="font-medium text-gray-900">{item.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({item.category})</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                              <div className="text-sm text-gray-500">{item.quantity} × ₹{item.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Update Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Vehicle
                      </label>
                      <select
                        value={assignedVehicle}
                        onChange={(e) => setAssignedVehicle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                      >
                        <option value="">Select Vehicle</option>
                        {availableVehicles.map((vehicle: any) => (
                          <option key={vehicle.uid} value={vehicle.uid}>
                            {vehicle.fullName} ({vehicle.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                      placeholder="Add any notes about this order..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update Order
                  </button>

                  <button
                    onClick={handleCancelOrder}
                    disabled={loading || orderDetails.status === 'cancelled'}
                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderManagementModal;