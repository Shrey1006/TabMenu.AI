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
      enum: ["pending", "in_progress", "ready", "served", "paid", "cancelled"],
      default: "pending",
    },
    totalAmount: { type: Number, default: 0 },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerNotes: { type: String, default: "" },
    prepStartedAt: Date,
    readyAt: Date,
    servedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
