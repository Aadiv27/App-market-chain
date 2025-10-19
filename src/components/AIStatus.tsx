import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import aiAssistant from '../services/aiAssistant';

const AIStatus: React.FC = () => {
  const [status, setStatus] = useState<{ isValid: boolean; message: string }>({ 
    isValid: false, 
    message: 'Checking...' 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const apiStatus = aiAssistant.getApiStatus();
      setStatus(apiStatus);
      
      // If API key seems valid, test it
      if (apiStatus.isValid) {
        const testResult = await aiAssistant.testApiKey();
        setStatus({
          isValid: testResult.success,
          message: testResult.message
        });
      }
    } catch (error) {
      setStatus({
        isValid: false,
        message: 'Failed to check AI status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (status.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'border-yellow-200 bg-yellow-50';
    if (status.isValid) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getTextColor = () => {
    if (isLoading) return 'text-yellow-700';
    if (status.isValid) return 'text-green-700';
    return 'text-red-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}
    >
      <Bot className="h-4 w-4 text-gray-600" />
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {status.message}
      </span>
      {!isLoading && (
        <button
          onClick={checkStatus}
          className="ml-2 p-1 rounded hover:bg-white/50 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="h-3 w-3 text-gray-500" />
        </button>
      )}
    </motion.div>
  );
};

export default AIStatus;