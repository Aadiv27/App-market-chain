import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Package, Users, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { seedFMCGProducts, verifyProducts } from '../utils/seedFMCGProducts';

const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      const result = await seedFMCGProducts();
      setSeedResult(result);
    } catch (error) {
      setSeedResult({ success: false, error: error });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleVerifyDatabase = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    
    try {
      const result = await verifyProducts();
      setVerifyResult(result);
    } catch (error) {
      setVerifyResult({ success: false, error: error });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
    >
      <div className="flex items-center mb-6">
        <Database className="h-6 w-6 text-[#5DAE49] mr-3" />
        <h2 className="text-xl font-bold text-[#0D1B2A]">Database Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seed Database Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-800">Seed FMCG Products</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Add comprehensive FMCG products to the database including rice, sugar, pulses, dairy, oil, flour, spices, snacks, and beverages.
          </p>
          
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isSeeding
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#5DAE49] text-white hover:bg-green-600'
            }`}
          >
            {isSeeding ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Seeding Database...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Seed Database</span>
              </>
            )}
          </button>

          {seedResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              seedResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {seedResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${seedResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {seedResult.success ? 'Success!' : 'Error!'}
                </span>
              </div>
              {seedResult.success && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Products added: {seedResult.productsAdded}</p>
                  <p>Wholesalers added: {seedResult.wholesalersAdded}</p>
                </div>
              )}
              {!seedResult.success && (
                <p className="mt-2 text-sm text-red-700">
                  {seedResult.error?.message || 'Failed to seed database'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Verify Database Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-800">Verify Products</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Check how many products are currently available in the database and verify the data integrity.
          </p>
          
          <button
            onClick={handleVerifyDatabase}
            disabled={isVerifying}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isVerifying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Verify Database</span>
              </>
            )}
          </button>

          {verifyResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              verifyResult.success ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {verifyResult.success ? (
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${verifyResult.success ? 'text-blue-800' : 'text-red-800'}`}>
                  {verifyResult.success ? 'Database Status' : 'Error!'}
                </span>
              </div>
              {verifyResult.success && (
                <div className="mt-2 text-sm text-blue-700">
                  <p>Total products found: {verifyResult.count}</p>
                  {verifyResult.count === 0 && (
                    <p className="text-orange-600 mt-1">No products found. Consider seeding the database.</p>
                  )}
                </div>
              )}
              {!verifyResult.success && (
                <p className="mt-2 text-sm text-red-700">
                  {verifyResult.error?.message || 'Failed to verify database'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. First, click "Verify Database" to check current products</li>
          <li>2. If no products exist, click "Seed Database" to add FMCG products</li>
          <li>3. The seeding process will add 30+ products across 8 categories</li>
          <li>4. All products will be visible to all retailers for ordering</li>
          <li>5. You can run the seeding process multiple times safely</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default DatabaseSeeder;