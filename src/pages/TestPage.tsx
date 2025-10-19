import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">
          MarketChain Test Page
        </h1>
        <p className="text-xl text-gray-600">
          If you can see this, React is working properly!
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
          <p className="text-sm text-gray-500">
            Server is running on localhost:5174
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 