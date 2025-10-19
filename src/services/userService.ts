import { ref, set, get, child } from 'firebase/database';
import { User } from 'firebase/auth';
import { realtimeDb } from '../components/lib/Firebase';
import { WholesalerDataService } from './wholesalerDataService';

export interface BaseUserData {
  uid: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
  createdAt: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface RetailerData extends BaseUserData {
  role: 'retailer';
  shopName: string;
  address: string;
  pincode: string;
  gstNumber?: string;
}

export interface WholesalerData extends BaseUserData {
  role: 'wholesaler';
  shopName: string;
  shopLocation: string;
  address: string;
  pincode: string;
  gstNumber?: string;
  businessType?: string;
}

export interface VehicleOwnerData extends BaseUserData {
  role: 'vehicle_owner';
  vehicleType: string;
  vehicleNumber: string;
  capacity: string;
  licenseNumber: string;
  rcNumber?: string;
  insuranceNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  isAvailable: boolean;
}

export interface AdminData extends BaseUserData {
  role: 'admin';
  department: string;
  employeeId: string;
  adminLevel: 'standard' | 'super' | 'master';
  permissions: string[];
}

export type UserData = RetailerData | WholesalerData | VehicleOwnerData | AdminData;

/**
 * Create a new user in the database with proper structure
 */
export const createUserInDatabase = async (
  user: User,
  userData: Partial<UserData>
): Promise<void> => {
  try {
    const baseData: BaseUserData = {
      uid: user.uid,
      email: user.email || '',
      phoneNumber: userData.phoneNumber || '',
      fullName: userData.fullName || '',
      role: userData.role || 'retailer',
      createdAt: Date.now(),
      isActive: true,
      isVerified: false
    };

    // Merge base data with specific user type data
    const completeUserData = { ...baseData, ...userData };

    // Store in main users collection
    await set(ref(realtimeDb, `users/${user.uid}`), completeUserData);

    // Store in role-specific collection for easier querying
    await set(ref(realtimeDb, `${userData.role}s/${user.uid}`), completeUserData);

    // Store in user index for quick lookups
    await set(ref(realtimeDb, `userIndex/${user.uid}`), {
      role: userData.role,
      email: user.email,
      fullName: userData.fullName,
      isActive: true,
      createdAt: Date.now()
    });

    // Initialize personalized dataset for wholesalers
    if (userData.role === 'wholesaler') {
      await WholesalerDataService.initializeWholesalerData(user.uid, completeUserData);
      console.log(`Wholesaler dataset initialized for user: ${user.uid}`);
    }

    console.log(`User ${user.uid} created successfully with role: ${userData.role}`);
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

/**
 * Get user data by UID
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const snapshot = await get(child(ref(realtimeDb), `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update user verification status
 */
export const updateUserVerification = async (
  uid: string,
  isVerified: boolean
): Promise<void> => {
  try {
    await set(ref(realtimeDb, `users/${uid}/isVerified`), isVerified);
    
    // Also update in role-specific collection
    const userData = await getUserData(uid);
    if (userData) {
      await set(ref(realtimeDb, `${userData.role}s/${uid}/isVerified`), isVerified);
    }
  } catch (error) {
    console.error('Error updating user verification:', error);
    throw error;
  }
};

/**
 * Get all users by role
 */
export const getUsersByRole = async (role: string): Promise<UserData[]> => {
  try {
    const snapshot = await get(child(ref(realtimeDb), `${role}s`));
    if (snapshot.exists()) {
      const users = snapshot.val();
      return Object.values(users) as UserData[];
    }
    return [];
  } catch (error) {
    console.error(`Error getting ${role}s:`, error);
    throw error;
  }
};

/**
 * Update user active status
 */
export const updateUserActiveStatus = async (
  uid: string,
  isActive: boolean
): Promise<void> => {
  try {
    await set(ref(realtimeDb, `users/${uid}/isActive`), isActive);
    await set(ref(realtimeDb, `userIndex/${uid}/isActive`), isActive);
    
    // Also update in role-specific collection
    const userData = await getUserData(uid);
    if (userData) {
      await set(ref(realtimeDb, `${userData.role}s/${uid}/isActive`), isActive);
    }
  } catch (error) {
    console.error('Error updating user active status:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<{
  total: number;
  retailers: number;
  wholesalers: number;
  vehicleOwners: number;
  admins: number;
  verified: number;
  active: number;
}> => {
  try {
    const snapshot = await get(child(ref(realtimeDb), 'userIndex'));
    if (!snapshot.exists()) {
      return {
        total: 0,
        retailers: 0,
        wholesalers: 0,
        vehicleOwners: 0,
        admins: 0,
        verified: 0,
        active: 0
      };
    }

    const users = Object.values(snapshot.val()) as any[];
    
    return {
      total: users.length,
      retailers: users.filter(u => u.role === 'retailer').length,
      wholesalers: users.filter(u => u.role === 'wholesaler').length,
      vehicleOwners: users.filter(u => u.role === 'vehicle_owner').length,
      admins: users.filter(u => u.role === 'admin').length,
      verified: users.filter(u => u.isVerified).length,
      active: users.filter(u => u.isActive).length
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};