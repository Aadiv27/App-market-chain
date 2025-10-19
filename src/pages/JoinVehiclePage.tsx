import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, FileText, CheckCircle, Mail, Lock } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  User
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/lib/Firebase';
import { createUserInDatabase, VehicleOwnerData } from '../services/userService';
import KYCVerification from '../components/KYCVerification';

const JoinVehiclePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    vehicleNumber: '',
    capacity: '',
    licenseNumber: '',
    rcNumber: '',
    insuranceNumber: '',
    bankAccount: '',
    ifscCode: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Personal Details', icon: Truck },
    { id: 2, title: 'Vehicle Information', icon: FileText },
    { id: 3, title: 'Password Setup', icon: Lock },
    { id: 4, title: 'Documents & KYC', icon: FileText },
    { id: 5, title: 'Verification Complete', icon: CheckCircle }
  ];

  const vehicleTypes = [
    { value: 'bike', label: 'Motorcycle (Up to 50kg)' },
    { value: 'auto', label: 'Auto Rickshaw (Up to 200kg)' },
    { value: 'mini_truck', label: 'Mini Truck (Up to 1 Ton)' },
    { value: 'truck', label: 'Truck (1-5 Tons)' },
    { value: 'large_truck', label: 'Large Truck (5+ Tons)' }
  ];

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
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber,
      capacity: formData.capacity,
      licenseNumber: formData.licenseNumber
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
      const vehicleOwnerData: Partial<VehicleOwnerData> = {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        role: 'vehicle_owner',
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        capacity: formData.capacity,
        licenseNumber: formData.licenseNumber,
        rcNumber: formData.rcNumber,
        insuranceNumber: formData.insuranceNumber,
        bankAccount: formData.bankAccount,
        ifscCode: formData.ifscCode,
        isAvailable: true
      };
      await createUserInDatabase(user, vehicleOwnerData);
      setCurrentStep(5);
      navigate('/vehicle-dashboard'); // Redirect after success
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.fullName && formData.email && formData.phoneNumber) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.vehicleType && formData.vehicleNumber && formData.capacity && formData.licenseNumber) {
        setCurrentStep(3);
      } else {
        setError('Please fill all vehicle details');
      }
    } else if (currentStep === 3 && formData.password && formData.confirmPassword) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleSubmit();
    } else {
      setError('Please fill all required fields');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
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
            Join as Vehicle Owner
          </h1>
          <p className="text-xl text-gray-600">
            Register your vehicle and start earning with optimized delivery routes
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-[#FFC947] text-[#0D1B2A]' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-[#FFC947]' : 'bg-gray-200'
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
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Personal Details</h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
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
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Vehicle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
                    required
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
                    placeholder="JH01AB1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrying Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
                    placeholder="1000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
                    placeholder="DL number"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC947] focus:border-transparent"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <KYCVerification userType="vehicle_owner" />
          )}

          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-[#FFC947] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-[#0D1B2A]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">
                Registration Complete!
              </h2>
              <p className="text-gray-600 mb-8">
                Your vehicle has been registered successfully. You'll receive delivery assignments based on optimized routes.
              </p>
              <button 
                onClick={() => navigate('/vehicle-dashboard')}
                className="bg-[#FFC947] text-[#0D1B2A] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                View Dashboard
              </button>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
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
                className="px-6 py-3 bg-[#FFC947] text-[#0D1B2A] rounded-lg hover:bg-yellow-500 transition-colors"
              >
                {currentStep === 4 ? 'Complete Registration' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinVehiclePage;