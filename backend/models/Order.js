import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  notes: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "ready",
        "served",
        "paid",
        "cancelled",
        "otp_verification_pending",
        "waiting_for_waiter",
        "waiter_reviewing",
        "confirmed",
        "sent_to_kitchen",
        "preparing",
        "ready_to_serve"
      ],
      default: "waiting_for_waiter",
    },
    totalAmount: { type: Number, default: 0 },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerNotes: { type: String, default: "" },
    otpVerified: { type: Boolean, default: false },
    waiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    kitchenId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    waiterNotes: { type: String, default: "" },
    kitchenNotes: { type: String, default: "" },
    modificationHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        changes: { type: String, required: true },
        waiterName: { type: String, required: true },
      }
    ],
    cancellationReason: { type: String, default: "" },
    prepStartedAt: Date,
    readyAt: Date,
    servedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
