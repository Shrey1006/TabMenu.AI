import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ['starters', 'main', 'breads', 'desserts', 'beverages'],
      required: true,
    },
    dietary: {
      type: [String],
      enum: ['jain', 'vegan', 'gluten-free', 'spicy'],
      default: [],
    },
    prepTimeMinutes: { type: Number, default: 15 },
    available: { type: Boolean, default: true },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
