// api/products/[...params].js — handles all /api/products/* routes
const connectDB = require('../lib/db');
const Product = require('../models/Product');
const { getAuthUser, requireAdmin, withErrorHandler } = require('../middleware/auth');
const { uploadToCloudinary } = require('../lib/cloudinary');
const formidable = require('formidable');
const fs = require('fs');

// Disable Next.js body parser so formidable can handle multipart
export const config = { api: { bodyParser: false } };

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, maxFileSize: 50 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function uploadFiles(files, fieldName) {
  const fileList = Array.isArray(files[fieldName]) ? files[fieldName] : files[fieldName] ? [files[fieldName]] : [];
  const urls = [];
  for (const file of fileList) {
    const buffer = fs.readFileSync(file.filepath);
    const isVideo = file.mimetype?.startsWith('video');
    const url = await uploadToCloudinary(buffer, 'wellness-store', isVideo ? 'video' : 'image');
    urls.push(url);
  }
  return urls;
}

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const params = req.query.params || [];
  const [id, sub] = params; // e.g. [productId, 'reviews']

  // GET /api/products — list with filters
  if (req.method === 'GET' && !id) {
    const { category, section, search, rating, page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    if (section) query.section = section;
    if (rating) query.averageRating = { $gte: parseFloat(rating) };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Product.countDocuments(query);
    return res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page, total });
  }

  // GET /api/products/:id
  if (req.method === 'GET' && id && !sub) {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  }

  // POST /api/products — create (admin)
  if (req.method === 'POST' && !id) {
    await requireAdmin(req);
    const { fields, files } = await parseForm(req);
    const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    if (data.sizes) data.sizes = JSON.parse(data.sizes);
    if (data.variants) data.variants = JSON.parse(data.variants);
    data.images = await uploadFiles(files, 'images');
    data.videos = await uploadFiles(files, 'videos');
    data.finalPrice = parseFloat(data.price) - (parseFloat(data.price) * parseFloat(data.discount || 0) / 100);
    const product = await Product.create(data);
    return res.status(201).json({ message: 'Product created', product });
  }

  // PUT /api/products/:id — update (admin)
  if (req.method === 'PUT' && id && !sub) {
    await requireAdmin(req);
    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const { fields, files } = await parseForm(req);
    const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    if (data.sizes) data.sizes = JSON.parse(data.sizes);
    if (data.variants) data.variants = JSON.parse(data.variants);
    const newImages = await uploadFiles(files, 'images');
    const newVideos = await uploadFiles(files, 'videos');
    if (newImages.length) data.images = [...existing.images, ...newImages];
    if (newVideos.length) data.videos = [...existing.videos, ...newVideos];
    if (data.price) data.finalPrice = parseFloat(data.price) - (parseFloat(data.price) * parseFloat(data.discount || 0) / 100);
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    return res.json({ message: 'Product updated', product });
  }

  // DELETE /api/products/:id — delete (admin)
  if (req.method === 'DELETE' && id && !sub) {
    await requireAdmin(req);
    await Product.findByIdAndDelete(id);
    return res.json({ message: 'Product deleted' });
  }

  // POST /api/products/:id/reviews — add review
  if (req.method === 'POST' && id && sub === 'reviews') {
    const user = await getAuthUser(req);
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const already = product.reviews.find(r => r.user.toString() === user._id.toString());
    if (already) return res.status(400).json({ message: 'You already reviewed this product' });
    const { rating, comment } = req.body;
    product.reviews.push({ user: user._id, rating, comment });
    product.averageRating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
    await product.save();
    return res.json({ message: 'Review added' });
  }

  // DELETE /api/products/:productId/reviews/:reviewId
  if (req.method === 'DELETE' && id && sub === 'reviews' && params[2]) {
    await requireAdmin(req);
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.reviews = product.reviews.filter(r => r._id.toString() !== params[2]);
    product.averageRating = product.reviews.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;
    await product.save();
    return res.json({ message: 'Review deleted' });
  }

  res.status(404).json({ message: 'Route not found' });
});
