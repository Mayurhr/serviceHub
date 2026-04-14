const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  providerRating: { type: Number, min: 1, max: 5 },
  helpful: { type: Number, default: 0 },
  images: [String],
  isVerified: { type: Boolean, default: true },
  response: { type: String, default: '' }, // Provider response
}, { timestamps: true });

reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
