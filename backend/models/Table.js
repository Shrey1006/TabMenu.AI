import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    qrToken: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'needs_service', 'payment_pending'],
      default: 'available',
    },
    capacity: { type: Number, default: 4 },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Table', tableSchema);
