import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Feedback from '../models/Feedback.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth(['admin']), async (_req, res) => {
  try {
    const [
      orders,
      tables,
      feedbacks,
      categoryCount,
      totalFoodItems,
      activeMenuCount,
      outOfStockCount,
      pendingOrderCount,
      confirmedOrderCount,
      kitchenOrderCount,
      completedOrderCount,
    ] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(20),
      Table.find().sort({ tableNumber: 1 }),
      Feedback.find().sort({ createdAt: -1 }).limit(10),
      Category.countDocuments(),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ available: true }),
      MenuItem.countDocuments({ available: false }),
      Order.countDocuments({ status: { $in: ['waiting_for_waiter', 'waiter_reviewing', 'pending'] } }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: { $in: ['sent_to_kitchen', 'preparing', 'ready_to_serve', 'in_progress', 'ready'] } }),
      Order.countDocuments({ status: { $in: ['served', 'paid'] } }),
    ]);

    res.json({
      categoryCount,
      totalFoodItems,
      activeMenuCount,
      outOfStockCount,
      pendingOrderCount,
      confirmedOrderCount,
      kitchenOrderCount,
      completedOrderCount,
      tableCount: tables.length,
      recentOrders: orders,
      tables,
      recentFeedback: feedbacks,
      avgWaitReduction: 90,
      issueDetectionBoost: 40,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

export default router;
