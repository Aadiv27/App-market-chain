import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Clock, 
  RefreshCw,
  Eye,
  Route,
  AlertTriangle,
  CheckCircle,
  Phone,
  User,
  Calendar
} from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from './lib/Firebase';

// TypeScript Interfaces
interface VehicleLocation {
  uid: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone?: string;
  location: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  status: 'active' | 'idle' | 'offline';
  lastSeen: number;
  currentDeliveries?: number;
  totalDeliveries?: number;
}

interface VehicleLocationTrackerProps {
  className?: string;
}

const VehicleLocationTracker: React.FC<VehicleLocationTrackerProps> = ({ className = '' }) => {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const vehiclesRef = ref(realtimeDb, 'vehicles');
    const usersRef = ref(realtimeDb, 'users');

    let vehicleData: { [key: string]: any } = {};
    let userData: { [key: string]: any } = {};

    const processVehicleData = () => {
      const vehicleList: VehicleLocation[] = [];

      Object.entries(vehicleData).forEach(([uid, data]: [string, any]) => {
        const user = userData[uid];
        const userRole = user?.activeRole?.type || user?.role;
        if (user && userRole === 'vehicle_owner' && data.location) {
          const timeDiff = Date.now() - (data.location.timestamp || 0);
          const status = timeDiff < 300000 ? 'active' : timeDiff < 900000 ? 'idle' : 'offline'; // 5min active, 15min idle, else offline

          vehicleList.push({
            uid,
            vehicleNumber: user.activeRole?.data?.vehicleNumber || `VH-${uid.slice(-4)}`,
            driverName: user.fullName || user.name || 'Unknown Driver',
            driverPhone: user.phone || user.activeRole?.data?.phone,
            location: data.location,
            status,
            lastSeen: data.location.timestamp || 0,
            currentDeliveries: data.activeDeliveries ? Object.keys(data.activeDeliveries).length : 0,
            totalDeliveries: data.completedDeliveries ? Object.keys(data.completedDeliveries).length : 0
          });
        }
      });

      // Sort by last seen (most recent first)
      vehicleList.sort((a, b) => b.lastSeen - a.lastSeen);
      setVehicles(vehicleList);
      setLastUpdated(Date.now());
      setLoading(false);
    };

    const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
      try {
        vehicleData = snapshot.val() || {};
        console.log('📍 Vehicle data received:', Object.keys(vehicleData).length, 'vehicles');
        processVehicleData();
      } catch (err) {
        console.error('Error processing vehicle data:', err);
        setError('Failed to load vehicle locations');
        setLoading(false);
      }
    }, (err) => {
      console.error('Vehicle data fetch error:', err);
      setError('Failed to connect to vehicle tracking');
      setLoading(false);
    });

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      try {
        userData = snapshot.val() || {};
        processVehicleData();
      } catch (err) {
        console.error('Error processing user data:', err);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeVehicles();
      unsubscribeUsers();
    };
  }, []);

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'idle': return <Clock className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const openGoogleMaps = (lat: number, lng: number, vehicleNumber: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&hl=en&gl=US&mapclient=embed&cid=${vehicleNumber}`;
    window.open(url, '_blank');
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    filterStatus === 'all' || vehicle.status === filterStatus
  );

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const idleVehicles = vehicles.filter(v => v.status === 'idle').length;
  const offlineVehicles = vehicles.filter(v => v.status === 'offline').length;

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading vehicle locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="text-center py-8 text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Live Vehicle Tracking ({vehicles.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Real-time location monitoring • Updated {formatTimeAgo(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-[#0D1B2A]">{vehicles.length}</p>
            </div>
            <Truck className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-700">{activeVehicles}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Idle</p>
              <p className="text-2xl font-bold text-yellow-700">{idleVehicles}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Offline</p>
              <p className="text-2xl font-bold text-red-700">{offlineVehicles}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.uid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusColor(vehicle.status)}`}>
                  {getStatusIcon(vehicle.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#0D1B2A]">{vehicle.vehicleNumber}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-3 w-3" />
                    <span>{vehicle.driverName}</span>
                    {vehicle.driverPhone && (
                      <>
                        <span>•</span>
                        <Phone className="h-3 w-3" />
                        <span>{vehicle.driverPhone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {formatTimeAgo(vehicle.lastSeen)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="text-sm">
                <p className="text-gray-600">Location</p>
                <p className="font-medium text-[#0D1B2A]">
                  {vehicle.location.lat.toFixed(6)}, {vehicle.location.lng.toFixed(6)}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">Active Deliveries</p>
                <p className="font-medium text-[#0D1B2A]">{vehicle.currentDeliveries || 0}</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-600">Total Completed</p>
                <p className="font-medium text-[#0D1B2A]">{vehicle.totalDeliveries || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openGoogleMaps(vehicle.location.lat, vehicle.location.lng, vehicle.vehicleNumber)}
                  className="bg-[#5DAE49] text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center space-x-1"
                >
                  <Navigation className="h-3 w-3" />
                  <span>View on Map</span>
                </button>
                <button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors flex items-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Details</span>
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Last update: {new Date(vehicle.location.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No vehicles found for the selected status</p>
            <p className="text-sm mt-1">Vehicles will appear here when they start sharing location</p>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0D1B2A]">Vehicle Details</h3>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="font-semibold text-[#0D1B2A]">{selectedVehicle.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Driver</p>
                <p className="font-semibold text-[#0D1B2A]">{selectedVehicle.driverName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Location</p>
                <p className="font-mono text-sm text-[#0D1B2A]">
                  {selectedVehicle.location.lat.toFixed(6)}, {selectedVehicle.location.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Seen</p>
                <p className="text-sm text-[#0D1B2A]">{formatTimeAgo(selectedVehicle.lastSeen)}</p>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => openGoogleMaps(selectedVehicle.location.lat, selectedVehicle.location.lng, selectedVehicle.vehicleNumber)}
                  className="flex-1 bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Open in Maps</span>
                </button>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default VehicleLocationTracker;