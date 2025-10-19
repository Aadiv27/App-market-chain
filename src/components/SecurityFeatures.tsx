import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityFeaturesProps {
  onOTPAttempt: (attempts: number) => void;
  maxAttempts?: number;
}

const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ 
  maxAttempts = 3 
}) => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    if (failedAttempts >= maxAttempts) {
      setIsLocked(true);
      setLockoutTime(300); // 5 minutes lockout
      
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [failedAttempts, maxAttempts]);



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center space-x-3">
          <Lock className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Account Temporarily Locked</h3>
            <p className="text-red-600 text-sm">
              Too many failed attempts. Try again in {formatTime(lockoutTime)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Security Indicators */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-green-600">
          <Shield className="h-4 w-4" />
          <span>Secure Login</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Session expires in 24h</span>
        </div>
      </div>

      {/* Failed Attempts Warning */}
      {failedAttempts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-800 text-sm">
              {failedAttempts} of {maxAttempts} attempts used
            </span>
          </div>
        </motion.div>
      )}

      {/* Security Features List */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Security Features
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>End-to-end encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>OTP via SMS/WhatsApp</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Automatic session timeout</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Failed attempt protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeatures;