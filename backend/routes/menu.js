import express from 'express';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const activeCategories = await Category.find({ active: true });
    const categoryIds = activeCategories.map((c) => c._id);
    const items = await MenuItem.find({
      available: true,
      category: { $in: categoryIds },
    }).populate('category');

    items.sort((a, b) => {
      const orderA = a.category?.displayOrder ?? 0;
      const orderB = b.category?.displayOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.displayOrder - b.displayOrder;
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

router.get('/all', auth(['admin']), async (_req, res) => {
  try {
    const items = await MenuItem.find().populate('category');

    items.sort((a, b) => {
      const orderA = a.category?.displayOrder ?? 0;
      const orderB = b.category?.displayOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.displayOrder - b.displayOrder;
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all menu items' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json(item);
});

router.put('/:id', auth(['admin']), async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
