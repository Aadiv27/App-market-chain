import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Store, Package, Shield } from 'lucide-react';

const NavigationTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">
            Navigation Test Page
          </h1>
          <p className="text-xl text-gray-600">
            Test all registration and login flows
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Registration Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/join-retailer"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#5DAE49] hover:bg-green-50 transition-all"
            >
              <Store className="h-8 w-8 text-[#5DAE49] mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Join as Retailer</h3>
                <p className="text-sm text-gray-600">Register your retail shop</p>
              </div>
            </Link>

            <Link
              to="/join-vehicle"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FFC947] hover:bg-yellow-50 transition-all"
            >
              <Truck className="h-8 w-8 text-[#FFC947] mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Join as Vehicle Owner</h3>
                <p className="text-sm text-gray-600">Register your vehicle</p>
              </div>
            </Link>

            <Link
              to="/join-wholesaler"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#5DAE49] hover:bg-green-50 transition-all"
            >
              <Package className="h-8 w-8 text-[#5DAE49] mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Join as Wholesaler</h3>
                <p className="text-sm text-gray-600">Register your wholesale business</p>
              </div>
            </Link>

            <Link
              to="/login"
              className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0D1B2A] hover:bg-gray-50 transition-all"
            >
              <Shield className="h-8 w-8 text-[#0D1B2A] mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Login Page</h3>
                <p className="text-sm text-gray-600">For existing users</p>
              </div>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Test Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/simple-vehicle"
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Simple Vehicle Form</h4>
              <p className="text-sm text-blue-700">Basic form test</p>
            </Link>

            <Link
              to="/test-vehicle"
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">Test Vehicle Page</h4>
              <p className="text-sm text-green-700">Routing test</p>
            </Link>

            <Link
              to="/join-vehicle-fixed"
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">Fixed Vehicle Page</h4>
              <p className="text-sm text-purple-700">Enhanced version</p>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Click "Join as Vehicle Owner" to register a new vehicle owner account</li>
              <li>Fill out all the registration steps (Personal Details → Vehicle Info → Password → KYC)</li>
              <li>After registration, use the "Login Page" to sign in with your new credentials</li>
              <li>Select "Vehicle Owner" role and enter your email/password to login</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;