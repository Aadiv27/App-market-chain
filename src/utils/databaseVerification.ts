// Database verification utility
import { ref, get, child } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(child(dbRef, '/'));
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export const checkUserCollections = async (): Promise<{
  users: number;
  retailers: number;
  wholesalers: number;
  vehicleOwners: number;
  admins: number;
  userIndex: number;
}> => {
  try {
    const dbRef = ref(realtimeDb);
    
    const usersSnapshot = await get(child(dbRef, 'users'));
    const retailersSnapshot = await get(child(dbRef, 'retailers'));
    const wholesalersSnapshot = await get(child(dbRef, 'wholesalers'));
    const vehicleOwnersSnapshot = await get(child(dbRef, 'vehicle_owners'));
    const adminsSnapshot = await get(child(dbRef, 'admins'));
    const userIndexSnapshot = await get(child(dbRef, 'userIndex'));

    const counts = {
      users: usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0,
      retailers: retailersSnapshot.exists() ? Object.keys(retailersSnapshot.val()).length : 0,
      wholesalers: wholesalersSnapshot.exists() ? Object.keys(wholesalersSnapshot.val()).length : 0,
      vehicleOwners: vehicleOwnersSnapshot.exists() ? Object.keys(vehicleOwnersSnapshot.val()).length : 0,
      admins: adminsSnapshot.exists() ? Object.keys(adminsSnapshot.val()).length : 0,
      userIndex: userIndexSnapshot.exists() ? Object.keys(userIndexSnapshot.val()).length : 0
    };

    console.log('Database Collections Count:', counts);
    return counts;
  } catch (error) {
    console.error('Error checking user collections:', error);
    return {
      users: 0,
      retailers: 0,
      wholesalers: 0,
      vehicleOwners: 0,
      admins: 0,
      userIndex: 0
    };
  }
};

export const sampleUserData = async (uid: string): Promise<any> => {
  try {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('Sample User Data:', userData);
      return userData;
    } else {
      console.log('No user data found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error fetching sample user data:', error);
    return null;
  }
};