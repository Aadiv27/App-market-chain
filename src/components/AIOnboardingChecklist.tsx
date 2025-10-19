import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, Package, Search, Bot, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AIOnboardingChecklist = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    // Show checklist for new users or those with incomplete profiles
    if (user && user.kycStatus === 'pending') {
      setIsVisible(true);
    }
  }, [user]);

  const getTasksForRole = () => {
    if (!user) return [];

    switch (user.activeRole.type) {
      case 'retailer':
        return [
          { id: 'kyc', title: 'Complete KYC Verification', icon: Upload, description: 'Upload Aadhaar and PAN documents' },
          { id: 'search', title: 'Try AI Product Search', icon: Search, description: 'Ask AI: "Cheapest 10kg rice"' },
          { id: 'order', title: 'Place Your First Order', icon: Package, description: 'Order from a verified wholesaler' }
        ];
      case 'wholesaler':
        return [
          { id: 'kyc', title: 'Complete KYC Verification', icon: Upload, description: 'Upload GSTIN and business documents' },
          { id: 'products', title: 'Add Your First Product', icon: Package, description: 'List products in your inventory' },
          { id: 'profile', title: 'Complete Business Profile', icon: Bot, description: 'Add business details and photos' }
        ];
      case 'vehicle_owner':
        return [
          { id: 'kyc', title: 'Upload Vehicle Documents', icon: Upload, description: 'License, RC, and Insurance' },
          { id: 'vehicle', title: 'Register Your Vehicle', icon: Package, description: 'Add vehicle details and capacity' },
          { id: 'route', title: 'Set Your Service Area', icon: Search, description: 'Define your delivery zones' }
        ];
      default:
        return [];
    }
  };

  const tasks = getTasksForRole();

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks([...completedTasks, taskId]);
    
    // Simulate task completion
    setTimeout(() => {
      if (taskId === 'kyc') {
        alert('KYC verification initiated! You will receive updates via SMS.');
      } else {
        alert(`${tasks.find(t => t.id === taskId)?.title} completed!`);
      }
    }, 500);
  };

  if (!isVisible || !user) return null;

  const completionPercentage = (completedTasks.length / tasks.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.5 }}
        className="fixed right-4 top-20 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-[#5DAE49]" />
              <h3 className="text-lg font-bold text-[#0D1B2A]">AI Onboarding</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(completionPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] h-2 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-[#5DAE49]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <task.icon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isCompleted ? 'text-green-800' : 'text-[#0D1B2A]'
                      }`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                      {!isCompleted && (
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="mt-2 bg-[#5DAE49] text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {completionPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 p-4 bg-gradient-to-r from-[#5DAE49] to-[#FFC947] rounded-lg text-white text-center"
            >
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-bold">Onboarding Complete!</h4>
              <p className="text-sm opacity-90">You're all set to use MarketChain</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIOnboardingChecklist;