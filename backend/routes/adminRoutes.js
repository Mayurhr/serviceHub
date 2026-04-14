const r = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Public stats (counts only, no sensitive data)
r.get('/public-stats', c.getPublicStats);

// Admin-only routes
r.get('/stats', protect, adminOnly, c.getStats);
r.get('/users', protect, adminOnly, c.getUsers);
r.put('/users/:id/toggle', protect, adminOnly, c.toggleUser);
module.exports = r;
