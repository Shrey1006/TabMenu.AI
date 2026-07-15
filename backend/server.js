import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import tableRoutes from './routes/tables.js';
import orderRoutes from './routes/orders.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';
import otpRoutes from './routes/otp.js';
import waiterRequestRoutes from './routes/waiterRequests.js';
import Order from './models/Order.js';
import Table from './models/Table.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return res.status(400).send('Stripe webhook is not configured.');
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.status !== 'paid') {
          const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'paid' }, { new: true });
          await Table.findOneAndUpdate(
            { tableNumber: order.tableNumber },
            { status: 'available', currentOrder: null }
          );

          const io = app.get('io');
          io.emit('order:update', updatedOrder);
          io.emit('waiter:alert', {
            type: 'payment',
            tableNumber: order.tableNumber,
            orderId: order._id,
            message: `Table ${order.tableNumber} payment completed`,
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ambika Pure Veg API' });
});
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Ambika API - root",
    message: "Use /api routes",
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/waiter-requests', waiterRequestRoutes);

io.on('connection', (socket) => {
  const { role, table } = socket.handshake.query;
  if (role) socket.join(`role:${role}`);
  if (table) socket.join(`table:${table}`);

  socket.on('join', ({ role: r, table: t }) => {
    if (r) socket.join(`role:${r}`);
    if (t) socket.join(`table:${t}`);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Ambika API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
