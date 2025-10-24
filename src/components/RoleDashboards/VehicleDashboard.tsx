import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Route,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Fuel,
  Star,
  Phone,
  Bell,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, set as dbSet } from 'firebase/database';
import { realtimeDb } from '../lib/Firebase';
import KYCAlert from '../KYCAlert';


import { useNavigationReset } from '../../hooks/useNavigationReset';

// TypeScript Interfaces
interface Stat {
  id: string;
  label: string;
  value: string | number;
  change: string;
  color: string;
  icon: LucideIcon;
}

interface Delivery {
  id: string;
  retailer: string;
  address: string;
  status: 'in_transit' | 'pending' | 'completed' | 'pending_pickup';
  items: string;
  distance: string;
  eta: string;
  rating?: number;
  time?: string;
  completedAt?: number;
}

interface ReturnPickup {
  id: string;
  retailer: string;
  address: string;
  reason: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Notification {
  id: string;
  message: string;
  time?: string;
  type?: 'info' | 'warning' | 'success' | 'error' | 'delivery_opportunity';
  title?: string;
  timestamp?: number;
  read?: boolean;
  orderId?: string;
  deliveryDetails?: {
    pickup: {
      name: string;
      shopName: string;
      address: string;
      phone: string;
    };
    delivery: {
      name: string;
      shopName: string;
      address: string;
      phone: string;
      email?: string;
    };
    distance: number;
    deliveryCost: number;
    orderAmount: number;
    items: string;
    estimatedDuration: string;
  };
}

interface AvailableDelivery {
  id: string;
  orderId: string;
  // Wholesaler Information
  wholesaler: {
    id: string;
    name: string;
    shopName: string;
    address: string;
    phone: string;
  };
  // Retailer Information
  retailer: {
    id: string;
    name: string;
    shopName: string;
    address: string;
    phone: string;
  };
  // Order Details
  items: string;
  amount: number;
  distance: number;
  deliveryCost: number;
  packedAt: number;
  status: 'available' | 'accepted' | 'in_progress' | 'completed';
}

const VehicleDashboard = () => {
  console.log('🚚 VehicleDashboard component is mounting...');
  const { user } = useAuth();
  console.log('🚚 Auth user from useAuth:', user);
  const [activeTab, setActiveTab] = useState<string>('available');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Location states
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

  // Reset navigation guard when component successfully loads
  useNavigationReset();

  // Dynamic states with proper TypeScript types
  const [stats, setStats] = useState<Stat[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [returnPickups, setReturnPickups] = useState<ReturnPickup[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([]);
  
  // Order details modal states
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Request location permission directly on first login
  useEffect(() => {
    const userId = user?.id || user?.uid;
    if (!userId) return;

    // Check if location permission was already granted
    const checkAndRequestLocationPermission = async () => {
      // Check localStorage first for user preference
      const savedPermission = localStorage.getItem(`locationPermission_${userId}`);
      
      if (savedPermission === 'granted') {
        setLocationPermissionGranted(true);
        return;
      }

      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'granted') {
            setLocationPermissionGranted(true);
            localStorage.setItem(`locationPermission_${userId}`, 'granted');
          } else if (permission.state === 'denied') {
            setLocationPermissionGranted(false);
            localStorage.setItem(`locationPermission_${userId}`, 'denied');
          } else {
            // Directly request location permission without modal
            requestLocationDirectly();
          }

          // Listen for permission changes
          permission.addEventListener('change', () => {
            if (permission.state === 'granted') {
              setLocationPermissionGranted(true);
              localStorage.setItem(`locationPermission_${userId}`, 'granted');
            } else if (permission.state === 'denied') {
              setLocationPermissionGranted(false);
              localStorage.setItem(`locationPermission_${userId}`, 'denied');
            }
          });
        } catch (err) {
          console.error('Error checking permissions:', err);
          // Fallback: directly request location
          if (!savedPermission || savedPermission !== 'denied') {
            requestLocationDirectly();
          }
        }
      } else {
        // Fallback: directly request location
        if (!savedPermission || savedPermission !== 'denied') {
          requestLocationDirectly();
        }
      }
    };

    checkAndRequestLocationPermission();
  }, [user?.id, user?.uid]);

