import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Bell,
  Search,
  Filter,
  Download,
  Shield,
  Activity,
  Clock,
  Eye,
  UserCheck,
  Truck,
  ShoppingCart,
  Store,
  CheckCircle,
  XCircle,
  RefreshCw,
  PieChart,
  LineChart,
  Edit3,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';
import KYCAlert from '../KYCAlert';

import VehicleLocationTracker from '../VehicleLocationTracker';
import UserManagementModal from '../AdminModals/UserManagementModal';
import OrderManagementModal from '../AdminModals/OrderManagementModal';
import { exportService } from '../../services/exportService';

// TypeScript Interfaces
interface UserStats {
  retailers: number;
  wholesalers: number;
  vehicles: number;
  total: number;
}

interface OrderStats {
  pending: number;
  completed: number;
  totalValue: number;
  todayOrders: number;
}

interface User {
  uid: string;
  fullName: string;
  email: string;
  role: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
  createdAt: number;
  lastActive?: number;
  isOnline?: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected';
}

interface Order {
  id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'in_progress';
  total: number;
  createdAt: number;
  userId: string;
  userRole: string;
}

interface KYCPending {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  submittedAt: number;
  documents?: string[];
}

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  userId?: string;
  userRole?: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userRole: 'retailer' | 'wholesaler' | 'vehicle_owner';
  userName: string;
  action: string;
  timestamp: number;
  details?: string;
  type: 'login' | 'order' | 'delivery' | 'profile_update' | 'kyc_submission';
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  orders: number;
  users: number;
  revenue: number;
}

interface ActivityChartData {
  hour: string;
  logins: number;
  orders: number;
  deliveries: number;
}

