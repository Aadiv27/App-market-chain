import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, realtimeDb } from '../components/lib/Firebase';
import { getUserData } from './userService';

export interface LoginCredentials {
  email: string;
  password: string;
  expectedRole: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
}

export interface LoginResult {
  success: boolean;
  user?: any;
  userData?: any;
  error?: string;
  redirectTo?: string;
}

/**
 * Role-based login function that validates user role against expected role
 */
export const loginWithRoleValidation = async (credentials: LoginCredentials): Promise<LoginResult> => {
  try {
    const { email, password, expectedRole } = credentials;

    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: 'Please fill in all required fields.'
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email address.'
      };
    }

    console.log(`Attempting login for ${expectedRole} with email:`, email);

    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Firebase authentication successful:', user.uid);

    // Get user data from database
    const userData = await getUserData(user.uid);

    if (!userData) {
      // Sign out the user since they don't have profile data
      await signOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact support or sign up again.'
      };
    }

    console.log('User data retrieved:', userData);

    // Validate role matches expected role
    if (userData.role !== expectedRole) {
      // Sign out the user since role doesn't match
      await signOut(auth);
      
      const roleLabels = {
        retailer: 'Retailer',
        wholesaler: 'Wholesaler',
        vehicle_owner: 'Vehicle Owner',
        admin: 'Admin'
      };

      const actualRoleLabel = roleLabels[userData.role as keyof typeof roleLabels] || userData.role;
      const expectedRoleLabel = roleLabels[expectedRole];

      return {
        success: false,
        error: `This account is registered as a ${actualRoleLabel}. You are trying to login as ${expectedRoleLabel}. Please use the correct login page for your account type.`
      };
    }

    // Check if user is active
    if (!userData.isActive) {
      await signOut(auth);
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact support.'
      };
    }

    // Determine redirect route
    const roleRoutes = {
      retailer: '/retailer-dashboard',
      wholesaler: '/wholesaler-dashboard',
      vehicle_owner: '/vehicle-dashboard',
      admin: '/admin-dashboard'
    };

    const redirectTo = roleRoutes[userData.role as keyof typeof roleRoutes] || '/admin-dashboard';

    console.log('Role validation successful, redirecting to:', redirectTo);

    return {
      success: true,
      user,
      userData,
      redirectTo
    };

  } catch (error: any) {
    console.error('Login error:', error);

    // Handle Firebase Auth errors
    let errorMessage = 'Login failed. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password. Please try again.';
        break;
      default:
        errorMessage = error.message || 'Login failed. Please try again.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get user role by email (for role suggestion)
 */
export const getUserRoleByEmail = async (email: string): Promise<string | null> => {
  try {
    // This is a helper function to suggest the correct role
    // We'll need to implement a reverse lookup or store email->uid mapping
    // For now, we'll return null and let the user select the role
    return null;
  } catch (error) {
    console.error('Error getting user role by email:', error);
    return null;
  }
};

/**
 * Logout function
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};