  // Function to request location permission directly
  const requestLocationDirectly = () => {
    const userId = user?.id || user?.uid;
    if (!userId || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationPermissionGranted(true);
        localStorage.setItem(`locationPermission_${userId}`, 'granted');
        
        // Update initial location in Firebase
        dbSet(ref(realtimeDb, `vehicles/${userId}/location`), {
          lat: latitude,
          lng: longitude,
          timestamp: Date.now()
        }).then(() => {
          console.log('✅ Initial location updated successfully for vehicle:', userId);
        }).catch((err) => {
          console.error('❌ Error updating initial location in Firebase:', err);
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionGranted(false);
          localStorage.setItem(`locationPermission_${userId}`, 'denied');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Start live tracking when permission is granted
  useEffect(() => {
    const userId = user?.id || user?.uid;
    if (!userId || !locationPermissionGranted) return;

    let localWatchId: number | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const startLiveTracking = () => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by your browser.');
        return;
      }

      // Start live tracking
      localWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          retryCount = 0; // Reset retry count on successful location

          // Update location in Firebase with retry logic
          const updateLocation = async (attempt = 1) => {
            try {
              await dbSet(ref(realtimeDb, `vehicles/${userId}/location`), {
                lat: latitude,
                lng: longitude,
                accuracy: accuracy,
                timestamp: Date.now()
              });
              console.log('🔄 Live location updated for vehicle:', userId, 'at', new Date().toLocaleTimeString());
            } catch (err) {
              console.error(`❌ Error updating live location (attempt ${attempt}):`, err);
              if (attempt < 3) {
                setTimeout(() => updateLocation(attempt + 1), 2000 * attempt);
              }
            }
          };

          updateLocation();
        },
        (error) => {
          console.error('Error watching position:', error);
          retryCount++;

          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionGranted(false);
            localStorage.setItem(`locationPermission_${userId}`, 'denied');
            console.log('Location permission denied, stopping tracking');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.log('Location unavailable, will retry...');
            if (retryCount < maxRetries) {
              setTimeout(() => {
                console.log(`Retrying location request (${retryCount}/${maxRetries})`);
              }, 5000);
            }
          } else if (error.code === error.TIMEOUT) {
            console.log('Location request timeout, will retry...');
            if (retryCount < maxRetries) {
              setTimeout(() => {
                console.log(`Retrying location request (${retryCount}/${maxRetries})`);
              }, 3000);
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 30000 // Allow cached location for 30 seconds
        }
      );

      setWatchId(localWatchId);
    };

    startLiveTracking();

    // Cleanup watch on unmount or user change
    return () => {
      if (localWatchId) {
        navigator.geolocation.clearWatch(localWatchId);
      }
    };
  }, [user?.id, user?.uid, locationPermissionGranted]);

  useEffect(() => {
    console.log('🚚 VehicleDashboard useEffect - User:', user);
    console.log('🚚 User UID:', user?.uid);
    console.log('🚚 User ID:', user?.id);
    console.log('🚚 User email:', user?.email);
    
    // Use user.id instead of user.uid for consistency with Firebase Auth
    const userId = user?.id || user?.uid;
    console.log('🚚 Using userId:', userId);
    
    if (!userId) {
      console.log('🚚 No user ID, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      // Fetch stats with proper type casting
      const statsRef = ref(realtimeDb, `vehicles/${userId}/stats`);
      onValue(statsRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Stats data:', data);
        if (data) {
          setStats(Object.values(data) as Stat[]);
        } else {
          // Set default stats if none exist
          setStats([
            { id: '1', label: 'Active Deliveries', value: 0, change: '+0', color: 'bg-blue-500', icon: Package },
            { id: '2', label: 'Completed Today', value: 0, change: '+0', color: 'bg-green-500', icon: CheckCircle },
            { id: '3', label: 'Total Distance', value: '0 km', change: '+0', color: 'bg-purple-500', icon: Route },
            { id: '4', label: 'Earnings Today', value: '₹0', change: '+0', color: 'bg-yellow-500', icon: Star }
          ]);
        }
      }, (error) => {
        console.error('Error fetching stats:', error);
        setError('Failed to load stats');
      });

      // Fetch active deliveries with proper type casting
      const deliveriesRef = ref(realtimeDb, `vehicles/${userId}/activeDeliveries`);
      onValue(deliveriesRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Active deliveries data:', data);
        if (data) {
          setActiveDeliveries(Object.values(data) as Delivery[]);
        } else {
          setActiveDeliveries([]);
        }
      }, (error) => {
        console.error('Error fetching active deliveries:', error);
        setError('Failed to load active deliveries');
      });

      // Fetch return pickups with proper type casting
      const pickupsRef = ref(realtimeDb, `vehicles/${userId}/returnPickups`);
      onValue(pickupsRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Return pickups data:', data);
        if (data) {
          setReturnPickups(Object.values(data) as ReturnPickup[]);
        } else {
          setReturnPickups([]);
        }
      }, (error) => {
        console.error('Error fetching return pickups:', error);
        setError('Failed to load return pickups');
      });

      // Fetch completed deliveries with proper type casting
      const completedRef = ref(realtimeDb, `vehicles/${userId}/completedDeliveries`);
      onValue(completedRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Completed deliveries data:', data);
        if (data) {
          setCompletedDeliveries(Object.values(data) as Delivery[]);
        } else {
          setCompletedDeliveries([]);
        }
      }, (error) => {
        console.error('Error fetching completed deliveries:', error);
        setError('Failed to load completed deliveries');
      });

      // Fetch notifications with proper type casting
      const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
      console.log('🚚 Fetching notifications from path:', `notifications/${userId}`);
      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Notifications raw data:', data);
        if (data) {
          const notificationsArray = Object.values(data) as Notification[];
          console.log('🚚 Parsed notifications:', notificationsArray);
          setNotifications(notificationsArray);
        } else {
          console.log('🚚 No notifications found');
          setNotifications([]);
        }
      }, (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      });

      // Fetch available deliveries (packed orders from all wholesalers)
      const availableDeliveriesRef = ref(realtimeDb, 'availableDeliveries');
      onValue(availableDeliveriesRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🚚 Available deliveries raw data:', data);
        if (data) {
          const deliveries = Object.values(data) as AvailableDelivery[];
          console.log('🚚 Parsed deliveries:', deliveries);
          // Filter only available deliveries (not yet accepted by any vehicle)
          const available = deliveries.filter(delivery => delivery.status === 'available');
          console.log('🚚 Filtered available deliveries:', available);
          setAvailableDeliveries(available);
        } else {
          console.log('🚚 No available deliveries data found');
          setAvailableDeliveries([]);
        }
      }, (error) => {
        console.error('Error fetching available deliveries:', error);
        setError('Failed to load available deliveries');
      });

      setLoading(false);
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setError('Failed to initialize dashboard');
      setLoading(false);
    }
  }, [user?.id, user?.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending_pickup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markComplete = async (deliveryId: string): Promise<void> => {
    const userId = user?.id || user?.uid;
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const delivery = activeDeliveries.find(d => d.id === deliveryId);
      if (!delivery) {
        setError('Delivery not found');
        return;
      }

      const updatedDelivery: Delivery = {
        ...delivery,
        status: 'completed',
        completedAt: Date.now()
      };

      await dbSet(ref(realtimeDb, `vehicles/${userId}/activeDeliveries/${deliveryId}`), updatedDelivery);
      await dbSet(ref(realtimeDb, `vehicles/${userId}/completedDeliveries/${deliveryId}`), updatedDelivery);
      alert('Delivery marked as complete!');
    } catch (err) {
      console.error('Error marking delivery complete:', err);
      setError('Failed to update delivery');
    }
  };

  const startPickup = async (pickupId: string): Promise<void> => {
    const userId = user?.id || user?.uid;
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const pickup = returnPickups.find(p => p.id === pickupId);
      if (!pickup) {
        setError('Pickup not found');
        return;
      }

      const updatedPickup: ReturnPickup = {
        ...pickup,
        status: 'in_progress'
      };

      await dbSet(ref(realtimeDb, `vehicles/${userId}/returnPickups/${pickupId}`), updatedPickup);
      alert('Pickup started!');
    } catch (err) {
      console.error('Error starting pickup:', err);
      setError('Failed to start pickup');
    }
  };

  const acceptDelivery = async (deliveryId: string): Promise<void> => {
    const userId = user?.id || user?.uid;
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const delivery = availableDeliveries.find(d => d.id === deliveryId);
      if (!delivery) {
        setError('Delivery not found');
        return;
      }

      // Update the delivery status to accepted and assign to this vehicle
      const updatedDelivery: AvailableDelivery = {
        ...delivery,
        status: 'accepted'
      };

      // Move to vehicle's active deliveries
      const activeDelivery: Delivery = {
        id: delivery.id,
        retailer: delivery.retailer.name,
        address: delivery.retailer.address,
        status: 'in_transit',
        items: delivery.items,
        distance: `${delivery.distance}km`,
        eta: 'Calculating...'
      };

      // Create accepted delivery record for admin dashboard
      const acceptedDeliveryRecord = {
        id: delivery.id,
        orderId: delivery.orderId,
        vehicleUserId: userId,
        vehicleUserName: user?.name || user?.fullName || 'Unknown Driver',
        vehicleUserEmail: user?.email || 'Unknown Email',
        vehicleNumber: user?.activeRole?.data?.vehicleNumber || 'Unknown Vehicle',
        wholesaler: {
          id: delivery.wholesaler.id,
          name: delivery.wholesaler.name,
          shopName: delivery.wholesaler.shopName,
          address: delivery.wholesaler.address,
          phone: delivery.wholesaler.phone
        },
        retailer: {
          id: delivery.retailer.id,
          name: delivery.retailer.name,
          shopName: delivery.retailer.shopName,
          address: delivery.retailer.address,
          phone: delivery.retailer.phone
        },
        productDetails: delivery.items,
        orderAmount: delivery.amount,
        distance: delivery.distance,
        deliveryCost: delivery.deliveryCost,
        acceptedAt: Date.now(),
        status: 'accepted',
        currentLocation: currentLocation || null
      };

      // Update in Firebase
      await dbSet(ref(realtimeDb, `availableDeliveries/${deliveryId}`), updatedDelivery);
      await dbSet(ref(realtimeDb, `vehicles/${userId}/activeDeliveries/${deliveryId}`), activeDelivery);
      
      // Store in admin dashboard tracking
      await dbSet(ref(realtimeDb, `acceptedDeliveries/${deliveryId}`), acceptedDeliveryRecord);
      
      alert(`Delivery accepted! Pickup from ${delivery.wholesaler.shopName} and deliver to ${delivery.retailer.shopName}`);
    } catch (err) {
      console.error('Error accepting delivery:', err);
      setError('Failed to accept delivery');
    }
  };

  // Handle showing order details from notification
  const handleShowOrderDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowOrderDetailsModal(true);
  };

  // Add retry function for location permission
  const retryLocationPermission = () => {
    const userId = user?.id || user?.uid;
    if (userId) {
      // Clear saved permission state to allow fresh request
      localStorage.removeItem(`locationPermission_${userId}`);
    }
    setLocationPermissionGranted(false);
    // Directly request location permission
    requestLocationDirectly();
  };

  // Call functionality
  const callWholesaler = (phone: string, name: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert(`Unable to call ${name}. Phone number not available.`);
    }
  };

  const callRetailer = (phone: string, name: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert(`Unable to call ${name}. Phone number not available.`);
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
                Welcome, {user?.name || 'Driver'}!
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Truck className="h-4 w-4 mr-1" />
                Vehicle: {user?.activeRole?.data?.vehicleNumber || 'JH01AB1234'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {locationPermissionGranted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Navigation className="h-4 w-4" />
                  <span>Live Location Active</span>
                </div>
              ) : (
                <button
                  onClick={retryLocationPermission}
                  className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-100 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Enable Location</span>
                </button>
              )}
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Fuel className="h-4 w-4" />
                <span>Log Fuel</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Location Tracking Info Banner */}
        {locationPermissionGranted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium">Live Location Tracking Active</p>
                <p className="text-blue-600 text-sm">Your location is being shared with admin for delivery monitoring and route optimization.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-yellow-800 font-medium">Location Permission Required</p>
                  <p className="text-yellow-600 text-sm">Enable location access for delivery tracking and route optimization.</p>
                </div>
              </div>
              <button
                onClick={retryLocationPermission}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                Enable Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat: Stat, index: number) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color || 'bg-[#5DAE49]'} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-semibold">
                    {stat.change || '+0'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">
                  {stat.value || '0'}
                </h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-white text-[#0D1B2A] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available ({availableDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'deliveries'
                ? 'bg-white text-[#0D1B2A] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'returns'
                ? 'bg-white text-[#0D1B2A] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Returns ({returnPickups.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-[#0D1B2A] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedDeliveries.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'available' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-6">Available Deliveries</h3>
                <div className="space-y-4">
                  {availableDeliveries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No available deliveries at the moment</p>
                      <p className="text-sm mt-2">Check back later for new delivery opportunities</p>
                    </div>
                  ) : (
                    availableDeliveries.map((delivery: AvailableDelivery) => (
                      <div key={delivery.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-50 to-blue-50">
                        {/* Header with Order Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-[#0D1B2A] mb-1">Order #{delivery.orderId}</h4>
                            <p className="text-sm text-gray-600">
                              Packed: {new Date(delivery.packedAt).toLocaleDateString()} at {new Date(delivery.packedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-1">
                              ₹{delivery.deliveryCost} Delivery Fee
                            </div>
                            <div className="text-sm text-gray-600">{delivery.distance}km</div>
                          </div>
                        </div>

                        {/* Wholesaler Info */}
                        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Pickup from Wholesaler
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p><strong>Name:</strong> {delivery.wholesaler.name}</p>
                              <p><strong>Shop:</strong> {delivery.wholesaler.shopName}</p>
                            </div>
                            <div>
                              <p><strong>Phone:</strong> {delivery.wholesaler.phone}</p>
                              <p><strong>Address:</strong> {delivery.wholesaler.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Retailer Info */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Deliver to Retailer
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p><strong>Name:</strong> {delivery.retailer.name}</p>
                              <p><strong>Shop:</strong> {delivery.retailer.shopName}</p>
                            </div>
                            <div>
                              <p><strong>Phone:</strong> {delivery.retailer.phone}</p>
                              <p><strong>Address:</strong> {delivery.retailer.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p><strong>Products:</strong> {
                                typeof delivery.items === 'string' 
                                  ? delivery.items 
                                  : typeof delivery.items === 'object' 
                                    ? JSON.stringify(delivery.items).replace(/[{}"\[\]]/g, '').replace(/,/g, ', ')
                                    : 'Product details not available'
                              }</p>
                              <p><strong>Order Value:</strong> ₹{delivery.amount}</p>
                            </div>
                            <div>
                              <p><strong>Distance:</strong> {delivery.distance}km</p>
                              <p><strong>Your Earnings:</strong> ₹{delivery.deliveryCost}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => callWholesaler(delivery.wholesaler.phone, delivery.wholesaler.name)}
                              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                            >
                              <Phone className="h-4 w-4" />
                              <span>Call Wholesaler</span>
                            </button>
                            <button 
                              onClick={() => callRetailer(delivery.retailer.phone, delivery.retailer.name)}
                              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                            >
                              <Phone className="h-4 w-4" />
                              <span>Call Retailer</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => acceptDelivery(delivery.id)}
                            className="bg-[#5DAE49] text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Accept Delivery</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'deliveries' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-6">Active Deliveries</h3>
                <div className="space-y-4">
                  {activeDeliveries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No active deliveries at the moment</p>
                    </div>
                  ) : (
                    activeDeliveries.map((delivery: Delivery) => (
                    <div key={delivery.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-[#0D1B2A] mb-1">{delivery.retailer || 'N/A'}</h4>
                          <p className="text-gray-600 flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {delivery.address || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status || 'pending')}`}>
                          {delivery.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Items:</strong> {delivery.items || 'N/A'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Route className="h-4 w-4 mr-1" />
                            {delivery.distance || '0 km'}
                          </span>
                          <span className="flex items-center text-blue-600">
                            <Clock className="h-4 w-4 mr-1" />
                            ETA: {delivery.eta || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="flex-1 bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                          <Navigation className="h-4 w-4" />
                          <span>Navigate</span>
                        </button>
                        <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => markComplete(delivery.id)}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'returns' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-6 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Return Pickups Scheduled
                </h3>
                <div className="space-y-4">
                  {returnPickups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No return pickups scheduled</p>
                    </div>
                  ) : (
                    returnPickups.map((pickup: ReturnPickup) => (
                    <div key={pickup.id} className="border border-orange-200 rounded-xl p-6 bg-orange-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-[#0D1B2A] mb-1">{pickup.retailer || 'N/A'}</h4>
                          <p className="text-gray-600 flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {pickup.address || 'N/A'}
                          </p>
                        </div>
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          PICKUP REQUIRED
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Reason:</strong> {pickup.reason || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Scheduled: {pickup.scheduledTime || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => startPickup(pickup.id)}
                          className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Start Pickup
                        </button>
                        <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                          Reschedule
                        </button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-6">Today's Completed Deliveries</h3>
                <div className="space-y-3">
                  {completedDeliveries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No completed deliveries today</p>
                    </div>
                  ) : (
                    completedDeliveries.map((delivery: Delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-[#0D1B2A]">{delivery.retailer || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">{delivery.id || 'N/A'} • {delivery.time || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: delivery.rating || 0 }, (_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-[#FFC947]" />
                Notifications ({notifications.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif: Notification, index: number) => (
                    <div key={notif.id || index} className={`p-3 rounded-lg ${
                      notif.type === 'delivery_opportunity' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {notif.title || notif.message || 'New assignment'}
                          </p>
                          {notif.type === 'delivery_opportunity' && notif.orderId && (
                            <p className="text-xs text-blue-600 mt-1">Order #{notif.orderId}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.timestamp ? new Date(notif.timestamp).toLocaleString() : (notif.time || 'Now')}
                          </p>
                        </div>
                        {notif.type === 'delivery_opportunity' && notif.deliveryDetails && (
                          <button
                            onClick={() => handleShowOrderDetails(notif)}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Order Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Route Optimization */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4 flex items-center">
                <Route className="h-5 w-5 mr-2 text-[#5DAE49]" />
                AI Route Optimizer
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Optimized Route Ready</p>
                  <p className="text-xs text-green-600">Save 23 mins & 8.2km</p>
                </div>
                <button className="w-full bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  View Route Map
                </button>
              </div>
            </motion.div>

            {/* Vehicle Status */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">Vehicle Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fuel Level</span>
                  <span className="font-bold text-green-600">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Service</span>
                  <span className="font-bold text-[#0D1B2A]">15 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-bold text-green-600">Valid</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Next Service</span>
                  <span className="font-bold text-yellow-600">In 2 weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location</span>
                  <span className="font-bold text-[#0D1B2A] text-sm">
                    {currentLocation 
                      ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` 
                      : 'Acquiring GPS...'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-4">This Week's Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Deliveries</span>
                  <span>₹4,280</span>
                </div>
                <div className="flex justify-between">
                  <span>Returns</span>
                  <span>₹320</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus</span>
                  <span>₹150</span>
                </div>
                <hr className="border-white/30" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹4,750</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      


      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedNotification && selectedNotification.deliveryDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#0D1B2A] flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#FFC947]" />
                  Order Details
                </h2>
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#0D1B2A] mb-2">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order ID:</p>
                      <p className="font-medium">#{selectedNotification.orderId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.items}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Value:</p>
                      <p className="font-medium text-green-600">₹{selectedNotification.deliveryDetails.orderAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivery Fee:</p>
                      <p className="font-medium text-blue-600">₹{selectedNotification.deliveryDetails.deliveryCost}</p>
                    </div>
                  </div>
                </div>

                {/* Pickup Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#0D1B2A] mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    Pickup Information (Wholesaler)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.pickup.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Shop Name:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.pickup.shopName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Address:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.pickup.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-medium text-blue-600">
                        <a href={`tel:${selectedNotification.deliveryDetails.pickup.phone}`}>
                          {selectedNotification.deliveryDetails.pickup.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#0D1B2A] mb-3 flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-orange-600" />
                    Delivery Information (Retailer)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.delivery.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Shop Name:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.delivery.shopName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Address:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.delivery.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="font-medium text-blue-600">
                        <a href={`tel:${selectedNotification.deliveryDetails.delivery.phone}`}>
                          {selectedNotification.deliveryDetails.delivery.phone}
                        </a>
                      </p>
                    </div>
                    {selectedNotification.deliveryDetails.delivery.email && (
                      <div>
                        <p className="text-gray-600">Email:</p>
                        <p className="font-medium text-blue-600">
                          <a href={`mailto:${selectedNotification.deliveryDetails.delivery.email}`}>
                            {selectedNotification.deliveryDetails.delivery.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#0D1B2A] mb-3 flex items-center">
                    <Route className="h-4 w-4 mr-2 text-gray-600" />
                    Route Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Distance:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.distance} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estimated Duration:</p>
                      <p className="font-medium">{selectedNotification.deliveryDetails.estimatedDuration}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // This would navigate to the available deliveries tab
                    setActiveTab('available');
                    setShowOrderDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  View in Available Deliveries
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDashboard;