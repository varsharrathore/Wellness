const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "Premium Whey Protein Powder",
    subtitle: "25g Protein Per Serving",
    description: "High-quality whey protein isolate with all essential amino acids. Perfect for muscle building and recovery. Available in multiple delicious flavors.",
    price: 49.99,
    discount: 20,
    finalPrice: 39.99,
    category: "Supplements",
    section: "trending",
    sizes: ["1lb", "2lb", "5lb"],
    variants: ["Vanilla", "Chocolate", "Strawberry"],
    stock: 150,
    images: ["protein-powder-1.jpg", "protein-powder-2.jpg"],
    status: "active"
  },
  {
    name: "Organic Green Tea Extract",
    subtitle: "Natural Antioxidant Boost",
    description: "Pure organic green tea extract capsules packed with antioxidants. Supports metabolism and provides natural energy without jitters.",
    price: 24.99,
    discount: 15,
    finalPrice: 21.24,
    category: "Supplements",
    section: "hot-deals",
    sizes: ["60 caps", "120 caps"],
    variants: ["Regular", "Extra Strength"],
    stock: 200,
    images: ["green-tea-1.jpg", "green-tea-2.jpg"],
    status: "active"
  },
  {
    name: "Yoga Mat Premium",
    subtitle: "Non-Slip Exercise Mat",
    description: "Professional-grade yoga mat with superior grip and cushioning. Perfect for yoga, pilates, and floor exercises. Eco-friendly materials.",
    price: 39.99,
    discount: 25,
    finalPrice: 29.99,
    category: "Fitness Equipment",
    section: "featured",
    sizes: ["Standard", "Extra Long"],
    variants: ["Purple", "Blue", "Pink", "Black"],
    stock: 75,
    images: ["yoga-mat-1.jpg", "yoga-mat-2.jpg"],
    videos: ["yoga-mat-demo.mp4"],
    status: "active"
  },
  {
    name: "Multivitamin Complex",
    subtitle: "Complete Daily Nutrition",
    description: "Comprehensive multivitamin with 25+ essential vitamins and minerals. Supports immune system, energy levels, and overall health.",
    price: 29.99,
    discount: 10,
    finalPrice: 26.99,
    category: "Supplements",
    section: "trending",
    sizes: ["30 tabs", "60 tabs", "90 tabs"],
    stock: 300,
    images: ["multivitamin-1.jpg", "multivitamin-2.jpg"],
    status: "active"
  },
  {
    name: "Resistance Bands Set",
    subtitle: "Complete Home Gym",
    description: "Professional resistance bands set with multiple resistance levels. Includes door anchor, handles, and ankle straps for full-body workouts.",
    price: 34.99,
    discount: 30,
    finalPrice: 24.49,
    category: "Fitness Equipment",
    section: "hot-deals",
    sizes: ["Light", "Medium", "Heavy", "Complete Set"],
    variants: ["Basic", "Pro", "Elite"],
    stock: 120,
    images: ["resistance-bands-1.jpg", "resistance-bands-2.jpg"],
    videos: ["resistance-workout.mp4"],
    status: "active"
  },
  {
    name: "Omega-3 Fish Oil",
    subtitle: "Heart & Brain Health",
    description: "Premium omega-3 fish oil capsules sourced from wild-caught fish. Supports cardiovascular health, brain function, and joint mobility.",
    price: 19.99,
    discount: 0,
    finalPrice: 19.99,
    category: "Supplements",
    section: "trending",
    sizes: ["60 caps", "120 caps", "180 caps"],
    stock: 250,
    images: ["omega3-1.jpg", "omega3-2.jpg"],
    status: "active"
  },
  {
    name: "Adjustable Dumbbells",
    subtitle: "Space-Saving Strength Training",
    description: "Innovative adjustable dumbbells that replace an entire weight set. Quick-change weight system from 5-50 lbs per dumbbell.",
    price: 299.99,
    discount: 15,
    finalPrice: 254.99,
    category: "Fitness Equipment",
    section: "featured",
    sizes: ["5-25 lbs", "5-50 lbs"],
    variants: ["Standard", "Pro"],
    stock: 25,
    images: ["dumbbells-1.jpg", "dumbbells-2.jpg"],
    videos: ["dumbbell-demo.mp4"],
    status: "active"
  },
  {
    name: "Collagen Peptides Powder",
    subtitle: "Beauty & Joint Support",
    description: "Hydrolyzed collagen peptides for skin elasticity, hair strength, and joint health. Unflavored and easily dissolves in any beverage.",
    price: 44.99,
    discount: 20,
    finalPrice: 35.99,
    category: "Supplements",
    section: "hot-deals",
    sizes: ["1lb", "2lb"],
    variants: ["Unflavored", "Vanilla", "Berry"],
    stock: 180,
    images: ["collagen-1.jpg", "collagen-2.jpg"],
    status: "active"
  },
  {
    name: "Smart Water Bottle",
    subtitle: "Hydration Tracking Technology",
    description: "Smart water bottle with LED reminders and app connectivity. Tracks daily water intake and reminds you to stay hydrated throughout the day.",
    price: 59.99,
    discount: 25,
    finalPrice: 44.99,
    category: "Accessories",
    section: "featured",
    sizes: ["16oz", "20oz", "24oz"],
    variants: ["Black", "White", "Blue", "Pink"],
    stock: 90,
    images: ["smart-bottle-1.jpg", "smart-bottle-2.jpg"],
    videos: ["smart-bottle-demo.mp4"],
    status: "active"
  },
  {
    name: "Probiotics Advanced Formula",
    subtitle: "Digestive & Immune Support",
    description: "Advanced probiotic formula with 50 billion CFU and 12 strains. Supports digestive health, immune function, and overall gut wellness.",
    price: 39.99,
    discount: 15,
    finalPrice: 33.99,
    category: "Supplements",
    section: "trending",
    sizes: ["30 caps", "60 caps"],
    variants: ["Regular", "Extra Strength"],
    stock: 220,
    images: ["probiotics-1.jpg", "probiotics-2.jpg"],
    status: "active"
  },
  {
    name: "Foam Roller Pro",
    subtitle: "Muscle Recovery Tool",
    description: "High-density foam roller for deep tissue massage and muscle recovery. Helps reduce soreness and improve flexibility after workouts.",
    price: 24.99,
    discount: 20,
    finalPrice: 19.99,
    category: "Fitness Equipment",
    section: "hot-deals",
    sizes: ["12 inch", "18 inch", "24 inch"],
    variants: ["Smooth", "Textured"],
    stock: 100,
    images: ["foam-roller-1.jpg", "foam-roller-2.jpg"],
    status: "active"
  },
  {
    name: "Meal Prep Containers Set",
    subtitle: "Portion Control Made Easy",
    description: "BPA-free meal prep containers with compartments for balanced nutrition. Microwave and dishwasher safe. Perfect for healthy meal planning.",
    price: 29.99,
    discount: 30,
    finalPrice: 20.99,
    category: "Accessories",
    section: "hot-deals",
    sizes: ["5-pack", "10-pack", "15-pack"],
    variants: ["Clear", "Colored"],
    stock: 150,
    images: ["meal-prep-1.jpg", "meal-prep-2.jpg"],
    status: "active"
  }
];

async function resetProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products`);

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Created ${insertedProducts.length} new products`);

    console.log('Product reset completed successfully!');
    
    // Display created products
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.section}) - $${product.finalPrice}`);
    });

  } catch (error) {
    console.error('Error resetting products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetProducts();