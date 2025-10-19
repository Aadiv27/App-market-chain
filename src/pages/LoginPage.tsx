import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Eye, 
  EyeOff, 
  Truck, 
  Store, 
  Package, 
  Shield,
  Mic,
  ArrowRight
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, realtimeDb } from '../components/lib/Firebase';
import { loginWithRoleValidation } from '../services/authService';
import { navigationGuard } from '../utils/navigationGuard';
import SecurityFeatures from '../components/SecurityFeatures';
import RoleHelper from '../components/RoleHelper';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // Default to email
  const [language, setLanguage] = useState('english');
  const [showPassword, setShowPassword] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  const roles = [
    { value: 'retailer', label: 'Retailer', icon: Store, color: 'bg-[#5DAE49]' },
    { value: 'wholesaler', label: 'Wholesaler', icon: Package, color: 'bg-[#FFC947]' },
    { value: 'vehicle_owner', label: 'Vehicle Owner', icon: Truck, color: 'bg-[#5DAE49]' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-[#0D1B2A]' }
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी' },
    { value: 'bengali', label: 'বাংলা' },
    { value: 'tamil', label: 'தமிழ்' }
  ];

  const translations = {
    english: {
      welcome: 'Welcome to MarketChain',
      tagline: 'Aasani se order, bharoshe se delivery',
      selectRole: 'Select Your Role',
      phoneNumber: 'Phone Number',
      enterPhone: 'Enter your phone number',
      login: 'Login',
      continue: 'Continue',
      or: 'or',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      newUser: "Don't have an account?",
      signUp: 'Sign up',
      voiceInput: 'Use voice input',
      phoneTooltip: 'Enter your 10-digit mobile number',
      invalidCredentials: 'Invalid email or password. Please try again.',
      userNotFound: 'No account found with this email. Please sign up first.',
      wrongPassword: 'Incorrect password. Please try again.',
      tooManyRequests: 'Too many failed attempts. Please try again later.',
      networkError: 'Network error. Please check your connection.',
      loading: 'Loading...'
    },
    hindi: {
      welcome: 'MarketChain में आपका स्वागत है',
      tagline: 'आसानी से ऑर्डर, भरोसे से डिलीवरी',
      selectRole: 'अपनी भूमिका चुनें',
      phoneNumber: 'फोन नंबर',
      enterPhone: 'अपना फोन नंबर डालें',
      login: 'लॉगिन',
      continue: 'जारी रखें',
      or: 'या',
      email: 'ईमेल',
      password: 'पासवर्ड',
      rememberMe: 'मुझे याद रखें',
      forgotPassword: 'पासवर्ड भूल गए?',
      newUser: 'खाता नहीं है?',
      signUp: 'साइन अप करें',
      voiceInput: 'आवाज़ का उपयोग करें',
      phoneTooltip: 'अपना 10 अंकों का मोबाइल नंबर डालें',
      invalidCredentials: 'अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।',
      userNotFound: 'इस ईमेल से कोई खाता नहीं मिला। कृपया पहले साइन अप करें।',
      wrongPassword: 'गलत पासवर्ड। कृपया पुनः प्रयास करें।',
      tooManyRequests: 'बहुत सारे असफल प्रयास। कृपया बाद में पुनः प्रयास करें।',
      networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      loading: 'लोड हो रहा है...'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.english;

  // Enhanced auth state listener
  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('User authenticated:', user.uid);
          
          // Clean up previous user listener
          if (unsubscribeUser) {
            unsubscribeUser();
          }
          
          // Listen to user data in realtime database
          const userRef = ref(realtimeDb, `users/${user.uid}`);
          unsubscribeUser = onValue(userRef, (snapshot) => {
            try {
              const userData = snapshot.val();
              console.log('User data from DB:', userData);
              
              if (userData && userData.role) {
                setUserRole(userData.role);
                setAuthLoading(false);
                
                // Auto-redirect based on role (only if not already on target page)
                const roleRoutes = {
                  retailer: '/retailer-dashboard',
                  wholesaler: '/wholesaler-dashboard', 
                  vehicle_owner: '/vehicle-dashboard',
                  admin: '/admin-dashboard'
                };
                
                const targetRoute = roleRoutes[userData.role as keyof typeof roleRoutes] || '/admin-dashboard';
                const currentPath = window.location.pathname;
                
                console.log('🚀 Auto-redirect check:', {
                  userRole: userData.role,
                  targetRoute,
                  currentPath,
                  shouldRedirect: currentPath !== targetRoute && currentPath === '/login'
                });
                
                // Only navigate if we're not already on the target route and we're on login page
                if (currentPath !== targetRoute && currentPath === '/login') {
                  // Reset navigation guard for this route to ensure clean navigation
                  navigationGuard.reset(targetRoute);
                  
                  // Small delay to ensure auth state is fully settled
                  setTimeout(() => {
                    if (navigationGuard.canNavigate(targetRoute)) {
                      console.log('🚀 Redirecting to:', targetRoute);
                      navigate(targetRoute, { replace: true });
                    } else {
                      console.warn(`🚀 Navigation to ${targetRoute} blocked by guard, retrying...`);
                      // Force reset and try again
                      navigationGuard.reset(targetRoute);
                      navigate(targetRoute, { replace: true });
                    }
                  }, 100);
                }
              } else {
                console.log('No role found in user data, staying on login page');
                setUserRole('');
                setAuthLoading(false);
              }
            } catch (dbError) {
              console.error('Error processing user data:', dbError);
              setUserRole('');
              setAuthLoading(false);
            }
          }, (error) => {
            console.error('Database listener error:', error);
            setUserRole('');
            setAuthLoading(false);
          });
        } else {
          console.log('User not authenticated');
          setUserRole('');
          setAuthLoading(false);
          
          // Clean up user listener
          if (unsubscribeUser) {
            unsubscribeUser();
            unsubscribeUser = null;
          }
        }
      } catch (authError) {
        console.error('Auth state change error:', authError);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return t.userNotFound;
      case 'auth/wrong-password':
        return t.wrongPassword;
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return t.tooManyRequests;
      case 'auth/network-request-failed':
        return t.networkError;
      case 'auth/invalid-credential':
        return t.invalidCredentials;
      default:
        return t.invalidCredentials;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate role selection
      if (!selectedRole) {
        throw new Error('Please select your role before logging in.');
      }

      // Prepare email
      const email = loginMethod === 'phone' 
        ? formData.phone ? `${formData.phone}@marketchain.local` : ''
        : formData.email;

      // Use the new auth service for role-based login
      const result = await loginWithRoleValidation({
        email,
        password: formData.password,
        expectedRole: selectedRole as 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin'
      });

      if (result.success) {
        console.log('Login successful, redirecting to:', result.redirectTo);
        // Let the auth state listener handle the redirect to prevent double navigation
        // The Firebase auth listener will automatically redirect based on user role
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setFormData({ ...formData, phone: '9876543210' });
      setIsListening(false);
    }, 2000);
  };

  const selectedRoleData = roles.find(role => role.value === userRole || role.value === selectedRole);

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5DAE49] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF3E0] to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-[#5DAE49] to-[#FFC947] p-3 rounded-xl">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0D1B2A]">MarketChain</h1>
                <p className="text-sm text-gray-600">{t.tagline}</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[#0D1B2A] mb-2">{t.welcome}</h2>
          </div>

          {/* Role Selection (shown if no user, or for selection) */}
          {!userRole && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.selectRole}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent mb-4"
                required
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              
              {/* Role Cards for Visual Reference */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {roles.map((role) => (
                  <div
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      selectedRole === role.value
                        ? `${role.color} text-white border-transparent`
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#5DAE49]'
                    }`}
                  >
                    <role.icon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{role.label}</div>
                  </div>
                ))}
              </div>

              {/* Role Helper Component */}
              <RoleHelper 
                selectedRole={selectedRole} 
                onRoleChange={setSelectedRole} 
              />
              
              {/* New User Notice */}
              {selectedRole && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        First time here?
                      </h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        If you don't have an account yet, you need to register first.
                      </p>
                      <button
                        onClick={() => {
                          const roleRoute = selectedRole === 'vehicle_owner' ? 'vehicle' : selectedRole;
                          navigate(`/join-${roleRoute}`);
                        }}
                        className="inline-flex items-center px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-medium rounded hover:bg-yellow-500 transition-colors"
                      >
                        Register as {roles.find(r => r.value === selectedRole)?.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login Method Toggle - Only show for admin or when admin is selected */}
          {(userRole === 'admin' || selectedRole === 'admin') && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#0D1B2A] shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#0D1B2A] shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <span className="text-sm mr-2">📱</span>
                Phone
              </button>
            </div>
          )}

          {/* Firebase Status */}
          

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginMethod === 'phone' ? (
              <>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phoneNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent pr-12"
                      placeholder={t.enterPhone}
                      maxLength={10}
                      required
                    />
                    <button
                      type="button"
                      onClick={simulateVoiceInput}
                      className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-gray-400 hover:text-[#5DAE49]'
                      }`}
                      title={t.voiceInput}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.phoneTooltip}</p>
                </div>

                {/* Password for Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent pr-12"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent"
                    placeholder="admin@marketchain.in"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DAE49] focus:border-transparent pr-12"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-[#5DAE49] focus:ring-[#5DAE49]" />
                    <span className="ml-2 text-sm text-gray-600">{t.rememberMe}</span>
                  </label>
                  <button type="button" className="text-sm text-[#5DAE49] hover:underline">
                    {t.forgotPassword}
                  </button>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Security Features */}
            <SecurityFeatures onOTPAttempt={() => {}} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!userRole && !selectedRole)}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                selectedRoleData?.color || 'bg-[#5DAE49]'
              } hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                !userRole && !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.login}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t.newUser}{' '}
              <button 
                onClick={() => {
                  const roleRoute = selectedRole === 'vehicle_owner' ? 'vehicle' : (selectedRole || userRole || 'retailer');
                  navigate(`/join-${roleRoute}`);
                }}
                className="text-[#5DAE49] hover:underline font-medium"
              >
                {t.signUp}
              </button>
            </p>
            
            {/* Role-specific registration guidance */}
            {selectedRole && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  {selectedRole === 'vehicle_owner' && (
                    <>
                      <strong>New Vehicle Owner?</strong> Click "Sign up" above to register your vehicle and start earning with delivery routes.
                    </>
                  )}
                  {selectedRole === 'retailer' && (
                    <>
                      <strong>New Retailer?</strong> Click "Sign up" above to register your shop and access wholesale products.
                    </>
                  )}
                  {selectedRole === 'wholesaler' && (
                    <>
                      <strong>New Wholesaler?</strong> Click "Sign up" above to register your business and connect with retailers.
                    </>
                  )}
                  {selectedRole === 'admin' && (
                    <>
                      <strong>Admin Access:</strong> Contact system administrator for account setup.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* reCAPTCHA container for Firebase */}
          <div id="recaptcha-container"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;