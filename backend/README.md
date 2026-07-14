# Backend - Ambika Pure Veg API Server

Express.js RESTful API with Socket.io real-time communication, MongoDB persistence, and JWT authentication.

## 🚀 Quick Start

### Setup

```bash
npm install
cp .env.example .env
npm run seed  # Load sample data
npm start     # Start server
```

Server runs on `http://localhost:5000`

## 📚 API Routes

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /verify` - Verify token

### Menu (`/api/menu`)

- `GET /` - Get all menu items
- `GET /:id` - Get single item
- `POST /` - Create menu item (Admin)
- `PATCH /:id` - Update menu item (Admin)
- `DELETE /:id` - Delete menu item (Admin)

### Tables (`/api/tables`)

- `GET /` - Get all tables
- `GET /:id` - Get table details
- `POST /verify-qr` - Verify QR token
- `PATCH /:id` - Update table status

### Orders (`/api/orders`)

- `POST /` - Create order
- `GET /` - Get orders (paginated)
- `GET /:id` - Get order details
- `PATCH /:id` - Update order status
- `GET /table/:tableId` - Get table orders

### Feedback (`/api/feedback`)

- `POST /` - Submit feedback
- `GET /` - Get all feedback (Admin)
- `GET /table/:tableId` - Get table feedback

### Admin (`/api/admin`)

- `GET /stats` - Dashboard statistics
- `GET /analytics/orders` - Order analytics
- `GET /analytics/tables` - Table analytics
- `GET /analytics/sentiment` - Sentiment analysis
- `GET /export` - Export data

## 🔌 Socket.io Events

### Kitchen Events

- `kitchen:order_received` - New order for kitchen
- `kitchen:order_start` - Kitchen starts order
- `kitchen:order_ready` - Order ready for serving

### Order Events

- `order:created` - New order created
- `order:updated` - Order status updated
- `order:completed` - Order completed

### Table Events

- `table:status_changed` - Table availability changed

### Admin Events

- `admin:dashboard_update` - Dashboard stats updated
- `admin:analytics_update` - Analytics updated

## 🗄️ Database Models

### User

```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (admin|kitchen|waiter|customer),
  name: String,
  createdAt: Date
}
```

### MenuItem

```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  ingredients: [String],
  isVegetarian: Boolean,
  prepTime: Number,
  createdAt: Date
}
```

### Order

```javascript
{
  tableId: ObjectId,
  items: [{menuId, quantity, specialRequests}],
  status: String (pending|confirmed|preparing|ready|served|completed),
  totalAmount: Number,
  createdAt: Date,
  completedAt: Date
}
```

### Table

```javascript
{
  tableNumber: Number,
  capacity: Number,
  qrToken: String,
  status: String (available|occupied|reserved|maintenance),
  zone: String,
  createdAt: Date
}
```

### Feedback

```javascript
{
  orderId: ObjectId,
  rating: Number (1-5),
  comment: String,
  sentiment: String (positive|negative|neutral),
  confidence: Number,
  issues: [String],
  createdAt: Date
}
```

## 🔐 Authentication

JWT tokens are passed via `Authorization: Bearer <token>` header.

```javascript
// Get token
POST /api/auth/login
Body: { email: "user@example.com", password: "password" }

// Verify token
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
```

## 🧪 Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📊 Performance Tips

- Use pagination for list endpoints: `?page=1&limit=20`
- Enable caching for menu items
- Index frequently queried fields in MongoDB
- Implement rate limiting for public endpoints

## 🐛 Common Issues

**Port Already in Use**

```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB Connection Error**

- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify connection string format

**Socket.io Connection Issues**

- Check CORS settings in server.js
- Verify CLIENT_URL environment variable
- Check network/firewall settings

## 📝 Development

### File Structure

```
backend/
├── routes/              # API route handlers
├── models/              # Mongoose schemas
├── middleware/          # Auth, validation, etc
├── config/              # Database & config
├── utils/               # Helper functions
├── server.js            # Main server file
├── package.json
└── .env.example
```

### Adding New Routes

1. Create route file in `routes/`
2. Define route handlers with validation
3. Import in `server.js`
4. Test with Postman/curl

### Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ambika_pure_veg
JWT_SECRET=your_secret_key
QR_SECRET=your_qr_secret
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ORM
- socket.io - Real-time communication
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - Cross-origin support
- dotenv - Environment variables

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

For Docker deployment, see project root `docker-compose.yml`

---

**Version**: 1.0.0
