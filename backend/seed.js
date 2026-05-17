const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');
const Settings = require('./models/Settings');

// Real uploaded image filenames from the uploads/ folder
const imgs = [
  'images-1772082642001-356752549.jpg',
  'images-1772082642001-763989617.jpg',
  'images-1772082027725-327188185.jpg',
  'images-1772082027725-887302930.jpg',
  'images-1772081993466-981469510.jpg',
  'images-1772081993467-766178421.jpg',
  'images-1772035445697-821899898.jpg',
  'images-1771517545084-124165298.png',
  'images-1771517545121-920292651.png',
  'images-1771517318610-634213776.png',
  'images-1771517318617-748634193.png',
  'images-1771517280454-536168731.png',
  'images-1771517280465-948831982.png',
  'images-1771517167557-192219677.png',
  'images-1771517167566-962752648.png',
  'images-1771516867234-885725739.png',
  'images-1771516867241-337367505.png',
  'images-1771516865814-923569487.png',
  'images-1771516865822-43735837.png',
  'images-1771516808533-234935177.png',
  'images-1771516808540-444985059.png',
  'images-1771516789560-324082803.png',
  'images-1771516789564-457414517.png',
  'images-1771516787834-993609925.png',
  'images-1771516787857-204538756.png',
  'images-1771515323329-986983420.png',
  'images-1771515474547-720711372.png',
  'images-1770093177734-663762138.png',
  'images-1770093215895-101980554.png',
  'images-1770093215954-565403597.png',
  'images-1770093080502-599976140.png',
  'images-1770093033575-150854490.jpg',
  'images-1770092958204-796633034.jpg',
  'images-1770092913736-763633911.png',
  'images-1767677778753-368160052.jpeg',
  'images-1767677816685-806736277.jpeg',
];

