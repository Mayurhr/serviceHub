const r = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

r.get('/public-stats', c.getPublicStats);
r.get('/stats', protect, adminOnly, c.getStats);
r.get('/users', protect, adminOnly, c.getUsers);
r.put('/users/:id/toggle', protect, adminOnly, c.toggleUser);
r.put('/providers/:id', protect, adminOnly, c.updateProvider);
r.put('/providers/:id/password', protect, adminOnly, c.changeProviderPassword);
module.exports = r;
