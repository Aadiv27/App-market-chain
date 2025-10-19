export interface User {
  id: string;
  uid?: string; // Add uid for Firebase compatibility
  name: string;
  email?: string;
  phone: string;
  roles: UserRole[];
  activeRole: UserRole;
  role?: string; // Add direct role property for compatibility
  kycStatus: 'pending' | 'verified' | 'rejected';
  region: string;
  language: 'english' | 'hindi' | 'bengali' | 'tamil';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  loginHistory: LoginHistory[];
}

export interface UserRole {
  type: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
  verified: boolean;
  data?: RetailerData | WholesalerData | VehicleOwnerData | AdminData;
}

export interface RetailerData {
  shopName: string;
  landmark: string;
  gstNumber?: string;
}

export interface WholesalerData {
  businessName: string;
  gstin: string;
  businessAddress: string;
}

export interface VehicleOwnerData {
  licenseNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  capacity: number;
  rcNumber: string;
  insuranceNumber: string;
}

export interface AdminData {
  department: string;
  permissions: string[];
}

export interface LoginHistory {
  timestamp: string;
  role: string;
  device: string;
  location: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface OTPRequest {
  phone: string;
  otp: string;
  attempts: number;
  expiresAt: string;
}