const User = require('../models/User');
const Provider = require('../models/Provider');
const { generateToken } = require('../middleware/auth');

// User register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, city });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, city: user.city,
      token: generateToken(user._id),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, address: user.address, city: user.city,
      token: generateToken(user._id),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Provider login
exports.providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const provider = await Provider.findOne({ email, isActive: true });
    if (!provider) return res.status(401).json({ message: 'No active provider account found with this email' });
    const match = await provider.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      city: provider.city,
      role: 'provider',
      avatar: provider.avatar,
      trustScore: provider.trustScore,
      rating: provider.rating,
      isVerified: provider.isVerified,
      availabilityStatus: provider.availabilityStatus,
      token: generateToken(provider._id, 'provider'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// User profile
exports.getProfile = async (req, res) => {
  try { res.json(await User.findById(req.user._id).select('-password')); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    ['name','phone','address','city'].forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      _id: updated._id, name: updated.name, email: updated.email,
      role: updated.role, phone: updated.phone, address: updated.address, city: updated.city,
      token: generateToken(updated._id),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
