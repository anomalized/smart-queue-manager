const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Queue = require('./models/Queue');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sqms';

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGODB_URI);

  // Remove previous seed entries to avoid duplicates
  await Queue.deleteMany({ shopName: /^Seed -/ });

  const now = new Date();

  const queues = [
    {
      shopName: 'Seed - Bakery',
      date: dateStr(),
      tokenCounter: 5,
      currentServing: 2,
      status: 'open',
      tokens: [
        { number: 1, status: 'completed', createdAt: now },
        { number: 2, status: 'serving', createdAt: now },
        { number: 3, status: 'waiting', createdAt: now },
        { number: 4, status: 'waiting', createdAt: now },
        { number: 5, status: 'waiting', createdAt: now }
      ]
    },
    {
      shopName: 'Seed - Clinic',
      date: dateStr(),
      tokenCounter: 3,
      currentServing: 1,
      status: 'open',
      tokens: [
        { number: 1, status: 'serving', createdAt: now },
        { number: 2, status: 'waiting', createdAt: now },
        { number: 3, status: 'waiting', createdAt: now }
      ]
    },
    {
      shopName: 'Seed - ClosedShop',
      date: dateStr(-1),
      tokenCounter: 4,
      currentServing: null,
      status: 'closed',
      tokens: [
        { number: 1, status: 'completed', createdAt: now },
        { number: 2, status: 'completed', createdAt: now },
        { number: 3, status: 'skipped', createdAt: now },
        { number: 4, status: 'skipped', createdAt: now }
      ]
    }
  ];

  const created = await Queue.insertMany(queues);
  console.log('Inserted seed queues:');
  created.forEach(q => console.log(` - ${q._id} | ${q.shopName} | ${q.date} | status=${q.status} tokens=${q.tokenCounter}`));

  await mongoose.disconnect();
  console.log('Seed complete. Disconnected.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
