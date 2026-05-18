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
  images: [{ type: String }],   // Cloudinary URLs in production
  videos: [{ type: String }],   // Cloudinary URLs in production
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

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
