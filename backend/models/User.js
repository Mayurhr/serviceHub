const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ALLOWED_CITIES = ['Davanagere', 'Shivamogga', 'Honnali', 'Sagar', 'Bhadravathi'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: 'Davanagere' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  totalSpent: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  preferredContactMode: { type: String, enum: ['chat', 'call', 'both'], default: 'both' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ALLOWED_CITIES = ALLOWED_CITIES;
