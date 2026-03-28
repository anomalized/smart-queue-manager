const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');

// Middleware: admin auth by simple header token
function adminAuth(req, res, next) {
  const adminToken = process.env.ADMIN_PASSWORD || '';
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  if (token !== adminToken) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Create a queue (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { shopName, date } = req.body;
    if (!shopName || !date) return res.status(400).json({ error: 'shopName and date required' });

    // ensure only one open queue for shop/date
    await Queue.updateMany({ shopName, date, status: 'open' }, { status: 'closed' });

    const q = new Queue({ shopName, date });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List queues (public)
router.get('/', async (req, res) => {
  try {
    const qs = await Queue.find().sort({ createdAt: -1 }).limit(20);
    res.json(qs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get queue status
router.get('/:id', async (req, res) => {
  try {
    const q = await Queue.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Queue not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer: request token
router.post('/:id/token', async (req, res) => {
  try {
    const q = await Queue.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Queue not found' });
    if (q.status !== 'open') return res.status(400).json({ error: 'Queue is closed' });

    q.tokenCounter += 1;
    const newToken = { number: q.tokenCounter, status: 'waiting' };
    q.tokens.push(newToken);
    await q.save();

    // calculate approximate waiting position and estimate (assume 3 min per token)
    const waitingPosition = q.tokens.filter(t => t.status === 'waiting').length - 1;
    const estimatedMinutes = waitingPosition * 3;

    res.status(201).json({ token: newToken.number, position: waitingPosition, estimatedMinutes, queue: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: call next
router.post('/:id/next', adminAuth, async (req, res) => {
  try {
    const q = await Queue.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Queue not found' });

    // find next waiting token
    const nextToken = q.tokens.find(t => t.status === 'waiting');
    if (!nextToken) return res.status(400).json({ error: 'No waiting tokens' });

    // if a currently serving token exists, mark it completed (optional)
    if (q.currentServing != null) {
      const prev = q.tokens.find(t => t.number === q.currentServing);
      if (prev) prev.status = 'completed';
    }

    nextToken.status = 'serving';
    q.currentServing = nextToken.number;
    await q.save();

    res.json({ serving: q.currentServing, queue: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: skip next token (marks first waiting token skipped and move to next)
router.post('/:id/skip', adminAuth, async (req, res) => {
  try {
    const q = await Queue.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Queue not found' });

    const nextToken = q.tokens.find(t => t.status === 'waiting');
    if (!nextToken) return res.status(400).json({ error: 'No waiting tokens to skip' });

    nextToken.status = 'skipped';

    // set next waiting as serving if exists
    const newNext = q.tokens.find(t => t.status === 'waiting');
    if (newNext) {
      newNext.status = 'serving';
      q.currentServing = newNext.number;
    } else {
      q.currentServing = null;
    }

    await q.save();
    res.json({ queue: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: end queue (close day)
router.post('/:id/end', adminAuth, async (req, res) => {
  try {
    const q = await Queue.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Queue not found' });

    q.status = 'closed';
    q.currentServing = null;
    // optionally mark waiting tokens as skipped or left
    q.tokens.filter(t => t.status === 'waiting').forEach(t => t.status = 'skipped');
    await q.save();
    res.json({ queue: q });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
