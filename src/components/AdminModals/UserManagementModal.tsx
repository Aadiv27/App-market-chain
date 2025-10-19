import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react';
import { ref, update, remove, get } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';

interface User {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
  createdAt: number;
  lastActive?: number;
  isOnline?: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  address?: string;
  businessName?: string;
  documents?: string[];
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState<User | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserDetails();
    }
  }, [user, isOpen]);

  const fetchUserDetails = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = ref(realtimeDb, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        setUserDetails(snapshot.val());
      } else {
        setUserDetails(user);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCAction = async (action: 'approve' | 'reject') => {
    if (!userDetails) return;

    try {
      setLoading(true);
      setError('');
      
      const updates: any = {};
      updates[`users/${userDetails.uid}/kycStatus`] = action === 'approve' ? 'approved' : 'rejected';
      updates[`users/${userDetails.uid}/kycUpdatedAt`] = Date.now();
      
      // Remove from pending KYC if exists
      updates[`kycPending/${userDetails.uid}`] = null;
      
      // Add to notifications
      const notificationId = Date.now().toString();
      updates[`notifications/${userDetails.uid}/${notificationId}`] = {
        id: notificationId,
        message: `Your KYC has been ${action === 'approve' ? 'approved' : 'rejected'}`,
        type: action === 'approve' ? 'success' : 'error',
        time: new Date().toISOString(),
        read: false
      };

      await update(ref(realtimeDb), updates);
      
      setSuccess(`KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      onUserUpdated();
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error(`Error ${action}ing KYC:`, err);
      setError(`Failed to ${action} KYC`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userDetails || !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const updates: any = {};
      updates[`users/${userDetails.uid}`] = null;
      updates[`kycPending/${userDetails.uid}`] = null;
      
      // Remove user's orders, notifications, etc.
      updates[`orders/${userDetails.role}/${userDetails.uid}`] = null;
      updates[`notifications/${userDetails.uid}`] = null;
      updates[`activityLogs/${userDetails.uid}`] = null;

      await update(ref(realtimeDb), updates);
      
      setSuccess('User deleted successfully');
      onUserUpdated();
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!userDetails) return;

    try {
      setLoading(true);
      setError('');
      
      const newStatus = !userDetails.isOnline;
      const updates: any = {};
      updates[`users/${userDetails.uid}/isOnline`] = newStatus;
      updates[`users/${userDetails.uid}/lastActive`] = Date.now();

      await update(ref(realtimeDb), updates);
      
      setUserDetails(prev => prev ? { ...prev, isOnline: newStatus } : null);
      setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      onUserUpdated();
      
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Failed to update user status');
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'wholesaler': return 'bg-yellow-100 text-yellow-800';
      case 'vehicle_owner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#0D1B2A] flex items-center">
              <User className="h-6 w-6 mr-2" />
              User Management
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

            {userDetails && !loading && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{userDetails.fullName}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{userDetails.email}</span>
                      </div>
                    </div>

                    {userDetails.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <div className="flex items-center mt-1">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{userDetails.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userDetails.role)}`}>
                          {userDetails.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">KYC Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKYCStatusColor(userDetails.kycStatus || 'pending')}`}>
                          {(userDetails.kycStatus || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${userDetails.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-gray-900">{userDetails.isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{formatDate(userDetails.createdAt)}</span>
                    </div>
                  </div>

                  {userDetails.lastActive && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Active</label>
                      <div className="flex items-center mt-1">
                        <Eye className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{formatDate(userDetails.lastActive)}</span>
                      </div>
                    </div>
                  )}

                  {userDetails.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{userDetails.address}</span>
                      </div>
                    </div>
                  )}

                  {userDetails.businessName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Name</label>
                      <div className="flex items-center mt-1">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{userDetails.businessName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {userDetails.kycStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleKYCAction('approve')}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve KYC
                      </button>
                      <button
                        onClick={() => handleKYCAction('reject')}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject KYC
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleToggleUserStatus}
                    disabled={loading}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      userDetails.isOnline 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {userDetails.isOnline ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={handleDeleteUser}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Delete User
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

export default UserManagementModal;