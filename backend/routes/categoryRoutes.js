const r = require('express').Router();
const c = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
r.get('/', c.getCategories);
r.post('/', protect, adminOnly, c.createCategory);
r.put('/:id', protect, adminOnly, c.updateCategory);
module.exports = r;
