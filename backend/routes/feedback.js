import express from 'express';
import Feedback from '../models/Feedback.js';
import { verifyTableToken } from '../utils/crypto.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const analyzeSentiment = async (text) => {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${aiUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('AI service unavailable, using fallback:', err.message);
  }

  const lower = text.toLowerCase();
  const negativeWords = ['bad', 'slow', 'cold', 'wrong', 'terrible', 'delay', 'dirty', 'rude'];
  const positiveWords = ['great', 'excellent', 'delicious', 'fast', 'amazing', 'love', 'perfect'];
  const neg = negativeWords.filter((w) => lower.includes(w)).length;
  const pos = positiveWords.filter((w) => lower.includes(w)).length;
  const sentiment = neg > pos ? 'negative' : pos > neg ? 'positive' : 'neutral';
  const flags = [];
  if (lower.includes('slow') || lower.includes('delay')) flags.push('service_delay');
  if (lower.includes('cold')) flags.push('food_temperature');
  if (lower.includes('wrong')) flags.push('order_mixup');
  return { sentiment, confidence: 0.6, flags };
};

router.post('/', async (req, res) => {
  const { qrToken, text, orderId } = req.body;
  const verified = verifyTableToken(qrToken);
  if (!verified) return res.status(400).json({ message: 'Invalid QR token' });

  const analysis = await analyzeSentiment(text);
  const feedback = await Feedback.create({
    tableNumber: verified.tableNumber,
    order: orderId || null,
    text,
    sentiment: analysis.sentiment,
    confidence: analysis.confidence,
    flags: analysis.flags || [],
    alertSent: analysis.sentiment === 'negative',
  });

  const io = req.app.get('io');
  if (analysis.sentiment === 'negative') {
    io?.emit('admin:alert', {
      type: 'negative_feedback',
      feedback,
      message: `Negative feedback from Table ${verified.tableNumber}`,
    });
  }
  io?.emit('feedback:new', feedback);

  res.status(201).json(feedback);
});

router.get('/', auth(['admin']), async (_req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);
  res.json(feedbacks);
});

router.get('/stats', auth(['admin']), async (_req, res) => {
  const total = await Feedback.countDocuments();
  const negative = await Feedback.countDocuments({ sentiment: 'negative' });
  const positive = await Feedback.countDocuments({ sentiment: 'positive' });
  res.json({
    total,
    negative,
    positive,
    neutral: total - negative - positive,
    detectionRate: total ? Math.round((negative / total) * 100) : 0,
  });
});

export default router;
