const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  status: { type: String, enum: ['waiting','serving','skipped','completed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const QueueSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD to reset per day
  tokens: { type: [TokenSchema], default: [] },
  currentServing: { type: Number, default: null }, // token number
  tokenCounter: { type: Number, default: 0 },
  status: { type: String, enum: ['open','closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Queue', QueueSchema);
