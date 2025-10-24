import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

/**
 * Utility function to add phone numbers to existing users
 * This is a one-time fix for users who don't have phone numbers in their profiles
 */
export const addPhoneNumbersToUsers = async () => {
  try {
    console.log('🔧 Starting to add phone numbers to existing users...');
    
    // Get all users
    const usersRef = ref(realtimeDb, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No users found in database');
      return;
    }
    
    const users = snapshot.val();
    const updates: { [key: string]: any } = {};
    
    // Sample phone numbers for different roles
    const samplePhones = {
      retailer: ['+919876543210', '+919876543211', '+919876543212', '+919876543213'],
      wholesaler: ['+919876543220', '+919876543221', '+919876543222', '+919876543223'],
      vehicle_owner: ['+919876543230', '+919876543231', '+919876543232', '+919876543233'],
      admin: ['+919876543240', '+919876543241']
    };
    
    let phoneIndex = {
      retailer: 0,
      wholesaler: 0,
      vehicle_owner: 0,
      admin: 0
    };
    
    // Process each user
    for (const [userId, userData] of Object.entries(users)) {
      const user = userData as any;
      
      // Skip if user already has a phone number
      if (user.phoneNumber || user.phone) {
        console.log(`✅ User ${userId} already has phone number: ${user.phoneNumber || user.phone}`);
        continue;
      }
      
      // Assign phone number based on role
      const role = user.role as keyof typeof samplePhones;
      if (role && samplePhones[role]) {
        const phoneArray = samplePhones[role];
        const phone = phoneArray[phoneIndex[role] % phoneArray.length];
        phoneIndex[role]++;
        
        // Update user with phone number
        updates[`users/${userId}/phoneNumber`] = phone;
        console.log(`📞 Adding phone ${phone} to ${role} user: ${user.fullName || user.name || userId}`);
      } else {
        // Default phone for unknown roles
        updates[`users/${userId}/phoneNumber`] = '+919876543299';
        console.log(`📞 Adding default phone to user: ${user.fullName || user.name || userId}`);
      }
    }
    
    // Apply all updates
    if (Object.keys(updates).length > 0) {
      await Promise.all(
        Object.entries(updates).map(([path, value]) => 
          set(ref(realtimeDb, path), value)
        )
      );
      
      console.log(`✅ Successfully added phone numbers to ${Object.keys(updates).length} users`);
      alert(`Phone numbers added to ${Object.keys(updates).length} users. Please refresh the page.`);
    } else {
      console.log('ℹ️ All users already have phone numbers');
      alert('All users already have phone numbers!');
    }
    
  } catch (error) {
    console.error('❌ Error adding phone numbers:', error);
    alert('Error adding phone numbers. Check console for details.');
  }
};

/**
 * Function to check current phone number status of all users
 */
export const checkUserPhoneNumbers = async () => {
  try {
    console.log('🔍 Checking phone number status of all users...');
    
    const usersRef = ref(realtimeDb, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No users found in database');
      return;
    }
    
    const users = snapshot.val();
    const report: { [role: string]: { withPhone: number; withoutPhone: number; users: string[] } } = {};
    
    for (const [userId, userData] of Object.entries(users)) {
      const user = userData as any;
      const role = user.role || 'unknown';
      const hasPhone = !!(user.phoneNumber || user.phone);
      const userName = user.fullName || user.name || userId;
      
      if (!report[role]) {
        report[role] = { withPhone: 0, withoutPhone: 0, users: [] };
      }
      
      if (hasPhone) {
        report[role].withPhone++;
        report[role].users.push(`✅ ${userName}: ${user.phoneNumber || user.phone}`);
      } else {
        report[role].withoutPhone++;
        report[role].users.push(`❌ ${userName}: NO PHONE`);
      }
    }
    
    console.log('📊 Phone Number Report:');
    for (const [role, data] of Object.entries(report)) {
      console.log(`\n🏷️ ${role.toUpperCase()}:`);
      console.log(`   With Phone: ${data.withPhone}`);
      console.log(`   Without Phone: ${data.withoutPhone}`);
      console.log(`   Users:`);
      data.users.forEach(user => console.log(`     ${user}`));
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Error checking phone numbers:', error);
  }
};