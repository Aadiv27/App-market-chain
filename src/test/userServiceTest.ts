// Test file to verify userService functionality
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../components/lib/Firebase';
import { createUserInDatabase, getUserData, RetailerData, WholesalerData, VehicleOwnerData, AdminData } from '../services/userService';

// Test function to create different types of users
export const testUserCreation = async () => {
  try {
    console.log('Testing user creation with dynamic data...');

    // Test Retailer Creation
    const testRetailerData: Partial<RetailerData> = {
      phoneNumber: '+91-9876543210',
      fullName: 'Test Retailer',
      role: 'retailer',
      shopName: 'Test Shop',
      address: '123 Test Street, Test City',
      pincode: '123456',
      gstNumber: 'GST123456789'
    };

    // Test Wholesaler Creation
    const testWholesalerData: Partial<WholesalerData> = {
      phoneNumber: '+91-9876543211',
      fullName: 'Test Wholesaler',
      role: 'wholesaler',
      shopName: 'Test Wholesale Store',
      shopLocation: 'Test Market',
      address: '456 Test Avenue, Test City',
      pincode: '123457',
      gstNumber: 'GST987654321',
      businessType: 'Electronics'
    };

    // Test Vehicle Owner Creation
    const testVehicleOwnerData: Partial<VehicleOwnerData> = {
      phoneNumber: '+91-9876543212',
      fullName: 'Test Vehicle Owner',
      role: 'vehicle_owner',
      vehicleType: 'Truck',
      vehicleNumber: 'TN01AB1234',
      capacity: '10 tons',
      licenseNumber: 'DL123456789',
      rcNumber: 'RC123456789',
      insuranceNumber: 'INS123456789',
      bankAccount: '1234567890',
      ifscCode: 'BANK0001234',
      isAvailable: true
    };

    // Test Admin Creation
    const testAdminData: Partial<AdminData> = {
      phoneNumber: '+91-9876543213',
      fullName: 'Test Admin',
      role: 'admin',
      department: 'Operations',
      employeeId: 'EMP001',
      adminLevel: 'standard',
      permissions: ['read', 'write', 'manage_users']
    };

    console.log('Test data structures created successfully!');
    console.log('Retailer Data:', testRetailerData);
    console.log('Wholesaler Data:', testWholesalerData);
    console.log('Vehicle Owner Data:', testVehicleOwnerData);
    console.log('Admin Data:', testAdminData);

    return {
      retailer: testRetailerData,
      wholesaler: testWholesalerData,
      vehicleOwner: testVehicleOwnerData,
      admin: testAdminData
    };

  } catch (error) {
    console.error('Error in test user creation:', error);
    throw error;
  }
};

// Function to verify database structure
export const verifyDatabaseStructure = () => {
  console.log('Expected Database Structure:');
  console.log(`
  Firebase Realtime Database Structure:
  
  users/
    {uid}/
      - uid: string
      - email: string
      - phoneNumber: string
      - fullName: string
      - role: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin'
      - createdAt: number
      - isActive: boolean
      - isVerified: boolean
      - [role-specific fields...]

  retailers/
    {uid}/ - Copy of retailer users for easy querying

  wholesalers/
    {uid}/ - Copy of wholesaler users

  vehicle_owners/
    {uid}/ - Copy of vehicle owner users

  admins/
    {uid}/ - Copy of admin users

  userIndex/
    {uid}/
      - role: string
      - email: string
      - fullName: string
      - isActive: boolean
      - createdAt: number
  `);
};

// Export test functions
export default {
  testUserCreation,
  verifyDatabaseStructure
};