require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

// Step 1: login to get token
function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ identifier: 'admin@admin.com', password: 'admin123' });
    const req = http.request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login',
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Step 2: upload category with icon
function uploadCategory(token) {
  return new Promise((resolve, reject) => {
    // Use an existing uploaded file as test icon
    const filePath = path.join(__dirname, 'uploads', 'categories', '1779029868107.avif');
    const fileContent = fs.readFileSync(filePath);
    const boundary = '----TestBoundary123';
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="name"\r\n\r\n`;
    body += `TestCategoryDirect\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="icon"; filename="test.avif"\r\n`;
    body += `Content-Type: image/avif\r\n\r\n`;
    
    const bodyStart = Buffer.from(body);
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([bodyStart, fileContent, bodyEnd]);

    const req = http.request({
      hostname: 'localhost', port: 5000, path: '/api/categories',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    }, res => {
      let respBody = '';
      res.on('data', d => respBody += d);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', respBody);
        resolve(JSON.parse(respBody));
      });
    });
    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

async function run() {
  try {
    console.log('1. Logging in...');
    const loginRes = await login();
    if (!loginRes.token) { console.error('Login failed:', loginRes); return; }
    console.log('   Token obtained');

    console.log('2. Uploading category with icon...');
    const catRes = await uploadCategory(loginRes.token);
    
    if (catRes.data) {
      console.log('   Category created:', catRes.data.name, '| icon:', catRes.data.icon || 'EMPTY - NOT SAVED');
    }

    // Cleanup
    if (catRes.data?._id) {
      const mongoose = require('mongoose');
      const Category = require('./models/Category');
      await mongoose.connect(process.env.MONGODB_URI);
      const raw = await Category.findById(catRes.data._id).lean();
      console.log('3. Raw DB record icon:', raw?.icon || 'EMPTY');
      await Category.findByIdAndDelete(catRes.data._id);
      mongoose.disconnect();
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

run();
