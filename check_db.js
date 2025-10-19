import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase configuration from your app
const firebaseConfig = {
  apiKey: "AIzaSyDo9in_JIAZM8L9Jn0Z_fFQ8pZ7s9hIwZg",
  authDomain: "market-chain-5bd35.firebaseapp.com",
  databaseURL: "https://market-chain-5bd35-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "market-chain-5bd35",
  storageBucket: "market-chain-5bd35.firebasestorage.app",
  messagingSenderId: "843550623148",
  appId: "1:843550623148:web:31dc87eb003693961a2609",
  measurementId: "G-ZZWPYCVFKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkDatabase() {
  try {
    console.log('=== CHECKING FIREBASE DATABASE ===');
    
    // Check available deliveries
    console.log('\n=== AVAILABLE DELIVERIES ===');
    const availableRef = ref(database, 'availableDeliveries');
    const availableSnapshot = await get(availableRef);
    if (availableSnapshot.exists()) {
      const data = availableSnapshot.val();
      console.log(`Found ${Object.keys(data).length} available deliveries:`);
      Object.entries(data).forEach(([key, delivery]) => {
        console.log(`  - ${key}: Status=${delivery.status || 'unknown'}, OrderId=${delivery.orderId || 'unknown'}`);
      });
    } else {
      console.log('No available deliveries found');
    }
    
    // Check orders structure
    console.log('\n=== ORDERS STRUCTURE ===');
    const ordersRef = ref(database, 'orders');
    const ordersSnapshot = await get(ordersRef);
    if (ordersSnapshot.exists()) {
      const data = ordersSnapshot.val();
      console.log('Found orders structure:');
      Object.keys(data).forEach(key => {
        console.log(`  - ${key}/`);
        if (typeof data[key] === 'object') {
          Object.keys(data[key]).forEach(subkey => {
            console.log(`    - ${subkey}/`);
            if (typeof data[key][subkey] === 'object') {
              Object.entries(data[key][subkey]).forEach(([orderId, orderData]) => {
                const status = orderData?.status || 'unknown';
                console.log(`      - ${orderId}: status=${status}`);
              });
            }
          });
        }
      });
    } else {
      console.log('No orders found');
    }
    
    // Check vehicle data
    console.log('\n=== VEHICLE DATA ===');
    const vehiclesRef = ref(database, 'vehicles');
    const vehiclesSnapshot = await get(vehiclesRef);
    if (vehiclesSnapshot.exists()) {
      const data = vehiclesSnapshot.val();
      console.log('Found vehicle data for:');
      Object.keys(data).forEach(vehicleId => {
        console.log(`  - ${vehicleId}`);
      });
    } else {
      console.log('No vehicle data found');
    }
    
    // Check notifications for the specific user
    console.log('\n=== NOTIFICATIONS FOR vehical123@gmail.com ===');
    // First, let's find the user ID for vehical123@gmail.com
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      let vehicleUserId = null;
      
      Object.entries(users).forEach(([userId, userData]) => {
        if (userData.email === 'vehical123@gmail.com') {
          vehicleUserId = userId;
          console.log(`Found user ID for vehical123@gmail.com: ${userId}`);
        }
      });
      
      if (vehicleUserId) {
        const notificationsRef = ref(database, `notifications/${vehicleUserId}`);
        const notificationsSnapshot = await get(notificationsRef);
        if (notificationsSnapshot.exists()) {
          const notifications = notificationsSnapshot.val();
          console.log(`Found ${Object.keys(notifications).length} notifications:`);
          Object.entries(notifications).forEach(([key, notification]) => {
            console.log(`  - ${key}: ${notification.message || notification.title || 'No message'}`);
          });
        } else {
          console.log('No notifications found for this user');
        }
      } else {
        console.log('User vehical123@gmail.com not found in database');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();