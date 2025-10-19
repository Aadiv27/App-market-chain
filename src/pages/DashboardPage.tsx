import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get user role from either new or old structure
    const userRole = user?.activeRole?.type || (user as any)?.role;

    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'retailer':
        navigate('/retailer-dashboard');
        break;
      case 'wholesaler':
        navigate('/wholesaler-dashboard');
        break;
      case 'vehicle_owner':
        navigate('/vehicle-dashboard');
        break;
      default:
        // If no role is set, redirect to login
        navigate('/login');
        break;
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Redirecting to your dashboard...
        </h2>
        <p className="text-gray-600">
          Please wait while we load your personalized dashboard.
        </p>
      </motion.div>
    </div>
  );
};

export default DashboardPage;