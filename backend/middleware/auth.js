const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Support both user and provider tokens
      if (decoded.role === 'provider') {
        req.user = await Provider.findById(decoded.id).select('-password');
        req.user.role = 'provider';
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }
      if (!req.user) return res.status(401).json({ message: 'Account not found' });
      return next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  if (!token) return res.status(401).json({ message: 'No token provided' });
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

const providerOnly = (req, res, next) => {
  if (req.user?.role === 'provider') return next();
  res.status(403).json({ message: 'Provider access required' });
};

const generateToken = (id, role = 'user') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = { protect, adminOnly, providerOnly, generateToken };
