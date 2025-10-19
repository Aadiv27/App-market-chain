import React, { useState } from 'react';
import { seedTestData, cleanupTestData } from '../utils/databaseSeeder';

const TestDataSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedTestData();
      setMessage('✅ Test data seeded successfully! You can now test the "Mark as Packed" functionality.');
    } catch (error) {
      setMessage(`❌ Error seeding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupData = async () => {
    setLoading(true);
    setMessage('');
    try {
      await cleanupTestData();
      setMessage('✅ Test data cleaned up successfully!');
    } catch (error) {
      setMessage(`❌ Error cleaning up data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Data Management</h2>
      <p className="text-gray-600 mb-6">
        Use these buttons to seed test data for testing the "Mark as Packed" functionality in the Wholesaler Dashboard.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={handleSeedData}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Seeding Data...' : 'Seed Test Data'}
        </button>
        
        <button
          onClick={handleCleanupData}
          disabled={loading}
          className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cleaning Up...' : 'Cleanup Test Data'}
        </button>
      </div>

      {message && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm">{message}</p>
          {message.includes('seeded successfully') && (
            <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Test Wholesaler ID:</strong> wholesaler_test_123<br/>
                <strong>Instructions:</strong> Use this ID to login and access the Wholesaler Dashboard to test the "Mark as Packed" functionality.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestDataSeeder;