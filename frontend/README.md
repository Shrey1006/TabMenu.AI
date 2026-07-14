# Frontend - Ambika Pure Veg B2B Landing Page & Dashboards

Modern React 19 application with Tailwind CSS, featuring responsive B2B landing page, ROI calculator, and four specialized operational dashboards.

## 🚀 Quick Start

### Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Application runs on `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx           # B2B landing page
│   │   ├── Customer.jsx          # Customer ordering portal
│   │   ├── Kitchen.jsx           # Kitchen display system
│   │   ├── Waiter.jsx            # Waiter coordination
│   │   ├── Admin.jsx             # Admin dashboard
│   │   ├── ROICalculator.jsx     # ROI projection tool
│   │   └── Login.jsx             # Staff authentication
│   │
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation header
│   │   ├── Footer.jsx            # Footer component
│   │   ├── FeatureCard.jsx       # Feature showcase card
│   │   ├── DashboardCard.jsx     # Dashboard link card
│   │   ├── BenefitCard.jsx       # Business benefit card
│   │   └── StatCard.jsx          # Statistics display
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state
│   │   └── SocketContext.jsx     # Socket.io state
│   │
│   ├── lib/
│   │   ├── api.js                # Axios API client
│   │   └── socket.js             # Socket.io service
│   │
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # React entry point
│   ├── App.css                   # Global styles
│   └── index.css                 # Tailwind configuration
│
├── package.json
├── vite.config.js
└── .env.example
```

## 📄 Page Overview

### Landing Page

- Hero section with CTA buttons
- Technical metrics showcase
- Core features (3-column layout)
- Four operational dashboards
- Business benefits grid
- Architecture overview
- Implementation timeline
- Closing CTA section
- Footer

### Customer Portal

- Digital menu browsing
- Dietary preference filtering
- Real-time order placement
- Live order tracking
- Feedback submission

### Kitchen Display System (KDS)

- Priority-ordered ticket queue
- Live preparation timers
- Ingredient tracking
- Order status management
- Peak rush tools

### Waiter Interface

- Service ready-to-serve alerts
- Table assignment mapping
- Customer requests
- Service coordination
- Guest communication

### Admin Dashboard

- Real-time analytics
- Table utilization metrics
- Staff performance tracking
- Revenue analytics
- Sentiment monitoring

### ROI Calculator

- Custom metrics input
- Revenue projections
- Payback period calculation
- Comparative analysis

## 🎨 Styling

### Tailwind CSS Configuration

- Custom brand colors (green theme for pure veg)
- Responsive breakpoints (mobile-first)
- Custom animations (pulse-ring effect)
- Semantic color palette

### Theme Colors

```css
brand-50: #f0fdf4   (light green)
brand-600: #16a34a  (primary green)
brand-700: #15803d  (dark green)
warm-50: #fffbeb    (cream)
warm-600: #d97706   (orange)
```

## 🔌 Real-Time Features

### Socket.io Integration

```javascript
import socketService from "@/lib/socket.js";

// Connect to Socket.io
socketService.connect("customer", tableId);

// Listen to events
socketService.orderUpdated((order) => {
  console.log("Order updated:", order);
});

// Emit events
socketService.broadcastOrderStatus(orderId, "ready");
```

## 🌐 API Integration

### Authentication

```javascript
import { authAPI } from "@/lib/api.js";

// Login
const { data } = await authAPI.login(email, password);
localStorage.setItem("token", data.token);
```

### Orders

```javascript
import { ordersAPI } from "@/lib/api.js";

// Create order
const order = await ordersAPI.createOrder({
  tableId,
  items: [{ menuId, quantity }],
});

// Get orders
const orders = await ordersAPI.getOrders();
```

## 📱 Responsive Design

- Mobile-first approach
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexbox and Grid layouts
- Touch-friendly interface elements

### Key Responsive Features

- Hamburger menu on mobile
- Stacked layouts on small screens
- Multi-column grids on larger screens
- Touch-optimized buttons and links

## 🔐 Authentication

Token is automatically added to API requests via interceptor:

```javascript
// Token stored in localStorage
localStorage.setItem("token", token);

// Automatically sent in Authorization header
// Headers: { Authorization: "Bearer <token>" }

// Token cleared on 401 response
// Redirects to /login
```

## 🚀 Build & Deployment

### Development

```bash
npm run dev        # Start dev server
npm run lint       # Run linter
```

### Production

```bash
npm run build      # Build optimized bundle
npm run preview    # Preview production build
```

### Environment Variables

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_IO_URL=http://localhost:5000
```

## 📊 Performance Optimization

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Socket.io message compression
- CSS minification via Tailwind
- Efficient re-renders with React hooks

## 🧪 Testing

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## 🐛 Common Issues

### Socket.io Connection Failed

- Check backend is running on port 5000
- Verify `VITE_SOCKET_IO_URL` in .env.local
- Check browser console for CORS errors

### API 401 Unauthorized

- Token may have expired
- Login again to get new token
- Check localStorage for token

### Styling Issues

- Clear build cache: `rm -rf .nuxt dist`
- Rebuild with `npm run build`
- Check Tailwind config in index.css

## 📚 Component API

### FeatureCard

```jsx
<FeatureCard
  icon="🔐"
  badge="Security & Routing"
  title="Cryptographic QR Table Mappings"
  description="..."
  points={[{ label, desc }]}
  highlight={true}
/>
```

### DashboardCard

```jsx
<DashboardCard
  title="Customer Portal"
  icon="📱"
  description="Seamless contactless ordering"
  features={["Browse menu", "Place orders"]}
  path="/customer"
  color="border-brand-200 bg-brand-50"
  textColor="text-brand-800"
/>
```

### StatCard

```jsx
<StatCard
  value="90s"
  label="Wait Time Reduction"
  description="Per order through real-time sync"
  icon="⏱️"
/>
```

## 🎯 Key Features

✅ Responsive B2B landing page
✅ Four specialized operational dashboards
✅ Real-time Socket.io communication
✅ JWT authentication
✅ Tailwind CSS styling
✅ React context for state management
✅ Axios API client with interceptors
✅ ROI calculator
✅ Mobile-optimized interface

## 📦 Dependencies

```json
{
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router-dom": "^7.1.1",
  "socket.io-client": "^4.8.1",
  "axios": "^1.7.9"
}
```

## 🔄 Development Workflow

1. Create component in appropriate folder
2. Import and use in pages
3. Add Tailwind styling
4. Test responsive behavior
5. Connect to API/Socket.io if needed
6. Run linter: `npm run lint`
7. Commit changes

## 📈 Performance Metrics

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Version**: 1.0.0
**Last Updated**: 2024
