import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: { type: String, default: '' },
    veg: { type: Boolean, default: true },
    nonVeg: { type: Boolean, default: false },
    jain: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    bestseller: { type: Boolean, default: false },
    prepTimeMinutes: { type: Number, default: 15 },
    spiceLevel: { type: String, default: 'none' }, // 'none', 'low', 'medium', 'high'
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ available: 1, category: 1, displayOrder: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
