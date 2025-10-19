import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface RoleHelperProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const RoleHelper: React.FC<RoleHelperProps> = ({ selectedRole, onRoleChange }) => {
  const [showHelper, setShowHelper] = useState(false);

  const roleDescriptions = {
    retailer: {
      title: 'Retailer',
      description: 'Shop owners who buy products from wholesalers to sell to customers',
      features: ['Order from wholesalers', 'Manage inventory', 'Track deliveries', 'Customer management'],
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    wholesaler: {
      title: 'Wholesaler',
      description: 'Suppliers who sell products in bulk to retailers',
      features: ['List products', 'Manage bulk orders', 'Set wholesale prices', 'Retailer network'],
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    vehicle_owner: {
      title: 'Vehicle Owner',
      description: 'Transport providers who deliver goods between wholesalers and retailers',
      features: ['Accept delivery jobs', 'Track routes', 'Manage vehicle details', 'Earnings dashboard'],
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    admin: {
      title: 'Admin',
      description: 'Platform administrators who manage the entire system',
      features: ['User management', 'System monitoring', 'Analytics', 'Support'],
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    }
  };

  return (
    <div className="mb-4">
      {/* Helper Toggle Button */}
      <button
        type="button"
        onClick={() => setShowHelper(!showHelper)}
        className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
      >
        <Info className="h-4 w-4 mr-1" />
        Not sure which role to select?
      </button>

      {/* Helper Content */}
      {showHelper && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4 className="font-semibold text-blue-900 mb-3">Choose your role based on how you signed up:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(roleDescriptions).map(([role, info]) => (
              <div
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  setShowHelper(false);
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedRole === role 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{info.title}</h5>
                  {selectedRole === role && <CheckCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                <ul className="text-xs text-gray-500">
                  {info.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> You must select the same role you used when signing up. 
                If you signed up as a Retailer, you can only login as a Retailer.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Role Confirmation */}
      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border-2 ${roleDescriptions[selectedRole as keyof typeof roleDescriptions]?.color || 'bg-gray-50 border-gray-200'}`}
        >
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">
              Logging in as: {roleDescriptions[selectedRole as keyof typeof roleDescriptions]?.title || selectedRole}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoleHelper;