# Ambika Pure Veg - Complete Setup Guide

Step-by-step instructions to set up the entire B2B restaurant management platform on your local machine or deploy to production.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: v4.4 or higher
- **Python**: v3.9 or higher (for AI service)
- **Git**: Latest version
- **Docker** (optional): For containerized deployment

## 📋 System Requirements

### Development Machine

- RAM: 8GB minimum (16GB recommended)
- Disk Space: 2GB for all services
- Network: Stable internet connection for npm/pip installations

### Supported Operating Systems

- macOS 11+
- Ubuntu 20.04+
- Windows 10/11 (with WSL2 recommended)

## 🚀 Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd TabMenu.AI
```

### 2. MongoDB Setup

#### Option A: Local MongoDB Installation

**macOS (Homebrew)**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian**

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Windows**

- Download MongoDB Community Edition installer
- Run installer and follow setup wizard
- MongoDB will start automatically

**Verify Connection**

```bash
mongosh
# Should connect to default database
```

#### Option B: Using Docker

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:7.0
```

#### Option C: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
4. Update `MONGODB_URI` in `.env` files

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start server (should run on http://localhost:5000)
npm start
```

**Verify Backend**

```bash
curl http://localhost:5000/api/health
# Should return: { "status": "ok", "service": "Ambika Pure Veg API" }
```

### 4. Frontend Setup

```bash
cd ../frontend

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start development server (should run on http://localhost:5173)
npm run dev
```

**Verify Frontend**

- Open browser to `http://localhost:5173`
- Should see Ambika Pure Veg landing page

### 5. AI Service Setup (Optional)

```bash
cd ../ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service (should run on http://localhost:8000)
python main.py
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`
- AI Service: `http://localhost:8000`

### Custom Docker Setup

#### Build individual services

**Backend**

```bash
cd backend
docker build -t ambika-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/ambika_pure_veg \
  ambika-backend
```

**Frontend**

```bash
cd frontend
docker build -t ambika-frontend .
docker run -p 5173:5173 ambika-frontend
```

**AI Service**

```bash
cd ai-service
docker build -t ambika-ai .
docker run -p 8000:8000 ambika-ai
```

## ⚙️ Configuration

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/ambika_pure_veg

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
QR_SECRET=your_qr_token_secret_here

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_IO_URL=http://localhost:5000
```

### AI Service Environment Variables

Set as environment variables or in `.env` in `ai-service/`:

```env
PORT=8000
MODEL_PATH=./models
LOG_LEVEL=INFO
```

## 🧪 Testing the Setup

### Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test menu endpoint
curl http://localhost:5000/api/menu

# Create test user (register)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "customer"
  }'
```

### Test Frontend

1. Open `http://localhost:5173` in browser
2. Verify all pages load:
   - Landing page
   - Customer demo
   - ROI calculator
   - Admin dashboard
3. Check console for any errors

### Test Real-Time Communication

1. Open customer demo at `/customer`
2. Check browser DevTools → Network
3. Should see Socket.io connection established
4. Create an order - should see real-time updates

## 📊 Sample Data

Database is automatically seeded with:

- 3 menu categories (Appetizers, Mains, Desserts)
- 12 menu items with pricing
- 10 sample tables
- Demo admin user

**Demo Credentials:**

- Email: `admin@ambika.com`
- Password: `admin123`

Access admin dashboard at: `http://localhost:5173/admin`

## 🔄 Development Workflow

### Running Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 3 - AI Service:**

```bash
cd ai-service
source venv/bin/activate
python main.py
```

### Making Code Changes

- **Frontend**: Changes auto-reload via Vite HMR
- **Backend**: Use `npm run dev` for automatic restart
- **AI**: Restart service manually after changes

### Debugging

**Backend Debugging**

```bash
# Start with Node debugger
node --inspect server.js

# Open chrome://inspect to debug
```

**Frontend Debugging**

- Press F12 to open DevTools
- Console shows React warnings
- Network tab shows API calls

## 🚀 Production Deployment

### Deploy to VPS (Ubuntu)

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repo-url>
cd TabMenu.AI

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Build and start
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy to Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create ambika-restaurant

# Set environment variables
heroku config:set NODE_ENV=production MONGODB_URI=<your-mongodb-url>

# Deploy
git push heroku main
```

#### AWS

```bash
# Use AWS Elastic Beanstalk
eb create ambika-env
eb deploy
```

#### Digital Ocean

- Use App Platform
- Connect GitHub repo
- Auto-deploy on push
- Select Node.js runtime

### Domain Setup

1. Purchase domain (namecheap.com, godaddy.com, etc.)
2. Configure DNS records to point to your server
3. Setup SSL certificate (Let's Encrypt):
   ```bash
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   ```

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Update `JWT_SECRET` to strong random string
- [ ] Enable HTTPS on production
- [ ] Setup firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets (not .env)
- [ ] Enable rate limiting on API
- [ ] Setup monitoring and logging
- [ ] Regular backups of MongoDB
- [ ] Security headers configuration

## 📈 Performance Tuning

### MongoDB Optimization

```javascript
// Create indexes
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ tableId: 1 });
db.feedback.createIndex({ sentiment: 1 });
```

### Node.js Optimization

```bash
# Use PM2 for process management
npm install -g pm2
pm2 start server.js -i max
pm2 logs
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
    }

    location / {
        proxy_pass http://localhost:5173;
    }
}
```

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB status
mongosh

# If connection fails, restart MongoDB
sudo systemctl restart mongodb
```

### Socket.io Connection Issues

- Clear browser cache (Ctrl+Shift+Delete)
- Check CORS configuration
- Verify backend is running
- Check firewall/network settings

### npm Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. Read [PROJECT_README.md](./PROJECT_README.md) for architecture overview
2. Review [Backend README](./backend/README.md) for API documentation
3. Check [Frontend README](./frontend/README.md) for component details
4. Explore AI service implementation in `ai-service/`

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected and seeded
- [ ] API health check passing
- [ ] Socket.io connection established
- [ ] Landing page displaying correctly
- [ ] Customer demo functional
- [ ] ROI calculator working
- [ ] Admin dashboard accessible
- [ ] Real-time updates working

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Review error logs: `docker-compose logs`
3. Check GitHub issues
4. Contact support@ambika.com

---

**Version**: 1.0.0
**Last Updated**: 2024
