export interface User {
  id: string;
  name: string;
  role: 'retailer' | 'wholesaler' | 'vehicle_owner' | 'admin';
  rating: number;
  verified: boolean;
  badges: string[];
  xp: number;
  level: number;
  phone: string;
  region: string;
  avatar?: string;
}

export interface Order {
  id: string;
  retailerId: string;
  wholesalerId: string;
  vehicleOwnerId?: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  total: number;
  createdAt: string;
  deliveryAddress: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  type: string;
  capacity: number;
  currentLocation: string;
  status: 'available' | 'assigned' | 'in_transit';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ReturnItem {
  id: string;
  orderId: string;
  reason: string;
  status: 'pending_pickup' | 'picked_up' | 'processed';
  scheduledPickup: string;
}