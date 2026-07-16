import express from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories - Get active categories (for customer menu)
router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /api/categories/all - Get all categories (for admin panel)
router.get('/all', auth(['admin']), async (_req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all categories' });
  }
});

// POST /api/categories - Create a new category
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { name, description, icon, displayOrder, active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Case-insensitive duplicate check
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    let order = displayOrder;
    if (order === undefined || order === null) {
      const lastCategory = await Category.findOne().sort({ displayOrder: -1 });
      order = lastCategory ? lastCategory.displayOrder + 1 : 1;
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      icon,
      displayOrder: order,
      active: active !== undefined ? active : true,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// PUT /api/categories/:id - Update an existing category
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { name, description, icon, displayOrder, active } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      // Name is being changed, check for duplicate
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      category.name = name.trim();
    } else if (name) {
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (active !== undefined) category.active = active;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

// DELETE /api/categories/:id - Delete a category and its associated menu items
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cascade delete menu items in this category
    await MenuItem.deleteMany({ category: req.params.id });

    // Delete the category itself
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category and all associated menu items deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;
