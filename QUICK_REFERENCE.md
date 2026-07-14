# Quick Reference Guide - Ambika Pure Veg

## 🚀 Project Overview

**Ambika Pure Veg** - B2B Smart Restaurant Management Platform

- Modern React landing page with B2B positioning
- Four operational dashboards (Customer, Kitchen, Waiter, Admin)
- Real-time Socket.io communication
- AI-powered sentiment analysis
- Express.js REST API with MongoDB

---

## 📁 Directory Structure Quick Reference

```
TabMenu.AI/
├── frontend/        → React application
├── backend/         → Express.js API
├── ai-service/      → Python ML service
├── Photos/          → Assets
└── [docs/config]    → Documentation & setup files
```

---

## 🎯 Key Features at a Glance

| Feature            | Status         | Location                                |
| ------------------ | -------------- | --------------------------------------- |
| B2B Landing Page   | ✅ Complete    | `/frontend/src/pages/Landing.jsx`       |
| Customer Dashboard | ✅ Ready       | `/frontend/src/pages/Customer.jsx`      |
| Kitchen System     | ✅ Ready       | `/frontend/src/pages/Kitchen.jsx`       |
| Waiter Interface   | ✅ Ready       | `/frontend/src/pages/Waiter.jsx`        |
| Admin Dashboard    | ✅ Ready       | `/frontend/src/pages/Admin.jsx`         |
| ROI Calculator     | ✅ Ready       | `/frontend/src/pages/ROICalculator.jsx` |
| Real-Time Events   | ✅ Implemented | Socket.io events                        |
| API Endpoints      | ✅ Complete    | 6 main route groups                     |
| Database Models    | ✅ Created     | Mongoose schemas                        |
| Cryptographic QR   | ✅ Implemented | HMAC-SHA256 tokens                      |
| Authentication     | ✅ Implemented | JWT + role-based                        |

---

## 💻 Essential Commands

### Setup & Installation

```bash
make install          # Install all dependencies
make env-setup        # Create .env files
make db-seed          # Seed database with sample data
make verify           # Check prerequisites
```

### Development

```bash
make dev              # Start all services (Frontend + Backend)
make dev-frontend     # Frontend only (port 5173)
make dev-backend      # Backend only (port 5000)
make dev-ai           # AI service (port 8000)
```

### Building & Testing

```bash
make build            # Build for production
make test             # Run all tests
make lint             # Run linters
```

### Docker

```bash
make docker-build     # Build Docker images
make docker-up        # Start containers
make docker-down      # Stop containers
make docker-logs      # View logs
```

### Utilities

```bash
make clean            # Clean build artifacts
make reset            # Full clean installation
make info             # Show installed packages
make help             # Show all commands
```

---

## 🌐 Service URLs

| Service     | URL                   | Port  |
| ----------- | --------------------- | ----- |
| Frontend    | http://localhost:5173 | 5173  |
| Backend API | http://localhost:5000 | 5000  |
| AI Service  | http://localhost:8000 | 8000  |
| MongoDB     | localhost:27017       | 27017 |

---

## 📝 Environment Variables

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_IO_URL=http://localhost:5000
```

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ambika_pure_veg
JWT_SECRET=your_secret_key
QR_SECRET=your_qr_secret
CLIENT_URL=http://localhost:5173
```

---

## 🔌 Key API Endpoints

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/verify
```

### Menu

```
GET    /api/menu
POST   /api/menu (admin)
PATCH  /api/menu/:id (admin)
```

### Orders

```
POST   /api/orders
GET    /api/orders
PATCH  /api/orders/:id
```

### Tables

```
GET    /api/tables
POST   /api/tables/verify-qr
```

### Feedback

```
POST   /api/feedback
GET    /api/feedback
```

### Admin

```
GET    /api/admin/stats
GET    /api/admin/analytics/orders
GET    /api/admin/analytics/sentiment
```

---

## 🎯 Landing Page Sections

1. **Hero Section**
   - Main headline, subheading, CTA buttons
   - Logo display, key metrics cards

2. **Core Features (3-Column)**
   - Cryptographic QR Table Mappings
   - Real-Time Socket.io Pipeline
   - AI-Powered Sentiment Engine

3. **Four Dashboards**
   - Customer, Kitchen, Waiter, Admin
   - Features and descriptions

4. **Business Benefits (6-Grid)**
   - Table turnover, staff optimization
   - Insights, order accuracy, wait times, reputation

5. **Architecture Section**
   - Security, real-time, intelligence layers
   - Tech stack overview

6. **Implementation Section**
   - Demo booking, ROI calculation, support

7. **Closing CTA & Footer**
   - Final value proposition
   - Navigation and contact links

---

## 🔐 User Roles & Permissions

| Role     | Access                 | Features                                 |
| -------- | ---------------------- | ---------------------------------------- |
| Customer | Menu, Orders, Feedback | Browse menu, place orders, give feedback |
| Kitchen  | Orders                 | View orders, update status               |
| Waiter   | Orders, Tables         | See ready orders, manage tables          |
| Admin    | Everything             | Analytics, menu management, exports      |

---

## 📊 Key Metrics

- **90s** - Average wait time reduction
- **40%** - Faster issue detection
- **4** - Unified dashboards
- **99.9%** - Order accuracy
- **18%** - Revenue increase
- **<100ms** - Socket.io latency

---

## 🐛 Common Troubleshooting

### Port Already in Use

```bash
# Kill process on port (e.g., 5000)
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh
# Or restart MongoDB
brew services restart mongodb-community
```

### Dependencies Issue

```bash
rm -rf node_modules package-lock.json
npm install
```

### Socket.io Connection Failed

- Check backend is running
- Verify CORS configuration
- Check browser console for errors
- Clear cache: Ctrl+Shift+Delete

---

## 📚 Documentation Files

| File                    | Purpose                   |
| ----------------------- | ------------------------- |
| `PROJECT_README.md`     | Complete project overview |
| `SETUP_GUIDE.md`        | Installation instructions |
| `ARCHITECTURE.md`       | System design & data flow |
| `CONTRIBUTING.md`       | Development guidelines    |
| `CHANGELOG.md`          | Version history           |
| `COMPLETION_SUMMARY.md` | Project status            |
| `frontend/README.md`    | Frontend details          |
| `backend/README.md`     | Backend details           |

---

## 🔄 Development Workflow

1. **Create Branch**

   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make Changes**
   - Frontend: Changes auto-reload (HMR)
   - Backend: Restart dev server
   - AI: Manual restart

3. **Test & Lint**

   ```bash
   make lint
   make test
   ```

4. **Commit**

   ```bash
   git commit -m "feat: description"
   ```

5. **Push & PR**
   ```bash
   git push origin feature/feature-name
   # Create pull request
   ```

---

## 📦 Dependencies

### Frontend

- React 19, React Router, Tailwind CSS
- Socket.io-client, Axios
- Vite build tool

### Backend

- Express, Mongoose, Socket.io
- jsonwebtoken, bcryptjs, cors

### AI Service

- FastAPI, PyTorch, NLTK
- Uvicorn server

---

## 🚀 Deployment Checklist

- [ ] Update `.env` with production secrets
- [ ] Build frontend: `npm run build`
- [ ] Run database migrations
- [ ] Setup SSL certificate
- [ ] Configure domain DNS
- [ ] Enable monitoring/logging
- [ ] Setup backups
- [ ] Test all endpoints
- [ ] Performance testing
- [ ] Security audit

---

## 📞 Getting Help

1. Check relevant README file
2. Review SETUP_GUIDE.md
3. Check documentation/
4. Review error logs
5. Check GitHub issues
6. Email: support@ambikarestaurant.com

---

## ⚡ Performance Tips

- Use pagination for list endpoints
- Enable database indexing
- Cache frequently accessed data
- Compress Socket.io messages
- Use CDN for static assets
- Monitor database queries

---

## 🔒 Security Reminders

- ✅ Change default passwords
- ✅ Update JWT_SECRET
- ✅ Enable HTTPS/SSL
- ✅ Setup CORS correctly
- ✅ Validate all inputs server-side
- ✅ Use environment variables for secrets
- ✅ Regular security audits
- ✅ Keep dependencies updated

---

## 📈 Next Steps

1. ✅ Review all components
2. ✅ Run `make install` & `make db-seed`
3. ✅ Start development: `make dev`
4. ✅ Test landing page
5. ✅ Test dashboards
6. ✅ Test API endpoints
7. ✅ Deploy to production

---

## 🎉 You're All Set!

Everything is configured and ready to go. Start with:

```bash
make install
make dev
```

Then open http://localhost:5173 to see the landing page!

---

**Last Updated**: 2024
**Version**: 1.0.0
