const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },
  category: { type: String, required: true },
  section: { type: String, default: 'trending' },
  sizes: [{ type: String }],
  variants: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  videos: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  this.finalPrice = this.price - (this.price * this.discount / 100);
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.price !== undefined || update.discount !== undefined) {
    const price = parseFloat(update.price) || 0;
    const discount = parseFloat(update.discount) || 0;
    update.finalPrice = price - (price * discount / 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);