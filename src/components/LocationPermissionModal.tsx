import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  X,
  RefreshCw,
  Settings
} from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: (location: { lat: number; lng: number }) => void;
  onPermissionDenied: () => void;
  userRole?: string;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
  userRole = 'vehicle_owner'
}) => {
  const [permissionState, setPermissionState] = useState<'requesting' | 'granted' | 'denied' | 'error'>('requesting');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setPermissionState('error');
      setIsLoading(false);
      return;
    }

    try {
      // First check if permission is already granted
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          setPermissionState('denied');
          setIsLoading(false);
          return;
        }
      }

      // Request current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          
          setCurrentLocation(location);
          setPermissionState('granted');
          setIsLoading(false);
          
          // Call the success callback
          onPermissionGranted(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionState('denied');
            setError('Location permission was denied. Please enable location access in your browser settings.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setPermissionState('error');
            setError('Location information is unavailable. Please check your GPS signal.');
          } else if (error.code === error.TIMEOUT) {
            setPermissionState('error');
            setError('Location request timed out. Please try again.');
          } else {
            setPermissionState('error');
            setError('Failed to get your location. Please try again.');
          }
          
          setIsLoading(false);
          onPermissionDenied();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (err) {
      console.error('Permission request error:', err);
      setError('Failed to request location permission.');
      setPermissionState('error');
      setIsLoading(false);
      onPermissionDenied();
    }
  };

  const openBrowserSettings = () => {
    // Show instructions for enabling location
    alert(`To enable location access:
    
Chrome/Edge:
1. Click the location icon in the address bar
2. Select "Always allow" for this site
3. Refresh the page

Firefox:
1. Click the shield icon in the address bar
2. Click "Allow Location Access"
3. Refresh the page

Safari:
1. Go to Safari > Preferences > Websites
2. Select Location from the left sidebar
3. Set this website to "Allow"`);
  };

  useEffect(() => {
    if (isOpen) {
      // Auto-request permission when modal opens
      setTimeout(() => {
        requestLocationPermission();
      }, 1000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0D1B2A]">Location Access Required</h3>
                <p className="text-sm text-gray-600">Enable live tracking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content based on permission state */}
          {permissionState === 'requesting' && (
            <div className="text-center py-6">
              {isLoading ? (
                <>
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
                  <h4 className="text-lg font-semibold text-[#0D1B2A] mb-2">Requesting Location Access</h4>
                  <p className="text-gray-600 mb-4">Please allow location access when prompted by your browser.</p>
                </>
              ) : (
                <>
                  <Navigation className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="text-lg font-semibold text-[#0D1B2A] mb-2">Enable Live Location Tracking</h4>
                  <p className="text-gray-600 mb-4">
                    As a {userRole === 'vehicle_owner' ? 'vehicle owner' : 'user'}, sharing your location helps:
                  </p>
                  <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Optimize delivery routes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Track deliveries in real-time</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Improve customer service</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span>Secure and private tracking</span>
                    </li>
                  </ul>
                  <button
                    onClick={requestLocationPermission}
                    className="w-full bg-[#5DAE49] text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Enable Location Access
                  </button>
                </>
              )}
            </div>
          )}

          {permissionState === 'granted' && (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h4 className="text-lg font-semibold text-[#0D1B2A] mb-2">Location Access Granted!</h4>
              <p className="text-gray-600 mb-4">
                Your location is now being shared securely for delivery tracking.
              </p>
              {currentLocation && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">Current Location:</p>
                  <p className="text-sm font-mono text-[#0D1B2A]">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full bg-[#5DAE49] text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h4 className="text-lg font-semibold text-[#0D1B2A] mb-2">Location Access Denied</h4>
              <p className="text-gray-600 mb-4">
                Location access is required for delivery tracking and route optimization.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>To enable location access:</strong>
                </p>
                <ol className="text-sm text-yellow-700 mt-2 space-y-1 text-left">
                  <li>1. Click the location icon in your browser's address bar</li>
                  <li>2. Select "Allow" or "Always allow"</li>
                  <li>3. Refresh the page and try again</li>
                </ol>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={openBrowserSettings}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Help</span>
                </button>
                <button
                  onClick={requestLocationPermission}
                  className="flex-1 bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {permissionState === 'error' && (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h4 className="text-lg font-semibold text-[#0D1B2A] mb-2">Location Error</h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Skip for Now
                </button>
                <button
                  onClick={requestLocationPermission}
                  className="flex-1 bg-[#5DAE49] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Your location data is encrypted and only used for delivery tracking</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPermissionModal;