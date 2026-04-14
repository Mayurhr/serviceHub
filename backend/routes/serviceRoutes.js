const r = require('express').Router();
const c = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');
r.get('/', c.getServices);
r.get('/:slug', c.getService);
r.post('/', protect, adminOnly, c.createService);
r.put('/:id', protect, adminOnly, c.updateService);
r.delete('/:id', protect, adminOnly, c.deleteService);
module.exports = r;
