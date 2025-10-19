import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { navigationGuard } from '../utils/navigationGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  console.log('🔒 ProtectedRoute - Path:', location.pathname, 'AllowedRoles:', allowedRoles);
  console.log('🔒 ProtectedRoute - User:', user);
  console.log('🔒 ProtectedRoute - IsAuthenticated:', isAuthenticated, 'IsLoading:', isLoading);
  const lastNavigationAttempt = useRef<{ path: string; timestamp: number } | null>(null);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoize the user role to prevent unnecessary re-calculations
  const userRole = useMemo(() => {
    // Try multiple ways to get the role for compatibility
    const role = user?.activeRole?.type || 
                 (user as any)?.role || 
                 user?.roles?.[0]?.type;
    console.log('🔒 ProtectedRoute - UserRole:', role);
    console.log('🔒 ProtectedRoute - User.activeRole:', user?.activeRole);
    console.log('🔒 ProtectedRoute - User.role:', (user as any)?.role);
    console.log('🔒 ProtectedRoute - User.roles:', user?.roles);
    return role;
  }, [user]);

  // Memoize the redirect logic to prevent unnecessary re-calculations
  // This must be called before any conditional returns to maintain hook order
  const redirectComponent = useMemo(() => {
    // Only calculate redirect logic if we have user data and are authenticated
    if (!user || !isAuthenticated || isLoading) {
      return null;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log('Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
      
      // Prevent redirect loops by checking current location
      const currentPath = location.pathname;
      
      // Define role-to-route mapping
      const roleRoutes: Record<string, string> = {
        'retailer': '/retailer-dashboard',
        'wholesaler': '/wholesaler-dashboard',
        'vehicle_owner': '/vehicle-dashboard',
        'admin': '/admin-dashboard'
      };
      
      const targetRoute = roleRoutes[userRole] || '/login';
      
      // If we're already on the correct page, don't redirect
      if (currentPath === targetRoute) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74C3C] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        );
      }
      
      return { needsRedirect: true, targetRoute };
    }
    
    return null;
  }, [userRole, allowedRoles, location.pathname, user, isAuthenticated, isLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, []);

  // Debounced navigation function
  const attemptNavigation = useCallback((targetRoute: string) => {
    const now = Date.now();
    
    // Check if we recently attempted navigation to the same route
    if (lastNavigationAttempt.current && 
        lastNavigationAttempt.current.path === targetRoute &&
        now - lastNavigationAttempt.current.timestamp < 1000) {
      console.log(`Debouncing navigation to ${targetRoute}`);
      return null;
    }

    lastNavigationAttempt.current = { path: targetRoute, timestamp: now };

    // Check if navigation is blocked
    if (navigationGuard.isBlocked(targetRoute)) {
      console.warn(`Navigation to ${targetRoute} is blocked. Resetting after delay.`);
      
      // Clear the block after a delay and try again
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
      
      navigationTimeout.current = setTimeout(() => {
        navigationGuard.reset(targetRoute);
      }, 3000);
      
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Navigation Temporarily Blocked</strong>
              <p className="block sm:inline mt-2">
                Too many navigation attempts detected. Automatically resetting...
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74C3C] mx-auto"></div>
          </div>
        </div>
      );
    }

    // Attempt navigation with guard
    if (navigationGuard.canNavigate(targetRoute)) {
      return <Navigate to={targetRoute} replace />;
    }

    return null;
  }, []);

  // Show loading while authentication is being determined
  if (isLoading || user === undefined) {
    console.log('🔒 ProtectedRoute - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74C3C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🔒 ProtectedRoute - User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle redirect logic
  if (redirectComponent) {
    if (typeof redirectComponent === 'object' && 'needsRedirect' in redirectComponent) {
      // Use the debounced navigation function
      const navigationResult = attemptNavigation(redirectComponent.targetRoute);
      if (navigationResult) {
        return navigationResult;
      }
      
      // If navigation was debounced or blocked, show loading
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E74C3C] mx-auto mb-4"></div>
            <p className="text-gray-600">Preparing dashboard...</p>
          </div>
        </div>
      );
    }
    return redirectComponent;
  }

  return <>{children}</>;
};

export default ProtectedRoute;