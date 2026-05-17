// Run once: node fix-products.js
// Fixes all products missing finalPrice in the database
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ $or: [{ finalPrice: null }, { finalPrice: { $exists: false } }] });
  console.log(`Found ${products.length} products missing finalPrice`);
  for (const p of products) {
    p.finalPrice = p.price - (p.price * (p.discount || 0) / 100);
    await p.save();
  }
  console.log('Done. All products updated.');
  mongoose.connection.close();
}).catch(err => { console.error(err); process.exit(1); });
