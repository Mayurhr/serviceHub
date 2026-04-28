const mongoose = require('mongoose');

const priceRangeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number },
  unit: { type: String, default: 'fixed', enum: ['fixed', 'hourly', 'per_plate', 'starting'] },
  note: { type: String, default: '' }
}, { _id: false });

const timeSlotSchema = new mongoose.Schema({
  time: String,
  available: { type: Boolean, default: true }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  priceRange: priceRangeSchema,
  duration: { type: Number, default: 60 },
  includes: [String],
  excludes: [String],
  images: [String],
  timeSlots: [timeSlotSchema],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  // Bundle discount support
  bundleCompatible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
