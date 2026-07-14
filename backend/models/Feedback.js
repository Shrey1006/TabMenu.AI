import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    text: { type: String, required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    confidence: { type: Number, default: 0 },
    flags: { type: [String], default: [] },
    alertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
