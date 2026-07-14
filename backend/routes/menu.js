import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const items = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
  res.json(items);
});

router.get('/all', auth(['admin']), async (_req, res) => {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json(items);
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
