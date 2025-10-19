import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { checkFirebaseConfig, getFirebaseSetupInstructions } from '../utils/firebaseConfigChecker';

const FirebaseStatus: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkConfig = () => {
      try {
        const result = checkFirebaseConfig();
        setConfig(result);
      } catch (error) {
        setConfig({
          isConfigured: false,
          issues: ['Failed to check Firebase configuration'],
          recommendations: ['Check Firebase console setup']
        });
      }
    };

    checkConfig();
  }, []);

  if (!config) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {config.isConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-600" />
          )}
          <span className="font-medium text-gray-900">
            Firebase Status: {config.isConfigured ? 'Configured' : 'Needs Setup'}
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {config.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Issues Found:
              </h4>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {config.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {config.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Recommendations:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                {config.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Project Info:</h4>
            <p className="text-sm text-gray-600">
              Project ID: <span className="font-mono">{config.projectId || 'Not available'}</span>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Demo Mode
            </h4>
            <p className="text-sm text-yellow-700 mb-2">
              The app will work in demo mode even if Firebase is not fully configured. 
              Use OTP: <span className="font-mono font-bold">123456</span> for testing.
            </p>
            <a
              href="https://console.firebase.google.com/project/market-chain-5bd35"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Open Firebase Console
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FirebaseStatus; 