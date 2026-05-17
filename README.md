# Wellness Store - Full-Stack E-commerce Application

A modern, scalable e-commerce platform built with Next.js, Node.js, Express, and MongoDB. Features include user authentication, product management, order tracking, admin panel, and responsive design.

## 🚀 Features

### User Features
- **Authentication**: Email/Mobile + Password login/signup with JWT
- **Product Browsing**: Search, filter by category, trending/hot deals sections
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders, track status, view history
- **Product Reviews**: Rate and review products
- **Responsive Design**: Mobile-first, works on all devices

### Admin Features
- **Dashboard**: Analytics, sales overview, user metrics
- **Product Management**: CRUD operations, image/video uploads
- **Order Management**: Update status, tracking information
- **User Management**: View users, activate/deactivate accounts
- **Category Management**: Create and manage product categories
- **Settings**: Dynamic announcement bar, site configuration

### Technical Features
- **Docker Ready**: Complete containerization with Docker Compose
- **File Uploads**: Support for product images and videos
- **Real-time Updates**: Order status tracking
- **SEO Optimized**: Next.js with proper meta tags
- **Security**: JWT authentication, input validation, CORS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Containerization**: Docker, Docker Compose
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
wellness-store/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── login/
│   │   ├── products/
│   │   ├── orders/
│   │   └── cart/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd wellness-store
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Option 2: Manual Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd wellness-store
npm install
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Setup MongoDB**
- Install MongoDB locally or use MongoDB Atlas
- Update connection string in backend/.env

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wellness_store
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 👤 Default Admin Account

After starting the application, create an admin account:

1. Register a new user at `/login`
2. Manually update the user's role to 'admin' in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## 🎨 UI Components

### Key Components
- **AnnouncementBar**: Dynamic top banner
- **Navbar**: Responsive navigation with search
- **ProductCard**: Product display with ratings
- **Footer**: Links and social media
- **Admin Layout**: Protected admin interface

### Pages
- **Home**: Hero, trending products, hot deals, reviews
- **Login**: Authentication with email/mobile support
- **Products**: Product listing with filters
- **Product Detail**: Individual product view
- **Cart**: Shopping cart management
- **Orders**: Order history and tracking
- **Admin Dashboard**: Analytics and management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- File upload restrictions
- Admin route protection
- SQL injection prevention (NoSQL)

## 📦 Deployment

### Docker Production
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Set production environment variables
3. Start backend: `cd backend && npm start`
4. Serve frontend with a web server (Nginx, Apache)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Performance Optimizations

- Image optimization with Next.js
- Lazy loading for product images
- MongoDB indexing for search
- Caching strategies
- Minified production builds
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@wellnessstore.com

## 🔄 Updates & Roadmap

### Current Version: 1.0.0
- ✅ Full e-commerce functionality
- ✅ Admin panel
- ✅ Docker support
- ✅ Responsive design

### Upcoming Features
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] PWA capabilities
- [ ] Real-time chat support

---

**Built with ❤️ for modern e-commerce needs**