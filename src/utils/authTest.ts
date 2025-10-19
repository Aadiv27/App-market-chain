// Authentication Test Utility
// This file helps test the authentication flow

export const testCredentials = {
  retailer: {
    email: 'retailer123@gmail.com',
    password: '123456',
    role: 'retailer'
  },
  wholesaler: {
    email: 'wholesaler123@gmail.com', 
    password: '123456',
    role: 'wholesaler'
  },
  vehicle_owner: {
    email: 'vehical123@gmail.com',
    password: '123456', 
    role: 'vehicle_owner'
  },
  admin: {
    email: 'admin123@gmail.com',
    password: '123456',
    role: 'admin'
  }
};

export const mockOTP = '123456';

export const expectedRoutes = {
  retailer: '/retailer-dashboard',
  wholesaler: '/wholesaler-dashboard',
  vehicle_owner: '/vehicle-dashboard', 
  admin: '/admin-dashboard'
};

// Test function to validate authentication flow
export const testAuthFlow = (userType: keyof typeof testCredentials) => {
  const credentials = testCredentials[userType];
  const expectedRoute = expectedRoutes[userType];
  
  console.log(`🧪 Testing ${userType} authentication:`);
  console.log(`📧 Email: ${credentials.email}`);
  console.log(`🔑 Password: ${credentials.password}`);
  console.log(`👤 Role: ${credentials.role}`);
  console.log(`🎯 Expected Route: ${expectedRoute}`);
  
  return {
    credentials,
    expectedRoute,
    instructions: [
      `1. Go to login page`,
      `2. Select role: ${credentials.role}`,
      `3. Enter email: ${credentials.email}`,
      `4. Enter password: ${credentials.password}`,
      `5. Click Login`,
      `6. Should redirect to: ${expectedRoute}`
    ]
  };
};

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuthFlow;
  (window as any).testCredentials = testCredentials;
  console.log('🧪 Auth test utilities loaded. Use window.testAuth("retailer") to get test instructions.');
}