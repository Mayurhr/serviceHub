const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending','accepted','traveling','started','in_progress','completed','cancelled'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  note: String,
  lat: Number,
  lng: Number,
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  // Multi-service bundle support
  bundleServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  isBundleBooking: { type: Boolean, default: false },
  bundleDiscount: { type: Number, default: 0 },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: '' },
  // Pricing
  baseAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  // AI Match used
  aiMatchUsed: { type: Boolean, default: false },
  // Status tracking
  status: { type: String, enum: ['pending','accepted','traveling','started','in_progress','completed','cancelled'], default: 'pending' },
  trackingHistory: [trackingSchema],
  // Provider current location for tracking
  providerLat: { type: Number },
  providerLng: { type: Number },
  // Problem Help Mode
  isProblemConsultation: { type: Boolean, default: false },
  consultationNote: { type: String, default: '' },
  // Bill/Invoice
  invoiceGenerated: { type: Boolean, default: false },
  invoiceData: { type: Object, default: null },
  // Payment
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['upi','cash','card','wallet'], default: 'cash' },
  paymentTransactionId: { type: String, default: '' },
  // Review
  isReviewed: { type: Boolean, default: false },
  cancelReason: { type: String, default: '' },
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'SE' + Date.now() + Math.floor(Math.random() * 10000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
