import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const KYCAlert = () => {
  const { user, updateKYCStatus } = useAuth();

  if (!user || user.kycStatus === 'verified') {
    return null;
  }

  const handleCompleteKYC = () => {
    // Simulate KYC completion
    setTimeout(() => {
      updateKYCStatus('verified');
      alert('KYC verification completed successfully!');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            KYC Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Complete your KYC verification to unlock all features and increase your order limits.
              Auto-reminder will be sent every 48 hours until completed.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleCompleteKYC}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Complete KYC Now</span>
            </button>
            <div className="flex items-center text-xs text-yellow-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Takes 5-10 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KYCAlert;