interface AcceptedDelivery {
  id: string;
  orderId: string;
  vehicleUserId: string;
  vehicleUserName: string;
  vehicleUserEmail: string;
  vehicleNumber: string;
  wholesaler: {
    id: string;
    name: string;
    shopName: string;
    address: string;
    phone: string;
  };
  retailer: {
    id: string;
    name: string;
    shopName: string;
    address: string;
    phone: string;
  };
  productDetails: string;
  orderAmount: number;
  distance: number;
  deliveryCost: number;
  acceptedAt: number;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  currentLocation?: { lat: number; lng: number } | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Dynamic states with proper TypeScript types
  const [userStats, setUserStats] = useState<UserStats>({ retailers: 0, wholesalers: 0, vehicles: 0, total: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({ pending: 0, completed: 0, totalValue: 0, todayOrders: 0 });
  const [kycPending, setKycPending] = useState<KYCPending[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('today');
  
  // Chart data states
  const [userRoleData, setUserRoleData] = useState<ChartData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [activityChartData, setActivityChartData] = useState<ActivityChartData[]>([]);

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string>('');
  
  // Delivery tracking states
  const [acceptedDeliveries, setAcceptedDeliveries] = useState<AcceptedDelivery[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    // Handle both old and new user structure for role checking
    const userRole = user?.activeRole?.type || (user as any)?.role;
    
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    if (userRole !== 'admin' && userRole !== 'vehicle_owner') {
      setError('Access denied: Admin or Vehicle Owner only');
      setLoading(false);
      return;
    }

    const unsubscribeFunctions: (() => void)[] = [];

    try {
      // Fetch user stats and online status
      const usersRef = ref(realtimeDb, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const users = Object.values(data) as User[];
            const retailers = users.filter((u: User) => u.role === 'retailer').length;
            const wholesalers = users.filter((u: User) => u.role === 'wholesaler').length;
            const vehicles = users.filter((u: User) => u.role === 'vehicle_owner').length;
            const onlineCount = users.filter((u: User) => u.isOnline).length;
            
            setUserStats({ retailers, wholesalers, vehicles, total: users.length });
            setOnlineUsers(onlineCount);
            
            // Recent users (last 10, sorted by creation date)
            const sorted = users
              .sort((a: User, b: User) => (b.createdAt || 0) - (a.createdAt || 0))
              .slice(0, 10);
            setRecentUsers(sorted);
          } else {
            setUserStats({ retailers: 0, wholesalers: 0, vehicles: 0, total: 0 });
            setRecentUsers([]);
            setOnlineUsers(0);
          }
          setLastUpdated(Date.now());
        } catch (err) {
          console.error('Error processing users data:', err);
        }
      }, (err) => {
        console.error('Users fetch error:', err);
        setError('Failed to load users data');
      });
      unsubscribeFunctions.push(unsubscribeUsers);

      // Fetch enhanced order stats
      const ordersRef = ref(realtimeDb, 'orders');
      const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const allOrders: Order[] = [];
            Object.values(data).forEach((roleOrders: any) => {
              if (roleOrders && typeof roleOrders === 'object') {
                Object.values(roleOrders).forEach((order: any) => {
                  if (order) allOrders.push(order as Order);
                });
              }
            });

            const pending = allOrders.filter((o: Order) => o.status === 'pending').length;
            const completed = allOrders.filter((o: Order) => o.status === 'completed').length;
            const totalValue = allOrders.reduce((sum: number, o: Order) => sum + (o.total || 0), 0);
            
            // Today's orders
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = allOrders.filter((o: Order) => 
              new Date(o.createdAt || 0).getTime() >= today.getTime()
            ).length;

            setOrderStats({ pending, completed, totalValue, todayOrders });
            
            // Recent orders (last 10, sorted by creation date)
            const sortedOrders = allOrders
              .sort((a: Order, b: Order) => (b.createdAt || 0) - (a.createdAt || 0))
              .slice(0, 10);
            setRecentOrders(sortedOrders);
          } else {
            setOrderStats({ pending: 0, completed: 0, totalValue: 0, todayOrders: 0 });
            setRecentOrders([]);
          }
        } catch (err) {
          console.error('Error processing orders data:', err);
        }
      }, (err) => {
        console.error('Orders fetch error:', err);
      });
      unsubscribeFunctions.push(unsubscribeOrders);

      // Fetch pending KYC with enhanced data
      const kycRef = ref(realtimeDb, 'kycPending');
      const unsubscribeKyc = onValue(kycRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const kycList = Object.values(data) as KYCPending[];
            const sortedKyc = kycList
              .sort((a: KYCPending, b: KYCPending) => (b.submittedAt || 0) - (a.submittedAt || 0))
              .slice(0, 10);
            setKycPending(sortedKyc);
          } else {
            setKycPending([]);
          }
        } catch (err) {
          console.error('Error processing KYC data:', err);
        }
      }, (err) => {
        console.error('KYC fetch error:', err);
      });
      unsubscribeFunctions.push(unsubscribeKyc);

      // Fetch admin notifications
      const notificationsRef = ref(realtimeDb, 'notifications/admin');
      const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const notifList = Object.values(data) as Notification[];
            const sortedNotifications = notifList
              .sort((a: Notification, b: Notification) => 
                new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()
              )
              .slice(0, 10);
            setNotifications(sortedNotifications);
          } else {
            setNotifications([]);
          }
        } catch (err) {
          console.error('Error processing notifications data:', err);
        }
      }, (err) => {
        console.error('Notifications fetch error:', err);
      });
      unsubscribeFunctions.push(unsubscribeNotifications);

      // Fetch activity logs from all user types
      const activityRef = ref(realtimeDb, 'activityLogs');
      const unsubscribeActivity = onValue(activityRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const activities: ActivityLog[] = [];
            Object.values(data).forEach((userActivities: any) => {
              if (userActivities && typeof userActivities === 'object') {
                Object.values(userActivities).forEach((activity: any) => {
                  if (activity) activities.push(activity as ActivityLog);
                });
              }
            });

            const sortedActivities = activities
              .sort((a: ActivityLog, b: ActivityLog) => (b.timestamp || 0) - (a.timestamp || 0))
              .slice(0, 20);
            setActivityLogs(sortedActivities);
          } else {
            setActivityLogs([]);
          }
        } catch (err) {
          console.error('Error processing activity logs:', err);
        }
      }, (err) => {
        console.error('Activity logs fetch error:', err);
      });
      unsubscribeFunctions.push(unsubscribeActivity);

      // Fetch accepted deliveries for tracking
      const acceptedDeliveriesRef = ref(realtimeDb, 'acceptedDeliveries');
      const unsubscribeAcceptedDeliveries = onValue(acceptedDeliveriesRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const deliveries = Object.values(data) as AcceptedDelivery[];
            const sortedDeliveries = deliveries
              .sort((a: AcceptedDelivery, b: AcceptedDelivery) => (b.acceptedAt || 0) - (a.acceptedAt || 0));
            setAcceptedDeliveries(sortedDeliveries);
          } else {
            setAcceptedDeliveries([]);
          }
        } catch (err) {
          console.error('Error processing accepted deliveries:', err);
        }
      }, (err) => {
        console.error('Accepted deliveries fetch error:', err);
      });
      unsubscribeFunctions.push(unsubscribeAcceptedDeliveries);

      setLoading(false);
    } catch (err) {
      console.error('Error setting up real-time listeners:', err);
      setError('Failed to initialize dashboard');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      });
    };
  }, [user?.id, user?.activeRole?.type]);

  // Helper functions
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="h-4 w-4" />;
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'profile_update': return <Eye className="h-4 w-4" />;
      case 'kyc_submission': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'wholesaler': return 'bg-yellow-100 text-yellow-800';
      case 'vehicle_owner': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = (): void => {
    setLastUpdated(Date.now());
    // Force re-render by updating a state
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Modal handlers
  const handleUserClick = (user: User): void => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleOrderClick = (order: Order): void => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleUserModalClose = (): void => {
    setUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleOrderModalClose = (): void => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUserUpdated = (): void => {
    refreshData();
  };

  const handleOrderUpdated = (): void => {
    refreshData();
  };

  // KYC handlers
  const handleKYCApproval = async (kycData: KYCPending, action: 'approve' | 'reject'): Promise<void> => {
    try {
      const { ref: dbRef, set, remove } = await import('firebase/database');
      
      // Update user's KYC status
      const userRef = dbRef(realtimeDb, `users/${kycData.uid}/kycStatus`);
      await set(userRef, action === 'approve' ? 'approved' : 'rejected');
      
      // Remove from pending KYC
      const kycPendingRef = dbRef(realtimeDb, `kycPending/${kycData.uid}`);
      await remove(kycPendingRef);
      
      // Create notification for user
      const notificationRef = dbRef(realtimeDb, `notifications/${kycData.uid}/${Date.now()}`);
      await set(notificationRef, {
        id: Date.now().toString(),
        message: `Your KYC has been ${action === 'approve' ? 'approved' : 'rejected'}`,
        time: new Date().toISOString(),
        type: action === 'approve' ? 'success' : 'error',
        read: false
      });
      
      // Log admin activity
      const activityRef = dbRef(realtimeDb, `activityLogs/admin/${Date.now()}`);
      await set(activityRef, {
        id: Date.now().toString(),
        userId: user?.id || 'admin',
        userRole: 'admin',
        userName: user?.fullName || 'Admin',
        action: `KYC ${action === 'approve' ? 'approved' : 'rejected'} for ${kycData.fullName}`,
        timestamp: Date.now(),
        type: 'kyc_approval',
        details: `User: ${kycData.email}, Role: ${kycData.role}`
      });
      
      refreshData();
    } catch (err) {
      console.error(`Error ${action}ing KYC:`, err);
      setError(`Failed to ${action} KYC`);
    }
  };

  // Export handlers
  const handleExport = async (type: 'users' | 'orders' | 'activities' | 'kyc' | 'comprehensive'): Promise<void> => {
    try {
      setExportLoading(true);
      setExportError('');

      switch (type) {
        case 'users':
          await exportService.exportUsers();
          break;
        case 'orders':
          await exportService.exportOrders();
          break;
        case 'activities':
          await exportService.exportActivities();
          break;
        case 'kyc':
          await exportService.exportKYCPending();
          break;
        case 'comprehensive':
          await exportService.exportComprehensiveReport();
          break;
        default:
          throw new Error('Invalid export type');
      }
    } catch (err) {
      console.error('Export error:', err);
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Chart data processing functions
  const processChartData = (): void => {
    // User role distribution
    const roleData: ChartData[] = [
      { name: 'Retailers', value: userStats.retailers, color: '#5DAE49' },
      { name: 'Wholesalers', value: userStats.wholesalers, color: '#FFC947' },
      { name: 'Vehicle Owners', value: userStats.vehicles, color: '#0D1B2A' }
    ];
    setUserRoleData(roleData);

    // Order status distribution
    const statusData: ChartData[] = [
      { name: 'Pending', value: orderStats.pending, color: '#ef4444' },
      { name: 'Completed', value: orderStats.completed, color: '#22c55e' },
      { name: 'Today', value: orderStats.todayOrders, color: '#3b82f6' }
    ];
    setOrderStatusData(statusData);

    // Generate time series data (last 7 days)
    const timeData: TimeSeriesData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Simulate data based on current stats (in real app, this would come from historical data)
      const dayMultiplier = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
      timeData.push({
        date: dateStr,
        orders: Math.round((orderStats.todayOrders || 5) * dayMultiplier),
        users: Math.round((userStats.total / 30) * dayMultiplier), // Approximate daily new users
        revenue: Math.round((orderStats.totalValue / 30) * dayMultiplier)
      });
    }
    setTimeSeriesData(timeData);

    // Generate hourly activity data for today
    const hourlyData: ActivityChartData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const todayLogs = activityLogs.filter(log => 
        new Date(log.timestamp).toDateString() === new Date().toDateString() &&
        new Date(log.timestamp).getHours() === hour
      );
      
      hourlyData.push({
        hour: hourStr,
        logins: todayLogs.filter(log => log.type === 'login').length,
        orders: todayLogs.filter(log => log.type === 'order').length,
        deliveries: todayLogs.filter(log => log.type === 'delivery').length
      });
    }
    setActivityChartData(hourlyData);
  };

  // Process chart data whenever relevant data changes
  useEffect(() => {
    if (!loading) {
      processChartData();
    }
  }, [userStats, orderStats, activityLogs, loading]);

  // Filtered data
  const filteredRecentUsers = recentUsers.filter((u: User) => 
    (filterRole === 'all' || u.role === filterRole) &&
    (u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredActivityLogs = activityLogs.filter((log: ActivityLog) => {
    const timeFilter = selectedTimeRange === 'today' 
      ? new Date(log.timestamp).toDateString() === new Date().toDateString()
      : selectedTimeRange === 'week'
      ? Date.now() - log.timestamp < 7 * 24 * 60 * 60 * 1000
      : true;
    
    const roleFilter = filterRole === 'all' || log.userRole === filterRole;
    return timeFilter && roleFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KYC Alert (Admin-specific) */}
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
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600">
                  Platform Overview & Management
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{onlineUsers} online</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatTimeAgo(lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={refreshData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => {
                  const vehicleSection = document.getElementById('vehicle-tracking-section');
                  if (vehicleSection) {
                    vehicleSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Truck className="h-4 w-4" />
                <span>Vehicle Live Tracking</span>
              </button>
              <button 
                onClick={() => {
                  const deliverySection = document.getElementById('delivery-tracking-section');
                  if (deliverySection) {
                    deliverySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>Delivery Tracking</span>
              </button>
              <button 
                onClick={() => {
                  const userSection = document.getElementById('user-management-section');
                  if (userSection) {
                    userSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Manage Users</span>
              </button>
              <button 
                onClick={() => handleExport('comprehensive')}
                disabled={exportLoading}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{exportLoading ? 'Exporting...' : 'Export Report'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Admin Only */}
        {(user?.activeRole?.type || (user as any)?.role) === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#5DAE49] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+{onlineUsers}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{userStats.total}</h3>
            <p className="text-gray-600 text-sm">Total Users</p>
            <div className="mt-2 text-xs text-gray-500">
              R:{userStats.retailers} W:{userStats.wholesalers} V:{userStats.vehicles}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FFC947] rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-[#0D1B2A]" />
              </div>
              <span className="text-red-600 text-sm font-semibold">{orderStats.pending}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{orderStats.pending}</h3>
            <p className="text-gray-600 text-sm">Pending Orders</p>
            <div className="mt-2 text-xs text-gray-500">
              {orderStats.completed} completed
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+₹{Math.round(orderStats.totalValue * 0.1)}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">₹{orderStats.totalValue.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Platform Revenue</p>
            <div className="mt-2 text-xs text-gray-500">
              Total transactions
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-600 text-sm font-semibold">Today</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{orderStats.todayOrders}</h3>
            <p className="text-gray-600 text-sm">Today's Orders</p>
            <div className="mt-2 text-xs text-gray-500">
              {activityLogs.filter(log => 
                new Date(log.timestamp).toDateString() === new Date().toDateString()
              ).length} activities
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {
              const vehicleSection = document.getElementById('vehicle-tracking-section');
              if (vehicleSection) {
                vehicleSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-600 text-sm font-semibold">Live</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{userStats.vehicles}</h3>
            <p className="text-gray-600 text-sm">Vehicle Tracking</p>
            <div className="mt-2 text-xs text-gray-500">
              Click to view live locations
            </div>
          </motion.div>
        </div>
        )}

        {/* Enhanced Notifications & Filters - Admin Only */}
        {(user?.activeRole?.type || (user as any)?.role) === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-3 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-2xl p-6 text-white"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Bell className="h-6 w-6 mr-2" />
              Real-time Notifications ({notifications.length})
            </h2>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {notifications.length > 0 ? notifications.map((notif: Notification, index: number) => (
                <div key={notif.id || index} className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{notif.message || 'System notification'}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notif.type === 'error' ? 'bg-red-500/30' :
                      notif.type === 'warning' ? 'bg-yellow-500/30' :
                      notif.type === 'success' ? 'bg-green-500/30' :
                      'bg-blue-500/30'
                    }`}>
                      {notif.type || 'info'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-90">{notif.time || 'Just now'}</p>
                    {notif.userRole && (
                      <span className="text-xs opacity-75">from {notif.userRole}</span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">No new notifications</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Filters & Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="retailer">Retailers</option>
                  <option value="wholesaler">Wholesalers</option>
                  <option value="vehicle_owner">Vehicle Owners</option>
                </select>
              </div>
              <div className="pt-2">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Active Logs:</span>
                    <span className="font-semibold">{filteredActivityLogs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Users:</span>
                    <span className="font-semibold text-green-600">{onlineUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}

        {/* Analytics Dashboard - Admin Only */}
        {(user?.activeRole?.type || (user as any)?.role) === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0D1B2A] flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Analytics Dashboard
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  const analyticsSection = document.getElementById('analytics-charts-section');
                  if (analyticsSection) {
                    analyticsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <PieChart className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button 
                onClick={() => handleExport('comprehensive')}
                disabled={exportLoading}
                className="bg-[#5DAE49] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <LineChart className="h-4 w-4" />
                <span>{exportLoading ? 'Exporting...' : 'Export Charts'}</span>
              </button>
            </div>
          </div>

          <div id="analytics-charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Role Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Distribution by Role
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {userRoleData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                    <span className="text-sm font-semibold text-[#0D1B2A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Status Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#5DAE49" radius={[4, 4, 0, 0]}>
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                    <span className="text-sm font-semibold text-[#0D1B2A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Trend Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                7-Day Trend Analysis
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stackId="1"
                      stroke="#5DAE49"
                      fill="#5DAE49"
                      fillOpacity={0.6}
                      name="Orders"
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="2"
                      stroke="#FFC947"
                      fill="#FFC947"
                      fillOpacity={0.6}
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#5DAE49] rounded-full"></div>
                  <span className="text-xs text-gray-600">Orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#FFC947] rounded-full"></div>
                  <span className="text-xs text-gray-600">New Users</span>
                </div>
              </div>
            </div>

            {/* Hourly Activity Pattern */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Today's Hourly Activity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      stroke="#0D1B2A"
                      strokeWidth={2}
                      dot={{ fill: '#0D1B2A', strokeWidth: 2, r: 4 }}
                      name="Logins"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#5DAE49"
                      strokeWidth={2}
                      dot={{ fill: '#5DAE49', strokeWidth: 2, r: 4 }}
                      name="Orders"
                    />
                    <Line
                      type="monotone"
                      dataKey="deliveries"
                      stroke="#FFC947"
                      strokeWidth={2}
                      dot={{ fill: '#FFC947', strokeWidth: 2, r: 4 }}
                      name="Deliveries"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#0D1B2A] rounded-full"></div>
                  <span className="text-xs text-gray-600">Logins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#5DAE49] rounded-full"></div>
                  <span className="text-xs text-gray-600">Orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#FFC947] rounded-full"></div>
                  <span className="text-xs text-gray-600">Deliveries</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {(user?.activeRole?.type === 'admin' || (user as any)?.role === 'admin') && (
          <div id="vehicle-tracking-section">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <Truck className="h-6 w-6 mr-3" />
                      Live Vehicle Tracking System
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Real-time monitoring of all vehicle locations and delivery status
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <p className="text-sm text-blue-100">Active Vehicles</p>
                      <p className="text-2xl font-bold">{userStats.vehicles}</p>
                    </div>
                  </div>
                </div>
              </div>
              <VehicleLocationTracker className="" />
            </motion.div>
          </div>
        )}

        {/* Delivery Tracking Section */}
        {(user?.activeRole?.type === 'admin' || (user as any)?.role === 'admin') && (
          <div id="delivery-tracking-section">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <Package className="h-6 w-6 mr-3" />
                      Delivery Tracking System
                    </h2>
                    <p className="text-green-100 mt-2">
                      Monitor all accepted deliveries and vehicle assignments in real-time
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <p className="text-sm text-green-100">Active Deliveries</p>
                      <p className="text-2xl font-bold">{acceptedDeliveries.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#0D1B2A]">Accepted Deliveries ({acceptedDeliveries.length})</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setActiveTab('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'all' 
                          ? 'bg-[#5DAE49] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All ({acceptedDeliveries.length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('accepted')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'accepted' 
                          ? 'bg-[#5DAE49] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Accepted ({acceptedDeliveries.filter(d => d.status === 'accepted').length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('in_progress')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'in_progress' 
                          ? 'bg-[#5DAE49] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      In Progress ({acceptedDeliveries.filter(d => d.status === 'in_progress').length})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {acceptedDeliveries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No deliveries have been accepted yet</p>
                      <p className="text-sm">Vehicle users will see accepted deliveries here</p>
                    </div>
                  ) : (
                    acceptedDeliveries
                      .filter(delivery => activeTab === 'all' || delivery.status === activeTab)
                      .map((delivery: AcceptedDelivery) => (
                        <div key={delivery.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-[#0D1B2A] mb-1">Order #{delivery.orderId}</h4>
                              <p className="text-sm text-gray-600">
                                Accepted: {new Date(delivery.acceptedAt).toLocaleDateString()} at {new Date(delivery.acceptedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                delivery.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                                delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {delivery.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Vehicle Info */}
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <Truck className="h-4 w-4 mr-2" />
                              Vehicle Details
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p><strong>Driver:</strong> {delivery.vehicleUserName}</p>
                                <p><strong>Email:</strong> {delivery.vehicleUserEmail}</p>
                              </div>
                              <div>
                                <p><strong>Vehicle:</strong> {delivery.vehicleNumber}</p>
                                <p><strong>Status:</strong> {delivery.status}</p>
                              </div>
                              <div>
                                <p><strong>Distance:</strong> {delivery.distance}km</p>
                                <p><strong>Earnings:</strong> ₹{delivery.deliveryCost}</p>
                              </div>
                            </div>
                          </div>

                          {/* Route Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Wholesaler */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                              <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                                <Store className="h-4 w-4 mr-2" />
                                Pickup from Wholesaler
                              </h5>
                              <div className="text-sm">
                                <p><strong>Name:</strong> {delivery.wholesaler.name}</p>
                                <p><strong>Shop:</strong> {delivery.wholesaler.shopName}</p>
                                <p><strong>Phone:</strong> {delivery.wholesaler.phone}</p>
                                <p><strong>Address:</strong> {delivery.wholesaler.address}</p>
                              </div>
                            </div>

                            {/* Retailer */}
                            <div className="bg-green-50 rounded-lg p-4">
                              <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Deliver to Retailer
                              </h5>
                              <div className="text-sm">
                                <p><strong>Name:</strong> {delivery.retailer.name}</p>
                                <p><strong>Shop:</strong> {delivery.retailer.shopName}</p>
                                <p><strong>Phone:</strong> {delivery.retailer.phone}</p>
                                <p><strong>Address:</strong> {delivery.retailer.address}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p><strong>Products:</strong> {delivery.productDetails}</p>
                              </div>
                              <div>
                                <p><strong>Order Value:</strong> ₹{delivery.orderAmount}</p>
                              </div>
                              <div>
                                <p><strong>Delivery Fee:</strong> ₹{delivery.deliveryCost}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Users */}
            <motion.div
              id="user-management-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0D1B2A]">Recent Users ({filteredRecentUsers.length})</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] w-48"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecentUsers.length > 0 ? filteredRecentUsers.map((u: User, index: number) => (
                      <tr key={u.uid || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="font-medium text-[#0D1B2A]">{u.fullName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                            {u.role?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.email || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            u.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            u.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.kycStatus || 'Not submitted'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleUserClick(u)}
                            className="text-[#5DAE49] text-sm hover:underline mr-2 flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                          <button 
                            onClick={() => handleUserClick(u)}
                            className="text-blue-500 text-sm hover:underline flex items-center"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Manage
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>No users found matching your criteria</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0D1B2A]">Recent Orders ({recentOrders.length})</h3>
                <button 
                  onClick={() => handleExport('orders')}
                  disabled={exportLoading}
                  className="text-[#5DAE49] text-sm hover:underline flex items-center disabled:opacity-50"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Orders
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? recentOrders.map((order: Order, index: number) => (
                      <tr key={order.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#0D1B2A]">#{order.id?.slice(-8) || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(order.userRole)}`}>
                              {order.userRole?.replace('_', ' ') || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">₹{order.total?.toLocaleString() || '0'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleOrderClick(order)}
                            className="text-[#5DAE49] text-sm hover:underline mr-2 flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                          <button 
                            onClick={() => handleOrderClick(order)}
                            className="text-blue-500 text-sm hover:underline flex items-center"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Manage
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>No recent orders found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Real-time Activity Logs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Real-time Activity Logs ({filteredActivityLogs.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredActivityLogs.length > 0 ? filteredActivityLogs.map((log: ActivityLog, index: number) => (
                  <div key={log.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getRoleColor(log.userRole)}`}>
                          {getActivityIcon(log.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0D1B2A] text-sm">{log.userName || 'Unknown User'}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(log.userRole)}`}>
                            {log.userRole?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-gray-500">{log.details}</p>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No activity logs found for the selected criteria</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending KYC Approvals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Pending KYC Approvals ({kycPending.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {kycPending.length > 0 ? kycPending.map((kyc: KYCPending, index: number) => (
                  <div key={kyc.uid || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#0D1B2A]">{kyc.fullName || 'N/A'}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(kyc.role)}`}>
                          {kyc.role?.replace('_', ' ') || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {kyc.submittedAt ? formatTimeAgo(kyc.submittedAt) : 'Recently'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{kyc.email || 'N/A'}</p>
                    {kyc.documents && kyc.documents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Documents: {kyc.documents.length} files</p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleKYCApproval(kyc, 'approve')}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button 
                        onClick={() => handleKYCApproval(kyc, 'reject')}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="h-3 w-3" />
                        <span>Reject</span>
                      </button>
                      <button 
                        onClick={() => {
                          // Create a user object from KYC data to open user modal
                          const userData: User = {
                            uid: kyc.uid,
                            fullName: kyc.fullName,
                            email: kyc.email,
                            role: kyc.role as 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin',
                            createdAt: kyc.submittedAt,
                            kycStatus: 'pending'
                          };
                          handleUserClick(userData);
                        }}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No pending KYC approvals</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Platform Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Platform Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Orders Today</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{orderStats.todayOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Active Vehicles</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{userStats.vehicles}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Total Retailers</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{userStats.retailers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">₹{orderStats.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#0D1B2A]">{userStats.wholesalers}</p>
                    <p className="text-xs text-gray-600">Wholesalers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0D1B2A]">{orderStats.completed}</p>
                    <p className="text-xs text-gray-600">Completed Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0D1B2A]">{onlineUsers}</p>
                    <p className="text-xs text-gray-600">Online Now</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (kycPending.length > 0) {
                      handleUserClick(kycPending[0] as any);
                    }
                  }}
                  disabled={kycPending.length === 0}
                  className="w-full bg-[#5DAE49] text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>Approve KYC ({kycPending.length})</span>
                </button>
                <button 
                  onClick={refreshData}
                  className="w-full bg-[#FFC947] text-[#0D1B2A] p-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </button>
                <button 
                  onClick={() => {
                    const activitySection = document.getElementById('activity-logs-section');
                    if (activitySection) {
                      activitySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>View All Logs</span>
                </button>
                <button 
                  onClick={() => handleExport('comprehensive')}
                  disabled={exportLoading}
                  className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{exportLoading ? 'Exporting...' : 'Export Report'}</span>
                </button>
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Real-time Updates</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(lastUpdated)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-xs font-semibold text-blue-600">{onlineUsers}</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Summary */}
            <motion.div
              id="activity-logs-section"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Activity Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredActivityLogs.slice(0, 5).map((log: ActivityLog, index: number) => (
                  <div key={log.id || index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`p-1 rounded-full ${getRoleColor(log.userRole)}`}>
                        {getActivityIcon(log.type)}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{log.userName}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{log.action}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(log.timestamp)}</p>
                  </div>
                ))}
                {filteredActivityLogs.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Export Error Display */}
      {exportError && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{exportError}</span>
            <button
              onClick={() => setExportError('')}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={userModalOpen}
        onClose={handleUserModalClose}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Order Management Modal */}
      <OrderManagementModal
        isOpen={orderModalOpen}
        onClose={handleOrderModalClose}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default AdminDashboard;