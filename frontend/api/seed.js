// api/seed.js — run once to populate DB with sample data
// Visit: https://your-app.vercel.app/api/seed to seed
// DELETE THIS FILE after seeding for security

const connectDB = require('./lib/db');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'GET only' });

  // Simple security: require a secret key in query
  if (req.query.key !== process.env.JWT_SECRET?.slice(0, 8)) {
    return res.status(403).json({ message: 'Forbidden. Add ?key=FIRST8CHARSOF_JWT_SECRET' });
  }

  try {
    await connectDB();

    // Models inline
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: String, icon: { type: String, default: '' },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true }));

    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: { type: String, required: true }, subtitle: String,
      description: { type: String, required: true },
      price: Number, discount: { type: Number, default: 0 }, finalPrice: Number,
      category: String, section: { type: String, default: 'trending' },
      sizes: [String], variants: [String], stock: { type: Number, default: 0 },
      images: [String], videos: [String],
      status: { type: String, default: 'active' },
      reviews: [{ user: mongoose.Schema.Types.ObjectId, rating: Number, comment: String, createdAt: { type: Date, default: Date.now } }],
      averageRating: { type: Number, default: 0 }
    }, { timestamps: true }));

    const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
      key: { type: String, required: true, unique: true },
      value: mongoose.Schema.Types.Mixed
    }, { timestamps: true }));

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String, email: { type: String, unique: true }, mobile: { type: String, unique: true },
      password: String, role: { type: String, default: 'user' }, isActive: { type: Boolean, default: true },
      walletBalance: { type: Number, default: 0 }, referralCode: String,
      referredBy: mongoose.Schema.Types.ObjectId, isFirstOrderCompleted: { type: Boolean, default: false }
    }, { timestamps: true }));

    // Clear existing
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Sample Unsplash images (free, no auth needed)
    const imgs = {
      wellness1: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      wellness2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      wellness3: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      wellness4: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400',
      wellness5: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400',
      wellness6: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
      wellness7: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
      wellness8: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
      wellness9: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
      wellness10: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
      wellness11: 'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=400',
      wellness12: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400',
    };

    // Create categories
    const cats = await Category.insertMany([
      { name: 'Supplements', description: 'Health supplements and vitamins', isActive: true },
      { name: 'Fitness', description: 'Fitness equipment and accessories', isActive: true },
      { name: 'Skincare', description: 'Natural skincare products', isActive: true },
      { name: 'Wellness', description: 'General wellness products', isActive: true },
    ]);

    const calc = (price, discount) => price - (price * discount / 100);

    // Create products with Unsplash images
    await Product.insertMany([
      // TRENDING
      { name: 'Vitamin D3 + K2', subtitle: 'Bone & Immunity Support', description: 'High-potency Vitamin D3 with K2 for optimal calcium absorption.', price: 999, discount: 20, finalPrice: calc(999,20), category: 'Supplements', section: 'trending', stock: 120, images: [imgs.wellness1, imgs.wellness2], status: 'active', averageRating: 4.5 },
      { name: 'Organic Whey Protein', subtitle: 'Chocolate Fudge Flavour', description: 'Premium grass-fed whey protein with 25g protein per serving.', price: 1499, discount: 15, finalPrice: calc(1499,15), category: 'Fitness', section: 'trending', stock: 80, images: [imgs.wellness3, imgs.wellness4], status: 'active', averageRating: 4.7 },
      { name: 'Collagen Glow Serum', subtitle: 'Anti-Aging Face Serum', description: 'Marine collagen serum with hyaluronic acid for glowing skin.', price: 799, discount: 10, finalPrice: calc(799,10), category: 'Skincare', section: 'trending', stock: 60, images: [imgs.wellness5, imgs.wellness6], status: 'active', averageRating: 4.3 },
      { name: 'Ashwagandha KSM-66', subtitle: 'Stress Relief & Energy', description: 'Clinically studied ashwagandha root extract for stress and focus.', price: 699, discount: 25, finalPrice: calc(699,25), category: 'Wellness', section: 'trending', stock: 150, images: [imgs.wellness7, imgs.wellness8], status: 'active', averageRating: 4.6 },
      { name: 'Omega-3 Fish Oil', subtitle: 'Heart & Brain Health', description: 'Triple-strength omega-3 with EPA & DHA.', price: 849, discount: 18, finalPrice: calc(849,18), category: 'Supplements', section: 'trending', stock: 90, images: [imgs.wellness9, imgs.wellness10], status: 'active', averageRating: 4.4 },
      { name: 'Niacinamide 10% Serum', subtitle: 'Pore Minimizer', description: 'Dermatologist-tested niacinamide serum for even skin tone.', price: 499, discount: 12, finalPrice: calc(499,12), category: 'Skincare', section: 'trending', stock: 110, images: [imgs.wellness11, imgs.wellness12], status: 'active', averageRating: 4.8 },
      { name: 'Magnesium Glycinate', subtitle: 'Sleep & Recovery', description: 'Highly bioavailable magnesium for deep sleep and muscle relaxation.', price: 749, discount: 22, finalPrice: calc(749,22), category: 'Wellness', section: 'trending', stock: 75, images: [imgs.wellness1, imgs.wellness3], status: 'active', averageRating: 4.5 },
      { name: 'Resistance Band Set', subtitle: '5 Levels of Resistance', description: 'Premium latex resistance bands for home workouts.', price: 599, discount: 30, finalPrice: calc(599,30), category: 'Fitness', section: 'trending', stock: 200, images: [imgs.wellness2, imgs.wellness4], status: 'active', averageRating: 4.2 },
      // HOT DEALS
      { name: 'Pre-Workout Energy', subtitle: 'Watermelon Burst', description: 'Explosive pre-workout with caffeine and citrulline.', price: 1299, discount: 40, finalPrice: calc(1299,40), category: 'Fitness', section: 'hot-deals', stock: 45, images: [imgs.wellness5, imgs.wellness7], status: 'active', averageRating: 4.6 },
      { name: 'Retinol Night Cream', subtitle: 'Wrinkle Repair', description: 'Advanced retinol cream for overnight skin renewal.', price: 1199, discount: 35, finalPrice: calc(1199,35), category: 'Skincare', section: 'hot-deals', stock: 55, images: [imgs.wellness6, imgs.wellness8], status: 'active', averageRating: 4.4 },
      { name: 'Multivitamin Daily Pack', subtitle: '30-Day Supply', description: 'Complete daily multivitamin with 23 essential vitamins.', price: 599, discount: 45, finalPrice: calc(599,45), category: 'Supplements', section: 'hot-deals', stock: 180, images: [imgs.wellness9, imgs.wellness11], status: 'active', averageRating: 4.3 },
      { name: 'Yoga Mat Premium', subtitle: 'Non-Slip 6mm', description: 'Eco-friendly TPE yoga mat with alignment lines.', price: 1499, discount: 50, finalPrice: calc(1499,50), category: 'Fitness', section: 'hot-deals', stock: 30, images: [imgs.wellness10, imgs.wellness12], status: 'active', averageRating: 4.7 },
      { name: 'Biotin Hair Gummies', subtitle: 'Strawberry Flavour', description: 'Biotin gummies with zinc for stronger hair and nails.', price: 699, discount: 38, finalPrice: calc(699,38), category: 'Wellness', section: 'hot-deals', stock: 95, images: [imgs.wellness1, imgs.wellness5], status: 'active', averageRating: 4.5 },
      { name: 'Vitamin C Brightening Kit', subtitle: 'Serum + Moisturizer', description: 'Complete vitamin C skincare duo for radiant skin.', price: 1599, discount: 42, finalPrice: calc(1599,42), category: 'Skincare', section: 'hot-deals', stock: 40, images: [imgs.wellness2, imgs.wellness6], status: 'active', averageRating: 4.6 },
      { name: 'Creatine Monohydrate', subtitle: 'Pure Unflavoured', description: 'Micronized creatine for strength and muscle volume.', price: 899, discount: 33, finalPrice: calc(899,33), category: 'Fitness', section: 'hot-deals', stock: 130, images: [imgs.wellness3, imgs.wellness7], status: 'active', averageRating: 4.8 },
      { name: 'Turmeric Curcumin', subtitle: 'With BioPerine', description: 'High-potency turmeric with black pepper for joint health.', price: 649, discount: 28, finalPrice: calc(649,28), category: 'Supplements', section: 'hot-deals', stock: 160, images: [imgs.wellness4, imgs.wellness8], status: 'active', averageRating: 4.4 },
      // FEATURED
      { name: 'Full Body Massage Gun', subtitle: 'Deep Tissue Percussion', description: 'Professional massage gun with 6 attachments for recovery.', price: 3999, discount: 25, finalPrice: calc(3999,25), category: 'Fitness', section: 'featured', stock: 25, images: [imgs.wellness9, imgs.wellness10], status: 'active', averageRating: 4.9 },
      { name: 'Luxury Skincare Bundle', subtitle: '5-Step Routine', description: 'Premium skincare set with cleanser, toner, serum, moisturizer.', price: 4999, discount: 30, finalPrice: calc(4999,30), category: 'Skincare', section: 'featured', stock: 20, images: [imgs.wellness11, imgs.wellness12], status: 'active', averageRating: 4.7 },
      { name: 'Smart Fitness Tracker', subtitle: 'Heart Rate + Sleep', description: 'Advanced fitness band with SpO2 and 7-day battery.', price: 2999, discount: 20, finalPrice: calc(2999,20), category: 'Fitness', section: 'featured', stock: 35, images: [imgs.wellness1, imgs.wellness2], status: 'active', averageRating: 4.6 },
      { name: 'Wellness Starter Kit', subtitle: 'Everything You Need', description: 'Complete wellness pack with supplements and skincare essentials.', price: 5999, discount: 35, finalPrice: calc(5999,35), category: 'Wellness', section: 'featured', stock: 15, images: [imgs.wellness3, imgs.wellness4], status: 'active', averageRating: 4.8 },
    ]);

    // Upsert settings
    await Settings.findOneAndUpdate({ key: 'announcementMessage' }, { key: 'announcementMessage', value: '🔥 Mega Sale Live — Up to 50% Off + Free Delivery!' }, { upsert: true });
    await Settings.findOneAndUpdate({ key: 'siteName' }, { key: 'siteName', value: 'Wellness Store' }, { upsert: true });

    // Create admin if not exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 12);
      await User.create({ name: 'Admin', email: 'admin@admin.com', mobile: '1111111111', password: hashed, role: 'admin' });
    }

    return res.json({
      success: true,
      message: '✅ Database seeded successfully!',
      data: { categories: 4, products: 20, admin: 'admin@admin.com / admin123' }
    });

  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
