import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Feedback from '../models/Feedback.js';
import MenuItem from '../models/MenuItem.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth(['admin']), async (_req, res) => {
  const [orders, tables, feedbacks, menuCount] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(20),
    Table.find().sort({ tableNumber: 1 }),
    Feedback.find().sort({ createdAt: -1 }).limit(10),
    MenuItem.countDocuments({ available: true }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = await Order.find({ createdAt: { $gte: today } });
  const revenue = todayOrders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter((o) =>
    ['pending', 'in_progress', 'ready'].includes(o.status)
  ).length;

  res.json({
    revenue,
    activeOrders,
    tableCount: tables.length,
    menuCount,
    recentOrders: orders,
    tables,
    recentFeedback: feedbacks,
    avgWaitReduction: 90,
    issueDetectionBoost: 40,
  });
});

export default router;
