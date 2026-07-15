import express from "express";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import { verifyTableToken } from "../utils/crypto.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const emitOrderEvent = (io, event, data) => {
  if (io) io.emit(event, data);
};

const emitSocketToRoom = (io, room, event, data) => {
  if (io) io.to(room).emit(event, data);
};

// GET /api/orders - Get all orders (admin/staff)
router.get("/", auth(["admin", "kitchen", "waiter"]), async (_req, res) => {
  const orders = await Order.find()
    .populate("items.menuItem")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(orders);
});

// GET /api/orders/active - Filter active orders by role
router.get(
  "/active",
  auth(["kitchen", "waiter", "admin"]),
  async (req, res) => {
    try {
      let query = {};
      if (req.user.role === "kitchen") {
        // Kitchen only sees confirmed orders that are not yet served
        query = {
          status: { $in: ["sent_to_kitchen", "preparing", "ready_to_serve", "pending", "in_progress", "ready"] },
        };
      } else {
        query = {
          status: {
            $in: [
              "waiting_for_waiter",
              "waiter_reviewing",
              "confirmed",
              "sent_to_kitchen",
              "preparing",
              "ready_to_serve",
              "pending",
              "in_progress",
              "ready",
              "served",
              "cancelled"
            ],
          },
        };
      }

      const orders = await Order.find(query)
        .populate("items.menuItem")
        .sort({ createdAt: 1 });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      res.status(500).json({ message: "Server error fetching active orders" });
    }
  },
);

// GET /api/orders/active/table/:tableNumber - Customer tracks their table's active order
router.get(
  "/active/table/:tableNumber",
  async (req, res) => {
    const { tableNumber } = req.params;
    const { token } = req.query;

    const verified = verifyTableToken(token);
    if (!verified || String(verified.tableNumber) !== String(tableNumber)) {
      return res.status(400).json({ message: "Invalid or missing QR token" });
    }

    const order = await Order.findOne({
      tableNumber: Number(tableNumber),
      status: {
        $in: [
          "waiting_for_waiter",
          "waiter_reviewing",
          "confirmed",
          "sent_to_kitchen",
          "preparing",
          "ready_to_serve",
          "pending",
          "in_progress",
          "ready"
        ]
      },
    }).populate("items.menuItem");

    res.json(order ? [order] : []);
  },
);

// POST /api/orders - Submit Order (Requires OTP verification check)
router.post("/", async (req, res) => {
  const { qrToken, items, customerName, customerPhone, customerNotes, otpToken } = req.body;

  const verified = verifyTableToken(qrToken);
  if (!verified) return res.status(400).json({ message: "Invalid QR token" });

  if (!otpToken) {
    return res.status(400).json({ message: "OTP verification token is required to submit an order." });
  }

  // Securely verify OTP Token
  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET || "ambika_super_secret");
    if (decoded.phone !== customerPhone) {
      return res.status(400).json({ message: "OTP phone number mismatch. Please re-verify." });
    }
  } catch (err) {
    return res.status(400).json({ message: "OTP verification expired or invalid. Please verify again." });
  }

  try {
    const menuIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({
      _id: { $in: menuIds },
      available: true,
    });
    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: "Some menu items are currently unavailable" });
    }

    const orderItems = items.map((item) => {
      const menu = menuItems.find((m) => m._id.toString() === item.menuItemId);
      return {
        menuItem: menu._id,
        name: menu.name,
        quantity: item.quantity,
        price: menu.price,
        notes: item.notes || "",
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    const order = await Order.create({
      tableNumber: verified.tableNumber,
      items: orderItems,
      totalAmount,
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerNotes: customerNotes || "",
      otpVerified: true,
      status: "waiting_for_waiter",
    });

    await Table.findOneAndUpdate(
      { tableNumber: verified.tableNumber },
      { status: "occupied", currentOrder: order._id },
    );

    // Broadcast update
    const io = req.app.get("io");
    emitOrderEvent(io, "order:new", order);
    emitOrderEvent(io, "order:update", order);
    emitSocketToRoom(io, `table:${verified.tableNumber}`, `table:${verified.tableNumber}:order`, order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error creating order" });
  }
});

// PATCH /api/orders/:id/status - Staff updates preparation status
router.patch(
  "/:id/status",
  auth(["kitchen", "waiter", "admin"]),
  async (req, res) => {
    const { status } = req.body;
    const updates = { status };

    if (status === "in_progress" || status === "preparing") updates.prepStartedAt = new Date();
    if (status === "ready" || status === "ready_to_serve") updates.readyAt = new Date();
    if (status === "served") updates.servedAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate("items.menuItem");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    emitOrderEvent(io, "order:update", order);
    emitSocketToRoom(io, `table:${order.tableNumber}`, `table:${order.tableNumber}:order`, order);

    if (status === "ready" || status === "ready_to_serve") {
      emitOrderEvent(io, "waiter:alert", {
        type: "dish_ready",
        tableNumber: order.tableNumber,
        orderId: order._id,
        message: `Table ${order.tableNumber}: dishes ready for dispatch`,
      });
    }

    res.json(order);
  },
);

// PATCH /api/orders/:id/review - Waiter reviews, edits, confirms, or cancels orders
router.patch(
  "/:id/review",
  auth(["waiter", "admin"]),
  async (req, res) => {
    const { status, items, waiterNotes, cancellationReason } = req.body;
    const waiterName = req.user.name || "Floor Waiter";

    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const updates = {};
      const changesList = [];

      // 1. Handle status update
      if (status) {
        updates.status = status;
        changesList.push(`Status changed to ${status}`);
        if (status === "sent_to_kitchen") {
          updates.waiterId = req.user.id;
        }
        if (status === "cancelled") {
          updates.cancellationReason = cancellationReason || "Cancelled by waiter";
          changesList.push(`Reason: ${updates.cancellationReason}`);
          
          // Clear table status if cancelled
          await Table.findOneAndUpdate(
            { tableNumber: order.tableNumber },
            { status: "available", currentOrder: null }
          );
        }
      }

      // 2. Handle Waiter notes
      if (waiterNotes !== undefined) {
        updates.waiterNotes = waiterNotes;
      }

      // 3. Handle item changes
      if (items && Array.isArray(items)) {
        // Calculate new items and generate audit logs
        const menuIds = items.map((i) => i.menuItem._id || i.menuItem);
        const menuItems = await MenuItem.find({ _id: { $in: menuIds } });

        const updatedItems = items.map((item) => {
          const mId = item.menuItem._id || item.menuItem;
          const menu = menuItems.find((m) => m._id.toString() === mId.toString());
          return {
            menuItem: menu._id,
            name: menu.name,
            quantity: item.quantity,
            price: menu.price,
            notes: item.notes || "",
          };
        });

        // Audit item differences
        const oldMap = new Map(order.items.map((i) => [i.menuItem.toString(), i]));
        updatedItems.forEach((item) => {
          const oldItem = oldMap.get(item.menuItem.toString());
          if (!oldItem) {
            changesList.push(`Added ${item.quantity}x ${item.name}`);
          } else if (oldItem.quantity !== item.quantity) {
            changesList.push(`Changed ${item.name} quantity from ${oldItem.quantity} to ${item.quantity}`);
          }
          oldMap.delete(item.menuItem.toString());
        });
        oldMap.forEach((oldItem) => {
          changesList.push(`Removed ${oldItem.name}`);
        });

        updates.items = updatedItems;
        updates.totalAmount = updatedItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
      }

      // Record in modification history
      if (changesList.length > 0) {
        updates.$push = {
          modificationHistory: {
            timestamp: new Date(),
            changes: changesList.join("; "),
            waiterName,
          }
        };
      }

      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      }).populate("items.menuItem");

      // Broadcast changes
      const io = req.app.get("io");
      emitOrderEvent(io, "order:update", updatedOrder);
      emitSocketToRoom(io, `table:${updatedOrder.tableNumber}`, `table:${updatedOrder.tableNumber}:order`, updatedOrder);

      // If status is confirmed, notify kitchen
      if (status === "sent_to_kitchen") {
        emitOrderEvent(io, "order:new", updatedOrder); // Notify kitchen queue
      }

      res.json(updatedOrder);

    } catch (error) {
      console.error("Error reviewing order:", error);
      res.status(500).json({ message: "Server error reviewing order" });
    }
  }
);

// POST /api/orders/:id/call-waiter - Seated customer calls waiter (Legacy wrapper, triggers waiter requests)
router.post("/:id/call-waiter", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Mark table status
    await Table.findOneAndUpdate(
      { tableNumber: order.tableNumber },
      { status: "needs_service" }
    );

    const alertData = {
      type: "service_request",
      tableNumber: order.tableNumber,
      orderId: order._id,
      customerName: order.customerName || "Guest",
      message: `Table ${order.tableNumber} needs assistance`,
    };

    const io = req.app.get("io");
    emitOrderEvent(io, "waiter:alert", alertData);
    res.json({ message: "Waiter notified" });
  } catch (err) {
    res.status(500).json({ message: "Error notifying waiter" });
  }
});

// POST /api/orders/:id/pay - Settlement (Razorpay/Stripe checkout URL or direct checkout)
router.post("/:id/pay", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (stripe) {
    const successUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173"}/table/${order.tableNumber}?payment=success`;
    const cancelUrl = `${req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173"}/table/${order.tableNumber}?payment=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Ambika order for table ${order.tableNumber}`,
            },
            unit_amount: Math.round(order.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        tableNumber: order.tableNumber.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({ checkoutUrl: session.url, paymentMode: "stripe" });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "paid" },
    { new: true }
  );

  await Table.findOneAndUpdate(
    { tableNumber: order.tableNumber },
    { status: "available", currentOrder: null },
  );

  const io = req.app.get("io");
  emitOrderEvent(io, "order:update", updatedOrder);
  emitOrderEvent(io, "waiter:alert", {
    type: "payment",
    tableNumber: order.tableNumber,
    orderId: order._id,
    message: `Table ${order.tableNumber} payment completed`,
  });

  res.json(updatedOrder);
});

export default router;
