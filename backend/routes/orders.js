import express from "express";
import Stripe from "stripe";
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

router.get("/", auth(["admin", "kitchen", "waiter"]), async (_req, res) => {
  const orders = await Order.find()
    .populate("items.menuItem")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(orders);
});

router.get(
  "/active",
  auth(["kitchen", "waiter", "admin"]),
  async (_req, res) => {
    const orders = await Order.find({
      status: { $in: ["pending", "in_progress", "ready"] },
    })
      .populate("items.menuItem")
      .sort({ createdAt: 1 });
    res.json(orders);
  },
);

router.post("/", async (req, res) => {
  const { qrToken, items, customerName, customerPhone, customerNotes } =
    req.body;
  const verified = verifyTableToken(qrToken);
  if (!verified) return res.status(400).json({ message: "Invalid QR token" });

  const menuIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: menuIds },
    available: true,
  });
  if (menuItems.length !== items.length) {
    return res.status(400).json({ message: "Some menu items unavailable" });
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
    status: "pending",
  });

  await Table.findOneAndUpdate(
    { tableNumber: verified.tableNumber },
    { status: "occupied", currentOrder: order._id },
  );

  const io = req.app.get("io");
  emitOrderEvent(io, "order:new", order);
  emitOrderEvent(io, `table:${verified.tableNumber}:order`, order);

  res.status(201).json(order);
});

router.patch(
  "/:id/status",
  auth(["kitchen", "waiter", "admin"]),
  async (req, res) => {
    const { status } = req.body;
    const updates = { status };

    if (status === "in_progress") updates.prepStartedAt = new Date();
    if (status === "ready") updates.readyAt = new Date();
    if (status === "served") updates.servedAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    emitOrderEvent(io, "order:update", order);
    emitOrderEvent(io, `table:${order.tableNumber}:order`, order);

    if (status === "ready") {
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

router.post("/:id/call-waiter", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const io = req.app.get("io");
  emitOrderEvent(io, "waiter:alert", {
    type: "service_request",
    tableNumber: order.tableNumber,
    orderId: order._id,
    message: `Table ${order.tableNumber} needs assistance`,
  });

  await Table.findOneAndUpdate(
    { tableNumber: order.tableNumber },
    { status: "needs_service" },
  );
  res.json({ message: "Waiter notified" });
});

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
    { new: true },
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
    message: `Table ${order.tableNumber} ready for payment`,
  });

  res.json(updatedOrder);
});

export default router;
