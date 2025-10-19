import { ref, set, onValue } from 'firebase/database';
import { realtimeDb } from '../components/lib/Firebase';

// Comprehensive FMCG Products Data
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
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'
  },
  {
    id: 'rice_002',
    name: 'Sona Masoori Rice',
    category: 'rice',
    price: 80,
    stock: 750,
    description: 'Medium grain rice, perfect for daily meals',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'
  },
  {
    id: 'rice_003',
    name: 'Brown Rice Organic',
    category: 'rice',
    price: 150,
    stock: 300,
    description: 'Organic brown rice, high in fiber and nutrients',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'
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
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300'
  },
  {
    id: 'sugar_002',
    name: 'Brown Sugar',
    category: 'sugar',
    price: 55,
    stock: 400,
    description: 'Natural brown sugar with molasses',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300'
  },
  {
    id: 'sugar_003',
    name: 'Jaggery (Gur)',
    category: 'sugar',
    price: 65,
    stock: 350,
    description: 'Traditional jaggery, unrefined sugar',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills',
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300'
  },

  // Pulses (Dal)
  {
    id: 'pulses_001',
    name: 'Toor Dal (Arhar)',
    category: 'pulses',
    price: 90,
    stock: 600,
    description: 'Yellow split pigeon peas, protein rich',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300'
  },
  {
    id: 'pulses_002',
    name: 'Moong Dal',
    category: 'pulses',
    price: 110,
    stock: 450,
    description: 'Green gram split, easy to digest',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300'
  },
  {
    id: 'pulses_003',
    name: 'Chana Dal',
    category: 'pulses',
    price: 85,
    stock: 500,
    description: 'Bengal gram split, high protein',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300'
  },
  {
    id: 'pulses_004',
    name: 'Masoor Dal',
    category: 'pulses',
    price: 95,
    stock: 400,
    description: 'Red lentils, quick cooking',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300'
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
    wholesalerName: 'Dairy Fresh Wholesale',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'
  },
  {
    id: 'dairy_002',
    name: 'Paneer (Cottage Cheese)',
    category: 'dairy',
    price: 280,
    stock: 150,
    description: 'Fresh cottage cheese, high protein',
    wholesalerId: 'wholesaler_004',
    wholesalerName: 'Dairy Fresh Wholesale',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'
  },
  {
    id: 'dairy_003',
    name: 'Ghee Pure',
    category: 'dairy',
    price: 450,
    stock: 180,
    description: 'Pure clarified butter, traditional',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'
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
    wholesalerName: 'Oil Mills Corporation',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300'
  },
  {
    id: 'oil_002',
    name: 'Mustard Oil',
    category: 'oil',
    price: 160,
    stock: 350,
    description: 'Pure mustard oil, traditional cooking',
    wholesalerId: 'wholesaler_005',
    wholesalerName: 'Oil Mills Corporation',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300'
  },
  {
    id: 'oil_003',
    name: 'Coconut Oil',
    category: 'oil',
    price: 180,
    stock: 300,
    description: 'Virgin coconut oil, cold pressed',
    wholesalerId: 'wholesaler_003',
    wholesalerName: 'Organic Foods Co.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300'
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
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'
  },
  {
    id: 'flour_002',
    name: 'All Purpose Flour (Maida)',
    category: 'flour',
    price: 30,
    stock: 600,
    description: 'Refined wheat flour for baking',
    wholesalerId: 'wholesaler_001',
    wholesalerName: 'Delhi Grains Wholesale',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'
  },
  {
    id: 'flour_003',
    name: 'Besan (Gram Flour)',
    category: 'flour',
    price: 70,
    stock: 400,
    description: 'Chickpea flour, protein rich',
    wholesalerId: 'wholesaler_002',
    wholesalerName: 'South India Rice Mills',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'
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
    wholesalerName: 'Spice Garden Wholesale',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'
  },
  {
    id: 'spices_002',
    name: 'Red Chili Powder',
    category: 'spices',
    price: 150,
    stock: 350,
    description: 'Hot red chili powder, premium quality',
    wholesalerId: 'wholesaler_006',
    wholesalerName: 'Spice Garden Wholesale',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'
  },
  {
    id: 'spices_003',
    name: 'Coriander Powder',
    category: 'spices',
    price: 100,
    stock: 400,
    description: 'Ground coriander seeds, aromatic',
    wholesalerId: 'wholesaler_006',
    wholesalerName: 'Spice Garden Wholesale',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'
  },
  {
    id: 'spices_004',
    name: 'Garam Masala',
    category: 'spices',
    price: 200,
    stock: 250,
    description: 'Blend of aromatic spices',
    wholesalerId: 'wholesaler_006',
    wholesalerName: 'Spice Garden Wholesale',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'
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
    wholesalerName: 'Snacks & More Wholesale',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300'
  },
  {
    id: 'snacks_002',
    name: 'Roasted Peanuts',
    category: 'snacks',
    price: 120,
    stock: 300,
    description: 'Salted roasted peanuts, crunchy',
    wholesalerId: 'wholesaler_007',
    wholesalerName: 'Snacks & More Wholesale',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300'
  },
  {
    id: 'snacks_003',
    name: 'Biscuits Assorted',
    category: 'snacks',
    price: 60,
    stock: 400,
    description: 'Mixed variety biscuits pack',
    wholesalerId: 'wholesaler_007',
    wholesalerName: 'Snacks & More Wholesale',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300'
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
    wholesalerName: 'Beverage Hub Wholesale',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300'
  },
  {
    id: 'beverages_002',
    name: 'Coffee Powder',
    category: 'beverages',
    price: 320,
    stock: 150,
    description: 'Ground coffee powder, aromatic',
    wholesalerId: 'wholesaler_008',
    wholesalerName: 'Beverage Hub Wholesale',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300'
  },
  {
    id: 'beverages_003',
    name: 'Fruit Juice Concentrate',
    category: 'beverages',
    price: 180,
    stock: 100,
    description: 'Mixed fruit juice concentrate',
    wholesalerId: 'wholesaler_008',
    wholesalerName: 'Beverage Hub Wholesale',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300'
  }
];

