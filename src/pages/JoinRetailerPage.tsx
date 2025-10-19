import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, CheckCircle, Mail, Lock } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  User
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/lib/Firebase';
import { createUserInDatabase, RetailerData } from '../services/userService';

const JoinRetailerPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    address: '',
    pincode: '',
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Basic Information', icon: Store },
    { id: 2, title: 'Business Details', icon: Store },
    { id: 3, title: 'Password Setup', icon: Lock },
    { id: 4, title: 'Verification Complete', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    // Check all required fields
    const requiredFields = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      shopName: formData.shopName,
      address: formData.address,
      pincode: formData.pincode
    };
    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key as keyof typeof requiredFields]);
    if (missingFields.length > 0) {
      setError(`Please fill: ${missingFields.join(', ')}`);
      return;
    }
    try {
      setError('');
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user: User = userCredential.user;
      // Update profile
      await updateProfile(user, { displayName: formData.fullName });
      
      // Store in database using the new service
      const retailerData: Partial<RetailerData> = {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        role: 'retailer',
        shopName: formData.shopName,
        address: formData.address,
        pincode: formData.pincode
      };
      await createUserInDatabase(user, retailerData);
      setCurrentStep(4);
      navigate('/retailer-dashboard'); // Redirect after success
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.fullName && formData.email && formData.phoneNumber) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.shopName && formData.address && formData.pincode) {
        setCurrentStep(3);
      } else {
        setError('Please fill all business details');
      }
    } else if (currentStep === 3 && formData.password && formData.confirmPassword) {
      handleSubmit();
    } else {
      setError('Please fill all required fields');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#0D1B2A] mb-4">
            Join as Retailer
          </h1>
          <p className="text-xl text-gray-600">
            Complete your registration to start ordering from trusted wholesalers
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-[#5DAE49] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-[#5DAE49]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Your shop name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="834001"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Complete shop address"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Set Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-[#5DAE49] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">
                Registration Complete!
              </h2>
              <p className="text-gray-600 mb-8">
                Your retailer account has been created successfully. You can now start ordering from verified wholesalers.
              </p>
              <button 
                onClick={() => navigate('/retailer-dashboard')}
                className="bg-[#5DAE49] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={currentStep === 1}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[#5DAE49] text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {currentStep === 3 ? 'Complete Registration' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRetailerPage;