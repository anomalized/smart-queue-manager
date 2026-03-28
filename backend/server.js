require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const queuesRoute = require('./routes/queues');

const app = express();
app.use(cors());
app.use(express.json());

// connect to mongodb
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sqms';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/queues', queuesRoute);

app.get('/', (req, res) => res.send('Smart Queue Manager API'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
