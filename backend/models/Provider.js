const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ALLOWED_CITIES = ['Davanagere', 'Shivamogga', 'Honnali', 'Sagar', 'Bhadravathi'];

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  experience: { type: Number, default: 1 },
  skills: [String],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  city: { type: String, enum: ALLOWED_CITIES, default: 'Davanagere' },
  trustScore: { type: Number, default: 70, min: 0, max: 100 },
  rating: { type: Number, default: 4.0 },
  numReviews: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  cancelledJobs: { type: Number, default: 0 },
  isStudent: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  availabilityStatus: { type: String, enum: ['online', 'offline', 'busy'], default: 'online' },
  availableFrom: { type: String, default: '08:00' },
  availableTo: { type: String, default: '20:00' },
  availableDays: { type: [String], default: ['Mon','Tue','Wed','Thu','Fri','Sat'] },
  priceMultiplier: { type: Number, default: 1.0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-hash password before save (same pattern as User model)
providerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

providerSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

providerSchema.methods.calculateTrustScore = function() {
  const jobSuccess = this.totalJobs > 0 ? (this.completedJobs / this.totalJobs) * 40 : 20;
  const ratingScore = (this.rating / 5) * 40;
  const cancellationPenalty = this.totalJobs > 0 ? (this.cancelledJobs / this.totalJobs) * 20 : 0;
  this.trustScore = Math.round(Math.min(100, jobSuccess + ratingScore - cancellationPenalty + 20));
  return this.trustScore;
};

module.exports = mongoose.model('Provider', providerSchema);
module.exports.ALLOWED_CITIES = ALLOWED_CITIES;
