import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { navigationGuard } from '../utils/navigationGuard';

/**
 * Hook to reset navigation guard when successfully navigating to a page
 * This prevents the guard from blocking future legitimate navigation attempts
 */
export const useNavigationReset = () => {
  const location = useLocation();

  useEffect(() => {
    // Reset the navigation guard for the current path when component mounts
    // This indicates successful navigation
    const currentPath = location.pathname;
    
    // Small delay to ensure the navigation is complete
    const timer = setTimeout(() => {
      navigationGuard.reset(currentPath);
      console.log(`Navigation guard reset for ${currentPath}`);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};