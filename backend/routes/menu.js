import express from 'express';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import { auth } from '../middleware/auth.js';
import { getCachedMenu, setCachedMenu, clearMenuCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const cached = getCachedMenu();
    if (cached) {
      return res.json(cached);
    }

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

    setCachedMenu(items);
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
  try {
    const item = await MenuItem.create(req.body);
    clearMenuCache();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item' });
  }
});

router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    clearMenuCache();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item' });
  }
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    clearMenuCache();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item' });
  }
});

export default router;
