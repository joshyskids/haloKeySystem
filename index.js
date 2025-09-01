const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect:', err));
const keySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  duration: { type: Number, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

const Key = mongoose.model('Key', keySchema);

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segment = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `KEY_${segment()}-${segment()}-${segment()}-${segment()}`;
}

app.post('/generateKey', async (req, res) => {
  const { username, duration } = req.body;
  if (!username || !duration || isNaN(duration)) {
    return res.status(400).json({ error: 'Invalid username or duration' });
  }

  const keyValue = generateKey();
  const key = new Key({ key: keyValue, username, duration });
  await key.save();
  res.json({ key: keyValue });
});

app.get('/validateKey/:key', async (req, res) => {
  const keyValue = req.params.key;
  const key = await Key.findOne({ key: keyValue });

  if (!key) return res.json({ valid: false });
  res.json({ valid: true, username: key.username, duration: key.duration });
});

app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
