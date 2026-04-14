const r = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

r.post('/register', c.register);
r.post('/login', c.login);
r.post('/provider-login', c.providerLogin);
r.get('/profile', protect, c.getProfile);
r.put('/profile', protect, c.updateProfile);

module.exports = r;
