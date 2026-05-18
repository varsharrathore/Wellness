// api/categories/[...params].js
const connectDB = require('../lib/db');
const Category = require('../models/Category');
const { requireAdmin, withErrorHandler } = require('../middleware/auth');
const { uploadToCloudinary } = require('../lib/cloudinary');
const formidable = require('formidable');
const fs = require('fs');

export const config = { api: { bodyParser: false } };

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
  });
}

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const params = req.query.params || [];
  const [id] = params;

  // GET /api/categories
  if (req.method === 'GET' && !id) {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.json({ data: categories });
  }

  // POST /api/categories (admin)
  if (req.method === 'POST' && !id) {
    await requireAdmin(req);
    const { fields, files } = await parseForm(req);
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    let icon = '';
    if (files.icon) {
      const file = Array.isArray(files.icon) ? files.icon[0] : files.icon;
      icon = await uploadToCloudinary(fs.readFileSync(file.filepath), 'wellness-categories', 'image');
    }
    const category = await Category.create({ name, description, icon });
    return res.status(201).json({ message: 'Category created', category });
  }

  // PUT /api/categories/:id (admin)
  if (req.method === 'PUT' && id) {
    await requireAdmin(req);
    const { fields, files } = await parseForm(req);
    const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    if (files.icon) {
      const file = Array.isArray(files.icon) ? files.icon[0] : files.icon;
      data.icon = await uploadToCloudinary(fs.readFileSync(file.filepath), 'wellness-categories', 'image');
    }
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    return res.json({ message: 'Category updated', category });
  }

  // DELETE /api/categories/:id (admin)
  if (req.method === 'DELETE' && id) {
    await requireAdmin(req);
    await Category.findByIdAndDelete(id);
    return res.json({ message: 'Category deleted' });
  }

  res.status(404).json({ message: 'Route not found' });
});
