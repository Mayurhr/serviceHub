const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: '🔧' },
  emoji: { type: String, default: '🔧' },
  description: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  gradientFrom: { type: String, default: '#6366f1' },
  gradientTo: { type: String, default: '#8b5cf6' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  totalServices: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
