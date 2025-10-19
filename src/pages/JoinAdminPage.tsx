import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Mail, Lock, User } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/lib/Firebase';
import { createUserInDatabase, AdminData } from '../services/userService';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  department: string;
  employeeId: string;
}

const JoinAdminPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    department: '',
    employeeId: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Password Setup', icon: Lock },
    { id: 3, title: 'Registration Complete', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+91\d{10}$/; // Basic Indian phone validation
    return phoneRegex.test(phone);
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
      department: formData.department,
      employeeId: formData.employeeId
    };
    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key as keyof typeof requiredFields]);
    if (missingFields.length > 0) {
      setError(`Please fill: ${missingFields.join(', ')}`);
      return;
    }
    // Validate phone format
    if (!validatePhone(formData.phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +919876543210)');
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user: FirebaseUser = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName: formData.fullName });
      
      // Store in database using the new service
      const adminData: Partial<AdminData> = {
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        role: 'admin',
        department: formData.department,
        employeeId: formData.employeeId,
        adminLevel: 'standard',
        permissions: ['read', 'write', 'admin'] // Default permissions for standard admin
      };
      
      await createUserInDatabase(user, adminData);
      
      // Show success step
      setCurrentStep(3);
      
      // Clear form on success
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        department: '',
        employeeId: '',
      });
      
      // Wait for the auth state to update, then redirect
      setTimeout(() => {
        try {
          navigate('/admin-dashboard');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback: try to redirect using window.location
          window.location.href = '/admin-dashboard';
        }
      }, 3000); // Increased delay to ensure auth state is updated
      
    } catch (err: any) {
      console.error('Admin registration error:', err);
      // Specific error messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection and try again.');
          break;
        default:
          setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.fullName && formData.email && formData.phoneNumber && formData.department && formData.employeeId) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.password && formData.confirmPassword) {
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
            Join as Admin
          </h1>
          <p className="text-xl text-gray-600">
            Complete your registration to manage the MarketChain platform
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-[#E74C3C] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-[#E74C3C]' : 'bg-gray-200'
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
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Personal Information</h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                    aria-label="Full Name"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    aria-label="Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    required
                    aria-label="Department"
                  >
                    <option value="">Select department</option>
                    <option value="operations">Operations</option>
                    <option value="customer_support">Customer Support</option>
                    <option value="finance">Finance</option>
                    <option value="marketing">Marketing</option>
                    <option value="technical">Technical</option>
                    <option value="management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="Enter your employee ID"
                    required
                    aria-label="Employee ID"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                    aria-label="Phone Number"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="Enter password"
                    required
                    aria-label="Password"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E74C3C] focus:border-transparent"
                    placeholder="Confirm password"
                    required
                    aria-label="Confirm Password"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-[#E74C3C] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">
                Registration Complete!
              </h2>
              <p className="text-gray-600 mb-8">
                Your admin account has been created successfully. You will be redirected to the admin dashboard shortly.
              </p>
              <div className="flex items-center justify-center space-x-2 text-[#E74C3C]">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E74C3C]"></div>
                <span className="text-sm">Redirecting to Admin Dashboard...</span>
              </div>
              <button 
                onClick={() => {
                  try {
                    navigate('/admin-dashboard');
                  } catch (navError) {
                    console.error('Navigation error:', navError);
                    window.location.href = '/admin-dashboard';
                  }
                }}
                className="mt-6 bg-[#E74C3C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                Go to Admin Dashboard Now
              </button>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={currentStep === 1 || loading}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-3 bg-[#E74C3C] text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (currentStep === 2 ? 'Complete Registration' : 'Next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinAdminPage;