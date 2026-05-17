const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, section, search, rating, page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (section) query.section = section;
    if (rating) query.averageRating = { $gte: parseFloat(rating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (Admin only)
router.post('/', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    if (req.files && req.files.images) {
      productData.images = req.files.images.map(file => file.filename);
    }
    if (req.files && req.files.videos) {
      productData.videos = req.files.videos.map(file => file.filename);
    }

    if (productData.sizes) {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (productData.variants) {
      productData.variants = JSON.parse(productData.variants);
    }

    // Calculate finalPrice
    const price = parseFloat(productData.price) || 0;
    const discount = parseFloat(productData.discount) || 0;
    productData.finalPrice = price - (price * discount / 100);

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', adminAuth, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = { ...req.body };
    
    if (req.files && req.files.images) {
      productData.images = [...existingProduct.images, ...req.files.images.map(file => file.filename)];
    }
    if (req.files && req.files.videos) {
      productData.videos = [...existingProduct.videos, ...req.files.videos.map(file => file.filename)];
    }

    if (productData.sizes) {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (productData.variants) {
      productData.variants = JSON.parse(productData.variants);
    }

    // Calculate finalPrice if price or discount is provided
    if (productData.price || productData.discount !== undefined) {
      const price = parseFloat(productData.price) || 0;
      const discount = parseFloat(productData.discount) || 0;
      productData.finalPrice = price - (price * discount / 100);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    ).populate('category', 'name');

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add review
router.post('/:id/reviews', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const reviewData = {
      user: req.user._id,
      rating,
      comment
    };

    if (req.files && req.files.length > 0) {
      reviewData.images = req.files.map(file => file.filename);
    }

    product.reviews.push(reviewData);

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;

    await product.save();
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete review (Admin only)
router.delete('/:productId/reviews/:reviewId', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.reviews = product.reviews.filter(review => review._id.toString() !== req.params.reviewId);
    
    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / product.reviews.length;
    } else {
      product.averageRating = 0;
    }

    await product.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;