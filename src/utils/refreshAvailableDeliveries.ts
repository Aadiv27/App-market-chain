import { ref, get, set, remove } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

/**
 * Utility function to refresh existing available deliveries with correct phone numbers
 * This fixes deliveries that were created before phone numbers were added to users
 */
export const refreshAvailableDeliveries = async () => {
  try {
    console.log('🔄 Starting to refresh available deliveries with phone numbers...');
    
    // Get all available deliveries
    const deliveriesRef = ref(realtimeDb, 'availableDeliveries');
    const deliveriesSnapshot = await get(deliveriesRef);
    
    if (!deliveriesSnapshot.exists()) {
      console.log('❌ No available deliveries found');
      return;
    }
    
    const deliveries = deliveriesSnapshot.val();
    
    // Get all users to lookup phone numbers
    const usersRef = ref(realtimeDb, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      console.log('❌ No users found in database');
      return;
    }
    
    const users = usersSnapshot.val();
    
    // Create a lookup map for users by name (since we're using names as IDs in deliveries)
    const usersByName: { [name: string]: any } = {};
    Object.values(users).forEach((user: any) => {
      const fullName = user.fullName || user.name;
      if (fullName) {
        usersByName[fullName] = user;
      }
    });
    
    let updatedCount = 0;
    
    // Process each delivery
    for (const [deliveryId, delivery] of Object.entries(deliveries)) {
      const deliveryData = delivery as any;
      let needsUpdate = false;
      const updatedDelivery = { ...deliveryData };
      
      // Update wholesaler phone if missing
      if (!deliveryData.wholesaler?.phone || deliveryData.wholesaler.phone === 'Phone not available') {
        const wholesalerName = deliveryData.wholesaler?.name;
        const wholesalerUser = usersByName[wholesalerName];
        
        if (wholesalerUser) {
          const phone = wholesalerUser.phoneNumber || 
                       wholesalerUser.phone || 
                       wholesalerUser.mobileNumber || 
                       wholesalerUser.mobile || '';
          
          if (phone) {
            updatedDelivery.wholesaler.phone = phone;
            needsUpdate = true;
            console.log(`📞 Updated wholesaler phone for ${wholesalerName}: ${phone}`);
          }
        }
      }
      
      // Update retailer phone if missing
      if (!deliveryData.retailer?.phone || deliveryData.retailer.phone === 'Phone not available') {
        const retailerName = deliveryData.retailer?.name;
        const retailerUser = usersByName[retailerName];
        
        if (retailerUser) {
          const phone = retailerUser.phoneNumber || 
                       retailerUser.phone || 
                       retailerUser.mobileNumber || 
                       retailerUser.mobile || '';
          
          if (phone) {
            updatedDelivery.retailer.phone = phone;
            needsUpdate = true;
            console.log(`📞 Updated retailer phone for ${retailerName}: ${phone}`);
          }
        }
      }
      
      // Save updated delivery if changes were made
      if (needsUpdate) {
        await set(ref(realtimeDb, `availableDeliveries/${deliveryId}`), updatedDelivery);
        updatedCount++;
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} available deliveries with phone numbers`);
    alert(`Updated ${updatedCount} available deliveries with phone numbers. Please refresh the page.`);
    
  } catch (error) {
    console.error('❌ Error refreshing available deliveries:', error);
    alert('Error refreshing deliveries. Check console for details.');
  }
};

/**
 * Function to clear all existing available deliveries
 * Use this if you want to start fresh
 */
export const clearAvailableDeliveries = async () => {
  try {
    console.log('🗑️ Clearing all available deliveries...');
    
    const deliveriesRef = ref(realtimeDb, 'availableDeliveries');
    await remove(deliveriesRef);
    
    console.log('✅ All available deliveries cleared');
    alert('All available deliveries cleared. Create new orders to generate fresh deliveries.');
    
  } catch (error) {
    console.error('❌ Error clearing available deliveries:', error);
    alert('Error clearing deliveries. Check console for details.');
  }
};