// Wholesaler data to ensure they exist
const wholesalers = [
  {
    id: 'wholesaler_001',
    name: 'Rajesh Kumar',
    shopName: 'Delhi Grains Wholesale',
    location: 'Delhi, India',
    rating: 4.5,
    phone: '+91-9876543210',
    email: 'rajesh@delhigrains.com',
    address: 'Azadpur Mandi, Delhi',
    specialization: 'Grains & Cereals'
  },
  {
    id: 'wholesaler_002',
    name: 'Suresh Reddy',
    shopName: 'South India Rice Mills',
    location: 'Hyderabad, India',
    rating: 4.3,
    phone: '+91-9876543211',
    email: 'suresh@southricemills.com',
    address: 'Begum Bazaar, Hyderabad',
    specialization: 'Rice & Pulses'
  },
  {
    id: 'wholesaler_003',
    name: 'Priya Sharma',
    shopName: 'Organic Foods Co.',
    location: 'Mumbai, India',
    rating: 4.7,
    phone: '+91-9876543212',
    email: 'priya@organicfoods.com',
    address: 'Crawford Market, Mumbai',
    specialization: 'Organic Products'
  },
  {
    id: 'wholesaler_004',
    name: 'Amit Patel',
    shopName: 'Dairy Fresh Wholesale',
    location: 'Ahmedabad, India',
    rating: 4.4,
    phone: '+91-9876543213',
    email: 'amit@dairyfresh.com',
    address: 'Kalupur Market, Ahmedabad',
    specialization: 'Dairy Products'
  },
  {
    id: 'wholesaler_005',
    name: 'Vikram Singh',
    shopName: 'Oil Mills Corporation',
    location: 'Ludhiana, India',
    rating: 4.2,
    phone: '+91-9876543214',
    email: 'vikram@oilmills.com',
    address: 'Industrial Area, Ludhiana',
    specialization: 'Cooking Oils'
  },
  {
    id: 'wholesaler_006',
    name: 'Meera Joshi',
    shopName: 'Spice Garden Wholesale',
    location: 'Kochi, India',
    rating: 4.6,
    phone: '+91-9876543215',
    email: 'meera@spicegarden.com',
    address: 'Mattancherry, Kochi',
    specialization: 'Spices & Condiments'
  },
  {
    id: 'wholesaler_007',
    name: 'Ravi Gupta',
    shopName: 'Snacks & More Wholesale',
    location: 'Indore, India',
    rating: 4.1,
    phone: '+91-9876543216',
    email: 'ravi@snacksmore.com',
    address: 'Sarafa Bazaar, Indore',
    specialization: 'Snacks & Confectionery'
  },
  {
    id: 'wholesaler_008',
    name: 'Kavita Nair',
    shopName: 'Beverage Hub Wholesale',
    location: 'Bangalore, India',
    rating: 4.5,
    phone: '+91-9876543217',
    email: 'kavita@beveragehub.com',
    address: 'KR Market, Bangalore',
    specialization: 'Beverages & Drinks'
  }
];

// Function to seed the database
export const seedFMCGProducts = async () => {
  try {
    console.log('Starting to seed FMCG products...');

    // Add wholesalers first
    for (const wholesaler of wholesalers) {
      const wholesalerRef = ref(realtimeDb, `wholesalers/${wholesaler.id}`);
      await set(wholesalerRef, {
        ...wholesaler,
        createdAt: new Date().toISOString(),
        isActive: true,
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          lastOrderDate: null
        }
      });
      console.log(`Added wholesaler: ${wholesaler.shopName}`);
    }

    // Add products
    for (const product of fmcgProducts) {
      const productRef = ref(realtimeDb, `products/${product.id}`);
      await set(productRef, {
        ...product,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastUpdated: new Date().toISOString()
      });
      console.log(`Added product: ${product.name}`);
    }

    console.log('Successfully seeded all FMCG products and wholesalers!');
    console.log(`Total products added: ${fmcgProducts.length}`);
    console.log(`Total wholesalers added: ${wholesalers.length}`);
    
    return {
      success: true,
      productsAdded: fmcgProducts.length,
      wholesalersAdded: wholesalers.length
    };

  } catch (error) {
    console.error('Error seeding FMCG products:', error);
    return {
      success: false,
      error: error
    };
  }
};

// Function to verify products in database
export const verifyProducts = async () => {
  try {
    const productsRef = ref(realtimeDb, 'products');
    const snapshot = await new Promise((resolve) => {
      let unsubscribe: (() => void) | null = null;
      unsubscribe = onValue(productsRef, (snapshot) => {
        if (unsubscribe) {
          unsubscribe();
        }
        resolve(snapshot);
      });
    });
    
    const data = (snapshot as any).val();
    if (data) {
      const productCount = Object.keys(data).length;
      console.log(`Found ${productCount} products in database`);
      return { success: true, count: productCount, products: data };
    } else {
      console.log('No products found in database');
      return { success: true, count: 0, products: {} };
    }
  } catch (error) {
    console.error('Error verifying products:', error);
    return { success: false, error };
  }
};

export default { seedFMCGProducts, verifyProducts };