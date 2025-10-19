import React from 'react';
import { Link } from 'react-router-dom';

const TestVehiclePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">
            Test Vehicle Page
          </h1>
          <p className="text-xl text-gray-600">
            This is a test page to verify routing works
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Page is Working!</h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, the routing is working correctly.
          </p>
          <Link 
            to="/join-vehicle" 
            className="inline-block bg-[#FFC947] text-[#0D1B2A] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Go to Join Vehicle Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestVehiclePage;