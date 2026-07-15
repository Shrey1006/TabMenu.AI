import mongoose from "mongoose";

const waiterRequestSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    customerName: { type: String, default: "Guest" },
    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("WaiterRequest", waiterRequestSchema);
