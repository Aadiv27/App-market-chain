import { ref, set, push } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

// Sample data for testing the "Mark as Packed" functionality
export const seedTestData = async () => {
  try {
    console.log('Seeding test data...');

    // Sample wholesaler data
    const wholesalerId = 'wholesaler_test_123';
    const retailerId = 'retailer_test_456';
    const vehicleOwnerId = 'vehicle_test_789';

    // Create sample users
    await set(ref(realtimeDb, `users/${wholesalerId}`), {
      uid: wholesalerId,
      fullName: 'Raj Wholesale Store',
      businessName: 'Raj Wholesale Store',
      email: 'raj@wholesale.com',
      phone: '+91-9876543210',
      role: 'wholesaler',
      address: '123 Wholesale Market, Delhi, India',
      createdAt: Date.now(),
      isOnline: true
    });

    await set(ref(realtimeDb, `users/${retailerId}`), {
      uid: retailerId,
      fullName: 'Sharma Retail Shop',
      businessName: 'Sharma Retail Shop',
      email: 'sharma@retail.com',
      phone: '+91-9876543211',
      role: 'retailer',
      address: '456 Retail Street, Gurgaon, India',
      createdAt: Date.now(),
      isOnline: true
    });

    await set(ref(realtimeDb, `users/${vehicleOwnerId}`), {
      uid: vehicleOwnerId,
      fullName: 'Suresh Transport',
      email: 'suresh@transport.com',
      phone: '+91-9876543212',
      role: 'vehicle_owner',
      address: '789 Transport Hub, Delhi, India',
      vehicleType: 'Truck',
      vehicleNumber: 'DL-01-AB-1234',
      createdAt: Date.now(),
      isOnline: true,
      isAvailable: true
    });

    // Create additional vehicle owner accounts for testing
    await set(ref(realtimeDb, `users/vehicle_test_002`), {
      uid: 'vehicle_test_002',
      fullName: 'Rajesh Logistics',
      email: 'rajesh@logistics.com',
      phone: '+91-9876543220',
      role: 'vehicle_owner',
      address: '456 Logistics Park, Mumbai, India',
      vehicleType: 'Van',
      vehicleNumber: 'MH-01-CD-5678',
      createdAt: Date.now(),
      isOnline: true,
      isAvailable: true
    });

    await set(ref(realtimeDb, `users/vehicle_test_003`), {
      uid: 'vehicle_test_003',
      fullName: 'Amit Delivery Services',
      email: 'amit@delivery.com',
      phone: '+91-9876543221',
      role: 'vehicle_owner',
      address: '123 Delivery Center, Bangalore, India',
      vehicleType: 'Bike',
      vehicleNumber: 'KA-01-EF-9012',
      createdAt: Date.now(),
      isOnline: true,
      isAvailable: true
    });

    // Create the original test account for backward compatibility
    await set(ref(realtimeDb, `users/vehicle_original_001`), {
      uid: 'vehicle_original_001',
      fullName: 'Test Driver',
      email: 'driver@vehicle.com',
      phone: '+91-9876543222',
      role: 'vehicle_owner',
      address: '999 Test Street, Delhi, India',
      vehicleType: 'Truck',
      vehicleNumber: 'DL-99-TEST-001',
      createdAt: Date.now(),
      isOnline: true,
      isAvailable: true
    });

    // Add additional retailer users for testing
    await set(ref(realtimeDb, `users/retailer_test_457`), {
      uid: 'retailer_test_457',
      fullName: 'Kumar Electronics',
      businessName: 'Kumar Electronics',
      shopName: 'Kumar Electronics',
      email: 'kumar@electronics.com',
      phone: '+91-9876543213',
      role: 'retailer',
      address: '789 Electronics Market, Noida, India',
      createdAt: Date.now(),
      isOnline: false
    });

    await set(ref(realtimeDb, `users/retailer_test_458`), {
      uid: 'retailer_test_458',
      fullName: 'Patel Grocery',
      businessName: 'Patel Grocery',
      shopName: 'Patel Grocery',
      email: 'patel@grocery.com',
      phone: '+91-9876543214',
      role: 'retailer',
      address: '321 Shopping Complex, Faridabad, India',
      createdAt: Date.now(),
      isOnline: true
    });

    await set(ref(realtimeDb, `users/retailer_test_789`), {
      uid: 'retailer_test_789',
      fullName: 'Modern Store',
      businessName: 'Modern Store',
      shopName: 'Modern Store',
      email: 'modern@store.com',
      phone: '+91-9876543215',
      role: 'retailer',
      address: '456 Market Street, Gurgaon, Haryana, India',
      createdAt: Date.now(),
      isOnline: true
    });

    // Create sample orders for the wholesaler
    const sampleOrders = [
      {
        id: 'order_001',
        retailer: 'Sharma Retail Shop',
        retailerId: retailerId,
        retailerShopName: 'Sharma Retail Shop',
        retailerAddress: '456 Retail Street, Gurgaon, India',
        retailerPhone: '+91-9876543211',
        items: 'Rice 50kg, Wheat 30kg, Sugar 20kg',
        amount: 15000,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        date: new Date().toISOString(),
        createdAt: Date.now()
      },
      {
        id: 'order_002',
        retailer: 'Kumar General Store',
        retailerId: 'retailer_test_457',
        retailerShopName: 'Kumar General Store',
        retailerAddress: '789 Market Road, Noida, India',
        retailerPhone: '+91-9876543213',
        items: 'Dal 25kg, Oil 10L, Spices 5kg',
        amount: 8500,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        date: new Date().toISOString(),
        createdAt: Date.now()
      },
      {
        id: 'order_003',
        retailer: 'Patel Grocery',
        retailerId: 'retailer_test_458',
        retailerShopName: 'Patel Grocery',
        retailerAddress: '321 Shopping Complex, Faridabad, India',
        retailerPhone: '+91-9876543214',
        items: 'Flour 40kg, Tea 2kg, Biscuits 10 packets',
        amount: 12000,
        status: 'Packed',
        paymentStatus: 'Paid',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        packedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        assignedVehicleId: vehicleOwnerId,
        deliveryDistance: 25,
        deliveryCost: 250
      },
      {
        id: 'order_004',
        retailer: 'Modern Store',
        retailerId: 'retailer_test_789',
        retailerShopName: 'Modern Store',
        retailerAddress: '456 Market Street, Gurgaon, Haryana, India',
        retailerPhone: '+91-9876543215',
        items: 'Rice 50kg, Oil 5L, Sugar 20kg',
        amount: 18500,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        date: new Date().toISOString(),
        createdAt: Date.now()
      }
    ];

    // Add orders to wholesaler's orders
    for (const order of sampleOrders) {
      await set(ref(realtimeDb, `wholesalers/${wholesalerId}/orders/${order.id}`), order);
    }

    // Add some stats for the wholesaler
    await set(ref(realtimeDb, `wholesalers/${wholesalerId}/stats`), {
      stat1: {
        icon: 'Package',
        color: 'bg-blue-500',
        value: '25',
        label: 'Total Orders',
        change: '+12%'
      },
      stat2: {
        icon: 'TrendingUp',
        color: 'bg-green-500',
        value: '₹2,45,000',
        label: 'Monthly Revenue',
        change: '+18%'
      },
      stat3: {
        icon: 'Users',
        color: 'bg-purple-500',
        value: '15',
        label: 'Active Retailers',
        change: '+5%'
      },
      stat4: {
        icon: 'BarChart3',
        color: 'bg-orange-500',
        value: '120',
        label: 'Total Products',
        change: '+8%'
      }
    });

    // Add some inventory items
    await set(ref(realtimeDb, `wholesalers/${wholesalerId}/inventory`), {
      rice: {
        name: 'Basmati Rice',
        category: 'Grains',
        current: 500,
        minimum: 100,
        maximum: 1000,
        price: 80,
        unit: 'kg',
        supplier: 'Punjab Rice Mills',
        demand: 'High',
        lastRestocked: new Date().toISOString()
      },
      wheat: {
        name: 'Wheat Flour',
        category: 'Grains',
        current: 300,
        minimum: 50,
        maximum: 500,
        price: 45,
        unit: 'kg',
        supplier: 'Haryana Mills',
        demand: 'Medium',
        lastRestocked: new Date().toISOString()
      }
    });

    // Add available deliveries for vehicle owners to see
    await set(ref(realtimeDb, 'availableDeliveries'), {
      delivery_001: {
        id: 'delivery_001',
        orderId: 'order_003',
        wholesaler: {
          id: wholesalerId,
          name: 'Raj Kumar',
          shopName: 'Kumar Wholesale',
          address: '123 Wholesale Market, Delhi, India',
          phone: '+91-9876543210'
        },
        retailer: {
          id: 'retailer_test_458',
          name: 'Patel Grocery Owner',
          shopName: 'Patel Grocery',
          address: '321 Shopping Complex, Faridabad, India',
          phone: '+91-9876543214'
        },
        items: 'Flour 40kg, Tea 2kg, Biscuits 10 packets',
        amount: 12000,
        distance: 25,
        deliveryCost: 250,
        packedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        status: 'available'
      },
      delivery_002: {
        id: 'delivery_002',
        orderId: 'order_005',
        wholesaler: {
          id: wholesalerId,
          name: 'Raj Kumar',
          shopName: 'Kumar Wholesale',
          address: '123 Wholesale Market, Delhi, India',
          phone: '+91-9876543210'
        },
        retailer: {
          id: 'retailer_test_999',
          name: 'Sharma Electronics',
          shopName: 'Sharma Electronics Store',
          address: '789 Electronics Market, Noida, India',
          phone: '+91-9876543216'
        },
        items: 'Mobile Accessories, Cables, Chargers',
        amount: 15000,
        distance: 18,
        deliveryCost: 180,
        packedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        status: 'available'
      }
    });

    console.log('Test data seeded successfully!');
    console.log('Wholesaler ID:', wholesalerId);
    console.log('Use this ID to login and test the "Mark as Packed" functionality');

  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};

// Function to clean up test data
export const cleanupTestData = async () => {
  try {
    console.log('Cleaning up test data...');
    
    const testIds = [
      'wholesaler_test_123',
      'retailer_test_456',
      'retailer_test_457',
      'retailer_test_458',
      'retailer_test_789',
      'vehicle_test_789'
    ];

    for (const id of testIds) {
      await set(ref(realtimeDb, `users/${id}`), null);
      await set(ref(realtimeDb, `wholesalers/${id}`), null);
    }

    console.log('Test data cleaned up successfully!');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
};