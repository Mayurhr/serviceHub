const r = require('express').Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
r.get('/service/:slug', c.getServiceReviews);
r.post('/', protect, c.createReview);
r.delete('/:id', protect, c.deleteReview);
module.exports = r;
