import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDo9in_JIAZM8L9Jn0Z_fFQ8pZ7s9hIwZg",
  authDomain: "market-chain-5bd35.firebaseapp.com",
  databaseURL: "https://market-chain-5bd35-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "market-chain-5bd35",
  storageBucket: "market-chain-5bd35.firebasestorage.app",
  messagingSenderId: "843550623148",
  appId: "1:843550623148:web:31dc87eb003693961a2609"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const allProducts = [
  // Additional Rice Products
  { id: 'rice_004', name: 'Jasmine Rice', category: 'rice', price: 110, stock: 400, description: 'Fragrant jasmine rice from Thailand', wholesalerId: 'wholesaler_002', wholesalerName: 'South India Rice Mills' },
  { id: 'rice_005', name: 'Red Rice Organic', category: 'rice', price: 140, stock: 250, description: 'Nutritious red rice, unpolished', wholesalerId: 'wholesaler_003', wholesalerName: 'Organic Foods Co.' },

  // Additional Sugar Products
  { id: 'sugar_003', name: 'Jaggery (Gur)', category: 'sugar', price: 65, stock: 350, description: 'Traditional jaggery, unrefined sugar', wholesalerId: 'wholesaler_002', wholesalerName: 'South India Rice Mills' },
  { id: 'sugar_004', name: 'Rock Sugar (Mishri)', category: 'sugar', price: 75, stock: 200, description: 'Crystallized sugar, natural sweetener', wholesalerId: 'wholesaler_003', wholesalerName: 'Organic Foods Co.' },

  // Additional Pulses
  { id: 'pulses_003', name: 'Chana Dal', category: 'pulses', price: 85, stock: 500, description: 'Bengal gram split, high protein', wholesalerId: 'wholesaler_003', wholesalerName: 'Organic Foods Co.' },
  { id: 'pulses_004', name: 'Masoor Dal', category: 'pulses', price: 95, stock: 400, description: 'Red lentils, quick cooking', wholesalerId: 'wholesaler_001', wholesalerName: 'Delhi Grains Wholesale' },
  { id: 'pulses_005', name: 'Urad Dal', category: 'pulses', price: 120, stock: 350, description: 'Black gram split, protein rich', wholesalerId: 'wholesaler_002', wholesalerName: 'South India Rice Mills' },
  { id: 'pulses_006', name: 'Rajma (Kidney Beans)', category: 'pulses', price: 130, stock: 300, description: 'Red kidney beans, high protein', wholesalerId: 'wholesaler_001', wholesalerName: 'Delhi Grains Wholesale' },

  // Additional Dairy Products
  { id: 'dairy_002', name: 'Paneer (Cottage Cheese)', category: 'dairy', price: 280, stock: 150, description: 'Fresh cottage cheese, high protein', wholesalerId: 'wholesaler_004', wholesalerName: 'Dairy Fresh Wholesale' },
  { id: 'dairy_003', name: 'Ghee Pure', category: 'dairy', price: 450, stock: 180, description: 'Pure clarified butter, traditional', wholesalerId: 'wholesaler_003', wholesalerName: 'Organic Foods Co.' },
  { id: 'dairy_004', name: 'Yogurt Starter Culture', category: 'dairy', price: 50, stock: 100, description: 'Natural yogurt starter for homemade curd', wholesalerId: 'wholesaler_004', wholesalerName: 'Dairy Fresh Wholesale' },

  // Additional Cooking Oils
  { id: 'oil_002', name: 'Mustard Oil', category: 'oil', price: 160, stock: 350, description: 'Pure mustard oil, traditional cooking', wholesalerId: 'wholesaler_005', wholesalerName: 'Oil Mills Corporation' },
  { id: 'oil_003', name: 'Coconut Oil', category: 'oil', price: 180, stock: 300, description: 'Virgin coconut oil, cold pressed', wholesalerId: 'wholesaler_003', wholesalerName: 'Organic Foods Co.' },
  { id: 'oil_004', name: 'Sesame Oil', category: 'oil', price: 200, stock: 250, description: 'Pure sesame oil, aromatic', wholesalerId: 'wholesaler_005', wholesalerName: 'Oil Mills Corporation' },

  // Additional Flour
  { id: 'flour_002', name: 'All Purpose Flour (Maida)', category: 'flour', price: 30, stock: 600, description: 'Refined wheat flour for baking', wholesalerId: 'wholesaler_001', wholesalerName: 'Delhi Grains Wholesale' },
  { id: 'flour_003', name: 'Besan (Gram Flour)', category: 'flour', price: 70, stock: 400, description: 'Chickpea flour, protein rich', wholesalerId: 'wholesaler_002', wholesalerName: 'South India Rice Mills' },
  { id: 'flour_004', name: 'Rice Flour', category: 'flour', price: 45, stock: 350, description: 'Fine rice flour for South Indian dishes', wholesalerId: 'wholesaler_002', wholesalerName: 'South India Rice Mills' },

  // Additional Spices
  { id: 'spices_002', name: 'Red Chili Powder', category: 'spices', price: 150, stock: 350, description: 'Hot red chili powder, premium quality', wholesalerId: 'wholesaler_006', wholesalerName: 'Spice Garden Wholesale' },
  { id: 'spices_003', name: 'Coriander Powder', category: 'spices', price: 100, stock: 400, description: 'Ground coriander seeds, aromatic', wholesalerId: 'wholesaler_006', wholesalerName: 'Spice Garden Wholesale' },
  { id: 'spices_004', name: 'Garam Masala', category: 'spices', price: 200, stock: 250, description: 'Blend of aromatic spices', wholesalerId: 'wholesaler_006', wholesalerName: 'Spice Garden Wholesale' },
  { id: 'spices_005', name: 'Cumin Powder', category: 'spices', price: 180, stock: 300, description: 'Ground cumin seeds, earthy flavor', wholesalerId: 'wholesaler_006', wholesalerName: 'Spice Garden Wholesale' },

  // Additional Snacks
  { id: 'snacks_002', name: 'Roasted Peanuts', category: 'snacks', price: 120, stock: 300, description: 'Salted roasted peanuts, crunchy', wholesalerId: 'wholesaler_007', wholesalerName: 'Snacks & More Wholesale' },
  { id: 'snacks_003', name: 'Biscuits Assorted', category: 'snacks', price: 60, stock: 400, description: 'Mixed variety biscuits pack', wholesalerId: 'wholesaler_007', wholesalerName: 'Snacks & More Wholesale' },
  { id: 'snacks_004', name: 'Popcorn Kernels', category: 'snacks', price: 80, stock: 200, description: 'Premium popcorn kernels', wholesalerId: 'wholesaler_007', wholesalerName: 'Snacks & More Wholesale' },

  // Additional Beverages
  { id: 'beverages_002', name: 'Coffee Powder', category: 'beverages', price: 320, stock: 150, description: 'Ground coffee powder, aromatic', wholesalerId: 'wholesaler_008', wholesalerName: 'Beverage Hub Wholesale' },
  { id: 'beverages_003', name: 'Fruit Juice Concentrate', category: 'beverages', price: 180, stock: 100, description: 'Mixed fruit juice concentrate', wholesalerId: 'wholesaler_008', wholesalerName: 'Beverage Hub Wholesale' },
  { id: 'beverages_004', name: 'Green Tea', category: 'beverages', price: 300, stock: 120, description: 'Organic green tea leaves', wholesalerId: 'wholesaler_008', wholesalerName: 'Beverage Hub Wholesale' }
];

async function seedAllProducts() {
  try {
    console.log('Adding comprehensive FMCG product catalog...');
    
    for (const product of allProducts) {
      const productRef = ref(database, `products/${product.id}`);
      await set(productRef, {
        ...product,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastUpdated: new Date().toISOString()
      });
      console.log(`✓ Added: ${product.name} (${product.category})`);
    }

    console.log('\n🎉 Complete FMCG catalog seeded successfully!');
    console.log(`📦 Total additional products: ${allProducts.length}`);
    console.log('🛒 All products are now visible to retailers for ordering');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedAllProducts();