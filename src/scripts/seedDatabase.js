// Simple Node.js script to seed the database
// Run this with: node src/scripts/seedDatabase.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration
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

// FMCG Products Data
const fmcgProducts = [
  // Rice Products
  {
    id: 'rice_001',
    name: 'Basmati Rice Premium',
    category: 'rice',
    price: 120,
    stock: 500,
    description: 'Premium quality basmati rice, long grain, aromatic',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale'
  },
  {
    id: 'rice_002',
    name: 'Sona Masoori Rice',
    category: 'rice',
    price: 80,
    stock: 750,
    description: 'Medium grain rice, perfect for daily meals',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills'
  },
  {
    id: 'rice_003',
    name: 'Brown Rice Organic',
    category: 'rice',
    price: 150,
    stock: 300,
    description: 'Organic brown rice, high in fiber and nutrients',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.'
  },

  // Sugar Products
  {
    id: 'sugar_001',
    name: 'White Sugar Refined',
    category: 'sugar',
    price: 45,
    stock: 1000,
    description: 'Pure white refined sugar, crystal clear',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale'
  },
  {
    id: 'sugar_002',
    name: 'Brown Sugar',
    category: 'sugar',
    price: 55,
    stock: 400,
    description: 'Natural brown sugar with molasses',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.'
  },

  // Pulses
  {
    id: 'pulses_001',
    name: 'Toor Dal (Arhar)',
    category: 'pulses',
    price: 90,
    stock: 600,
    description: 'Yellow split pigeon peas, protein rich',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale'
  },
  {
    id: 'pulses_002',
    name: 'Moong Dal',
    category: 'pulses',
    price: 110,
    stock: 450,
    description: 'Green gram split, easy to digest',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills'
  },

  // Dairy Products
  {
    id: 'dairy_001',
    name: 'Full Cream Milk Powder',
    category: 'dairy',
    price: 320,
    stock: 200,
    description: 'Rich and creamy milk powder',
    wholesalerId: 'wholesaler_004',
    wholesalerName: 'Dairy Fresh Wholesale'
  },

  // Cooking Oil
  {
    id: 'oil_001',
    name: 'Sunflower Oil',
    category: 'oil',
    price: 140,
    stock: 400,
    description: 'Refined sunflower cooking oil',
    wholesalerId: 'wholesaler_005',
    wholesalerName: 'Oil Mills Corporation'
  },

  // Flour
  {
    id: 'flour_001',
    name: 'Wheat Flour (Atta)',
    category: 'flour',
    price: 35,
    stock: 800,
    description: 'Whole wheat flour, stone ground',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale'
  },

  // Spices
  {
    id: 'spices_001',
    name: 'Turmeric Powder',
    category: 'spices',
    price: 120,
    stock: 300,
    description: 'Pure turmeric powder, anti-inflammatory',
    wholesalerId: 'wholesaler_006',
    wholesalerName: 'Spice Garden Wholesale'
  },

  // Snacks
  {
    id: 'snacks_001',
    name: 'Namkeen Mix',
    category: 'snacks',
    price: 80,
    stock: 200,
    description: 'Traditional Indian snack mix',
    wholesalerId: 'wholesaler_007',
    wholesalerName: 'Snacks & More Wholesale'
  },

  // Beverages
  {
    id: 'beverages_001',
    name: 'Tea Leaves Premium',
    category: 'beverages',
    price: 250,
    stock: 200,
    description: 'Premium Assam tea leaves',
    wholesalerId: 'wholesaler_008',
    wholesalerName: 'Beverage Hub Wholesale'
  }
];

// Wholesaler data
const wholesalers = [
  {
    id: 'wholesaler_001',
    name: 'Rajesh Kumar',
    shopName: 'Delhi Grains Wholesale',
    location: 'Delhi, India',
    rating: 4.5
  },
  {
    id: 'wholesaler_002',
    name: 'Suresh Reddy',
    shopName: 'South India Rice Mills',
    location: 'Hyderabad, India',
    rating: 4.3
  },
  {
    id: 'wholesaler_003',
    name: 'Priya Sharma',
    shopName: 'Organic Foods Co.',
    location: 'Mumbai, India',
    rating: 4.7
  },
  {
    id: 'wholesaler_004',
    name: 'Amit Patel',
    shopName: 'Dairy Fresh Wholesale',
    location: 'Ahmedabad, India',
    rating: 4.4
  },
  {
    id: 'wholesaler_005',
    name: 'Vikram Singh',
    shopName: 'Oil Mills Corporation',
    location: 'Ludhiana, India',
    rating: 4.2
  },
  {
    id: 'wholesaler_006',
    name: 'Meera Joshi',
    shopName: 'Spice Garden Wholesale',
    location: 'Kochi, India',
    rating: 4.6
  },
  {
    id: 'wholesaler_007',
    name: 'Ravi Gupta',
    shopName: 'Snacks & More Wholesale',
    location: 'Indore, India',
    rating: 4.1
  },
  {
    id: 'wholesaler_008',
    name: 'Kavita Nair',
    shopName: 'Beverage Hub Wholesale',
    location: 'Bangalore, India',
    rating: 4.5
  }
];

async function seedDatabase() {
  try {
    console.log('Starting to seed database...');

    // Add wholesalers
    for (const wholesaler of wholesalers) {
      const wholesalerRef = ref(database, `wholesalers/${wholesaler.id}`);
      await set(wholesalerRef, {
        ...wholesaler,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      console.log(`Added wholesaler: ${wholesaler.shopName}`);
    }

    // Add products
    for (const product of fmcgProducts) {
      const productRef = ref(database, `products/${product.id}`);
      await set(productRef, {
        ...product,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      console.log(`Added product: ${product.name}`);
    }

    console.log('Database seeding completed successfully!');
    console.log(`Total products added: ${fmcgProducts.length}`);
    console.log(`Total wholesalers added: ${wholesalers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();