// Real uploaded video filenames
const vids = [
  'videos-1772082642001-573137527.mp4',
  'videos-1772082587502-944329531.mp4',
  'videos-1770093033576-104937550.mp4',
  'videos-1770093116522-315989235.mp4',
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Only clear products and categories, keep users
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Supplements', description: 'Health supplements and vitamins', isActive: true },
      { name: 'Fitness', description: 'Fitness equipment and accessories', isActive: true },
      { name: 'Skincare', description: 'Natural skincare products', isActive: true },
      { name: 'Wellness', description: 'General wellness products', isActive: true },
    ]);

    const [supp, fit, skin, well] = categories;

    const fp = (price, discount) => price - (price * discount / 100);

    // Seed products using real uploaded images
    const products = [
      // --- TRENDING ---
      {
        name: 'Vitamin D3 + K2 Supplement',
        subtitle: 'Bone & Immunity Support',
        description: 'High-potency Vitamin D3 with K2 for optimal calcium absorption and immune support.',
        price: 999, discount: 20, finalPrice: fp(999,20), category: 'supplements', section: 'trending', stock: 120,
        images: [imgs[0], imgs[1]], videos: [], status: 'active', averageRating: 4.5
      },
      {
        name: 'Organic Whey Protein',
        subtitle: 'Chocolate Fudge Flavour',
        description: 'Premium grass-fed whey protein with 25g protein per serving. No artificial sweeteners.',
        price: 1499, discount: 15, finalPrice: fp(1499,15), category: 'fitness', section: 'trending', stock: 80,
        images: [imgs[2], imgs[3]], videos: [], status: 'active', averageRating: 4.7
      },
      {
        name: 'Collagen Glow Serum',
        subtitle: 'Anti-Aging Face Serum',
        description: 'Marine collagen serum with hyaluronic acid for youthful, glowing skin.',
        price: 799, discount: 10, finalPrice: fp(799,10), category: 'skincare', section: 'trending', stock: 60,
        images: [imgs[4], imgs[5]], videos: [], status: 'active', averageRating: 4.3
      },
      {
        name: 'Ashwagandha KSM-66',
        subtitle: 'Stress Relief & Energy',
        description: 'Clinically studied KSM-66 ashwagandha root extract for stress, energy and focus.',
        price: 699, discount: 25, finalPrice: fp(699,25), category: 'wellness', section: 'trending', stock: 150,
        images: [imgs[6], imgs[7]], videos: [], status: 'active', averageRating: 4.6
      },
      {
        name: 'Omega-3 Fish Oil',
        subtitle: 'Heart & Brain Health',
        description: 'Triple-strength omega-3 with EPA & DHA for cardiovascular and cognitive health.',
        price: 849, discount: 18, finalPrice: fp(849,18), category: 'supplements', section: 'trending', stock: 90,
        images: [imgs[8], imgs[9]], videos: [], status: 'active', averageRating: 4.4
      },
      {
        name: 'Resistance Band Set',
        subtitle: '5 Levels of Resistance',
        description: 'Premium latex resistance bands for home workouts, yoga, and physiotherapy.',
        price: 599, discount: 30, finalPrice: fp(599,30), category: 'fitness', section: 'trending', stock: 200,
        images: [imgs[10], imgs[11]], videos: [], status: 'active', averageRating: 4.2
      },
      {
        name: 'Niacinamide 10% Serum',
        subtitle: 'Pore Minimizer & Brightener',
        description: 'Dermatologist-tested niacinamide serum that minimizes pores and evens skin tone.',
        price: 499, discount: 12, finalPrice: fp(499,12), category: 'skincare', section: 'trending', stock: 110,
        images: [imgs[12], imgs[13]], videos: [], status: 'active', averageRating: 4.8
      },
      {
        name: 'Magnesium Glycinate',
        subtitle: 'Sleep & Muscle Recovery',
        description: 'Highly bioavailable magnesium glycinate for deep sleep and muscle relaxation.',
        price: 749, discount: 22, finalPrice: fp(749,22), category: 'wellness', section: 'trending', stock: 75,
        images: [imgs[14], imgs[15]], videos: [], status: 'active', averageRating: 4.5
      },

      // --- HOT DEALS ---
      {
        name: 'Pre-Workout Energy Blast',
        subtitle: 'Watermelon Burst Flavour',
        description: 'Explosive pre-workout formula with caffeine, beta-alanine and citrulline for peak performance.',
        price: 1299, discount: 40, finalPrice: fp(1299,40), category: 'fitness', section: 'hot-deals', stock: 45,
        images: [imgs[16], imgs[17]], videos: [], status: 'active', averageRating: 4.6
      },
      {
        name: 'Retinol Night Cream',
        subtitle: 'Wrinkle Repair Formula',
        description: 'Advanced retinol cream with peptides for overnight skin renewal and anti-wrinkle action.',
        price: 1199, discount: 35, finalPrice: fp(1199,35), category: 'skincare', section: 'hot-deals', stock: 55,
        images: [imgs[18], imgs[19]], videos: [], status: 'active', averageRating: 4.4
      },
      {
        name: 'Multivitamin Daily Pack',
        subtitle: '30-Day Supply',
        description: 'Complete daily multivitamin with 23 essential vitamins and minerals for overall health.',
        price: 599, discount: 45, finalPrice: fp(599,45), category: 'supplements', section: 'hot-deals', stock: 180,
        images: [imgs[20], imgs[21]], videos: [], status: 'active', averageRating: 4.3
      },
      {
        name: 'Yoga Mat Premium',
        subtitle: 'Non-Slip 6mm Thick',
        description: 'Eco-friendly TPE yoga mat with alignment lines, non-slip surface and carry strap.',
        price: 1499, discount: 50, finalPrice: fp(1499,50), category: 'fitness', section: 'hot-deals', stock: 30,
        images: [imgs[22], imgs[23]], videos: [], status: 'active', averageRating: 4.7
      },
      {
        name: 'Biotin Hair Growth Gummies',
        subtitle: 'Strawberry Flavour',
        description: 'Delicious biotin gummies with zinc and folic acid for stronger hair and nails.',
        price: 699, discount: 38, finalPrice: fp(699,38), category: 'wellness', section: 'hot-deals', stock: 95,
        images: [imgs[24], imgs[25]], videos: [], status: 'active', averageRating: 4.5
      },
      {
        name: 'Vitamin C Brightening Kit',
        subtitle: 'Serum + Moisturizer Combo',
        description: 'Complete vitamin C skincare duo for radiant, even-toned and protected skin.',
        price: 1599, discount: 42, finalPrice: fp(1599,42), category: 'skincare', section: 'hot-deals', stock: 40,
        images: [imgs[26], imgs[27]], videos: [], status: 'active', averageRating: 4.6
      },
      {
        name: 'Creatine Monohydrate',
        subtitle: 'Unflavoured Pure Form',
        description: 'Micronized creatine monohydrate for increased strength, power and muscle volume.',
        price: 899, discount: 33, finalPrice: fp(899,33), category: 'fitness', section: 'hot-deals', stock: 130,
        images: [imgs[28], imgs[29]], videos: [], status: 'active', averageRating: 4.8
      },
      {
        name: 'Turmeric Curcumin Capsules',
        subtitle: 'With BioPerine for Absorption',
        description: 'High-potency turmeric with 95% curcuminoids and black pepper extract for joint health.',
        price: 649, discount: 28, finalPrice: fp(649,28), category: 'supplements', section: 'hot-deals', stock: 160,
        images: [imgs[30], imgs[31]], videos: [], status: 'active', averageRating: 4.4
      },

      // --- FEATURED (with videos) ---
      {
        name: 'Full Body Massage Gun',
        subtitle: 'Deep Tissue Percussion',
        description: 'Professional-grade massage gun with 6 attachments and 30 speed settings for muscle recovery.',
        price: 3999, discount: 25, finalPrice: fp(3999,25), category: 'fitness', section: 'featured', stock: 25,
        images: [imgs[32], imgs[33]], videos: [vids[0]], status: 'active', averageRating: 4.9
      },
      {
        name: 'Luxury Skincare Bundle',
        subtitle: 'Complete 5-Step Routine',
        description: 'Premium skincare set with cleanser, toner, serum, moisturizer and SPF for flawless skin.',
        price: 4999, discount: 30, finalPrice: fp(4999,30), category: 'skincare', section: 'featured', stock: 20,
        images: [imgs[34], imgs[35]], videos: [vids[1]], status: 'active', averageRating: 4.7
      },
      {
        name: 'Smart Fitness Tracker',
        subtitle: 'Heart Rate + Sleep Monitor',
        description: 'Advanced fitness band with 24/7 heart rate, SpO2, sleep tracking and 7-day battery life.',
        price: 2999, discount: 20, finalPrice: fp(2999,20), category: 'fitness', section: 'featured', stock: 35,
        images: [imgs[0], imgs[2]], videos: [vids[2]], status: 'active', averageRating: 4.6
      },
      {
        name: 'Wellness Starter Kit',
        subtitle: 'Everything You Need',
        description: 'Complete wellness starter pack with supplements, skincare essentials and fitness accessories.',
        price: 5999, discount: 35, finalPrice: fp(5999,35), category: 'wellness', section: 'featured', stock: 15,
        images: [imgs[4], imgs[6]], videos: [vids[3]], status: 'active', averageRating: 4.8
      },
    ];

    await Product.insertMany(products);

    // Upsert settings
    const settingsList = [
      { key: 'announcementMessage', value: '🔥 Mega Sale Live — Up to 50% Off + Free Delivery!' },
      { key: 'siteName', value: 'Wellness Store' },
      { key: 'contactEmail', value: 'support@wellnessstore.com' },
    ];
    for (const s of settingsList) {
      await Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
    }

    console.log('✅ Seed complete! Products with real images created.');
    console.log(`   ${categories.length} categories, ${products.length} products`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
