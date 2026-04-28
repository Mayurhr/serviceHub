const User = require('../models/User');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');

exports.getPublicStats = async (req, res) => {
  try {
    const [users, providers, services, bookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
    ]);
    res.json({ users, providers, services, bookings });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [users, providers, services, totalBookings, recentBookings, bookingsByStatus, completedRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Provider.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.find()
        .populate('user', 'name email phone')
        .populate('service', 'name priceRange')
        .populate('provider', 'name phone')
        .sort({ createdAt: -1 })
        .limit(8),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }]),
      Booking.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);
    const revenue = completedRevenue[0]?.total || 0;
    res.json({ users, providers, services, bookings: totalBookings, revenue, recentBookings, bookingsByStatus });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getUsers = async (req, res) => {
  try { res.json(await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.toggleUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    u.isActive = !u.isActive;
    await u.save();
    res.json({ message: `User ${u.isActive ? 'activated' : 'deactivated'}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Admin: edit provider details
exports.updateProvider = async (req, res) => {
  try {
    const { name, email, phone, bio, city, experience, skills, isVerified, isFeatured, isActive, availabilityStatus } = req.body;
    const update = { name, email, phone, bio, city, experience, skills, isVerified, isFeatured, isActive, availabilityStatus };
    // Remove undefined keys
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const p = await Provider.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!p) return res.status(404).json({ message: 'Provider not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Admin: change provider password securely
exports.changeProviderPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const p = await Provider.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Provider not found' });
    p.password = newPassword; // pre-save hook hashes it
    await p.save();
    res.json({ message: 'Provider password updated successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
