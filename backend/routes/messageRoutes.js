const r = require('express').Router();
const c = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
r.get('/:bookingId', protect, c.getMessages);
r.post('/:bookingId', protect, c.sendMessage);
module.exports = r;
