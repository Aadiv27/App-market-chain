import { ref, push, set, get } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

export interface DeliveryNotification {
  orderId: string;
  retailerShopName: string;
  retailerAddress: string;
  retailerPhone?: string;
  wholesalerShopName: string;
  wholesalerAddress: string;
  wholesalerPhone?: string;
  distance: number;
  deliveryAmount: number;
  estimatedDuration: string;
  pickupTime: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'delivery_assignment' | 'order_packed' | 'general';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

export class NotificationService {
  /**
   * Send delivery assignment notification to vehicle owner
   */
  static async sendDeliveryAssignment(
    vehicleOwnerId: string,
    deliveryInfo: DeliveryNotification
  ): Promise<void> {
    try {
      // Create in-app notification
      const notificationData: Omit<NotificationData, 'id'> = {
        userId: vehicleOwnerId,
        type: 'delivery_assignment',
        title: 'New Delivery Assignment',
        message: `Pickup from ${deliveryInfo.wholesalerShopName} to deliver to ${deliveryInfo.retailerShopName}`,
        data: deliveryInfo,
        timestamp: Date.now(),
        read: false
      };

      // Save to Firebase
      const notificationsRef = ref(realtimeDb, `notifications/${vehicleOwnerId}`);
      await push(notificationsRef, notificationData);

      // Also save to general notifications for admin tracking
      const adminNotificationsRef = ref(realtimeDb, 'notifications/admin');
      await push(adminNotificationsRef, {
        ...notificationData,
        title: 'Delivery Assignment Sent',
        message: `Delivery assigned to vehicle owner for order ${deliveryInfo.orderId}`
      });

      // Send SMS notification (if phone number is available)
      await this.sendSMSNotification(deliveryInfo);

      console.log('Delivery assignment notification sent successfully');
    } catch (error) {
      console.error('Error sending delivery assignment notification:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification using Twilio (mock implementation)
   */
  private static async sendSMSNotification(deliveryInfo: DeliveryNotification): Promise<void> {
    try {
      // This would integrate with your existing Twilio service
      const smsMessage = this.formatSMSMessage(deliveryInfo);
      
      // For now, we'll log the SMS message
      console.log('SMS Notification would be sent:', smsMessage);
      
      // TODO: Integrate with actual Twilio service
      // await twilioService.sendSMS(vehicleOwnerPhone, smsMessage);
      
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      // Don't throw error for SMS failures, as in-app notification is primary
    }
  }

  /**
   * Format SMS message for delivery assignment
   */
  private static formatSMSMessage(deliveryInfo: DeliveryNotification): string {
    return `🚚 NEW DELIVERY ASSIGNMENT
Order: ${deliveryInfo.orderId}

📍 PICKUP:
${deliveryInfo.wholesalerShopName}
${deliveryInfo.wholesalerAddress}
${deliveryInfo.wholesalerPhone ? `📞 ${deliveryInfo.wholesalerPhone}` : ''}

📍 DELIVERY:
${deliveryInfo.retailerShopName}
${deliveryInfo.retailerAddress}
${deliveryInfo.retailerPhone ? `📞 ${deliveryInfo.retailerPhone}` : ''}

📏 Distance: ${deliveryInfo.distance} km
💰 Payment: ₹${deliveryInfo.deliveryAmount}
⏱️ Est. Time: ${deliveryInfo.estimatedDuration}

Please confirm pickup by ${deliveryInfo.pickupTime}`;
  }

  /**
   * Create activity log entry
   */
  static async logActivity(
    userId: string,
    userRole: string,
    userName: string,
    action: string,
    details?: string
  ): Promise<void> {
    try {
      const activityRef = ref(realtimeDb, `activityLogs/${userId}`);
      await push(activityRef, {
        userId,
        userRole,
        userName,
        action,
        details,
        timestamp: Date.now(),
        type: 'order'
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Update order status in database
   */
  static async updateOrderStatus(
    wholesalerId: string,
    orderId: string,
    status: string,
    additionalData?: any
  ): Promise<void> {
    try {
      const orderRef = ref(realtimeDb, `orders/wholesaler/${wholesalerId}/${orderId}`);
      await set(orderRef, {
        ...additionalData,
        status,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get available vehicle owners for delivery assignment
   */
  static async getAvailableVehicleOwners(): Promise<any[]> {
    try {
      // This would query the database for available vehicle owners
      // For now, return a mock list
      return [
        {
          id: 'vehicle_1',
          name: 'Raj Kumar',
          phone: '+91-9876543210',
          vehicleType: 'Truck',
          isAvailable: true,
          currentLocation: 'Delhi'
        },
        {
          id: 'vehicle_2', 
          name: 'Suresh Singh',
          phone: '+91-9876543211',
          vehicleType: 'Van',
          isAvailable: true,
          currentLocation: 'Gurgaon'
        }
      ];
    } catch (error) {
      console.error('Error fetching vehicle owners:', error);
      return [];
    }
  }

  /**
   * Notify all vehicle owners about a new delivery opportunity
   */
  static async notifyVehicleOwners(deliveryInfo: {
    orderId: string;
    retailer: {
      name: string;
      shopName: string;
      address: string;
      phone: string;
      email?: string;
    };
    wholesaler: {
      name: string;
      shopName: string;
      address: string;
      phone: string;
    };
    distance: number;
    deliveryCost: number;
    orderAmount: number;
    items?: string;
  }): Promise<void> {
    try {
      // First, create the available delivery record for vehicle dashboard
      const availableDeliveryId = `delivery_${deliveryInfo.orderId}_${Date.now()}`;
      const availableDelivery = {
        id: availableDeliveryId,
        orderId: deliveryInfo.orderId,
        wholesaler: {
          id: deliveryInfo.wholesaler.name, // Using name as ID for now
          name: deliveryInfo.wholesaler.name,
          shopName: deliveryInfo.wholesaler.shopName,
          address: deliveryInfo.wholesaler.address,
          phone: deliveryInfo.wholesaler.phone
        },
        retailer: {
          id: deliveryInfo.retailer.name, // Using name as ID for now
          name: deliveryInfo.retailer.name,
          shopName: deliveryInfo.retailer.shopName,
          address: deliveryInfo.retailer.address,
          phone: deliveryInfo.retailer.phone
        },
        items: deliveryInfo.items || 'Various items',
        amount: deliveryInfo.orderAmount,
        distance: deliveryInfo.distance,
        deliveryCost: deliveryInfo.deliveryCost,
        packedAt: Date.now(),
        status: 'available'
      };

      // Save to availableDeliveries collection
      await set(ref(realtimeDb, `availableDeliveries/${availableDeliveryId}`), availableDelivery);
      console.log(`✅ Created available delivery record: ${availableDeliveryId}`);

      // Get all vehicle owners from the database
      const vehicleOwnersRef = ref(realtimeDb, 'users');
      const snapshot = await get(vehicleOwnersRef);
      
      if (!snapshot.exists()) {
        console.log('No users found in database');
        return;
      }

      const users = snapshot.val();
      const vehicleOwners = Object.entries(users)
        .filter(([_, user]: [string, any]) => user.role === 'vehicle_owner')
        .map(([id, user]: [string, any]) => ({ id, ...user }));

      if (vehicleOwners.length === 0) {
        console.log('No vehicle owners found');
        return;
      }

      // Create notification for each vehicle owner
      const notificationPromises = vehicleOwners.map(async (vehicleOwner: any) => {
        const notificationId = push(ref(realtimeDb, `notifications/${vehicleOwner.id}`)).key;
        
        const notification = {
          id: notificationId,
          type: 'delivery_opportunity',
          title: '🚚 New Delivery Opportunity',
          message: `Order #${deliveryInfo.orderId} ready for pickup`,
          timestamp: Date.now(),
          read: false,
          orderId: deliveryInfo.orderId,
          deliveryDetails: {
            pickup: {
              name: deliveryInfo.wholesaler.name,
              shopName: deliveryInfo.wholesaler.shopName,
              address: deliveryInfo.wholesaler.address,
              phone: deliveryInfo.wholesaler.phone
            },
            delivery: {
              name: deliveryInfo.retailer.name,
              shopName: deliveryInfo.retailer.shopName,
              address: deliveryInfo.retailer.address,
              phone: deliveryInfo.retailer.phone,
              email: deliveryInfo.retailer.email || ''
            },
            distance: deliveryInfo.distance,
            deliveryCost: deliveryInfo.deliveryCost,
            orderAmount: deliveryInfo.orderAmount,
            items: deliveryInfo.items || 'Various items',
            estimatedDuration: Math.ceil(deliveryInfo.distance / 30) + ' hours' // Assuming 30 km/h average speed
          }
        };

        // Save notification to database
        await set(ref(realtimeDb, `notifications/${vehicleOwner.id}/${notificationId}`), notification);

        // Send SMS notification (mock for now)
        const smsMessage = `🚚 NEW DELIVERY OPPORTUNITY
Order: #${deliveryInfo.orderId}

📍 PICKUP:
${deliveryInfo.wholesaler.shopName}
${deliveryInfo.wholesaler.address}
📞 ${deliveryInfo.wholesaler.phone}

📍 DELIVERY:
${deliveryInfo.retailer.shopName}
${deliveryInfo.retailer.address}
📞 ${deliveryInfo.retailer.phone}

📏 Distance: ${deliveryInfo.distance} km
💰 Delivery Fee: ₹${deliveryInfo.deliveryCost}
📦 Order Value: ₹${deliveryInfo.orderAmount}

Login to accept this delivery!`;

        console.log(`SMS would be sent to ${vehicleOwner.phone}:`, smsMessage);
        
        // TODO: Integrate with actual SMS service
        // await smsService.send(vehicleOwner.phone, smsMessage);
      });

      await Promise.all(notificationPromises);

      // Log activity
      await this.logActivity(
        deliveryInfo.wholesaler.name,
        'wholesaler',
        deliveryInfo.wholesaler.name,
        `Notified vehicle owners about order #${deliveryInfo.orderId}`,
        `Distance: ${deliveryInfo.distance}km, Fee: ₹${deliveryInfo.deliveryCost}`
      );

      console.log(`Successfully notified ${vehicleOwners.length} vehicle owners about order #${deliveryInfo.orderId}`);
      
    } catch (error) {
      console.error('Error notifying vehicle owners:', error);
      throw error;
    }
  }
}