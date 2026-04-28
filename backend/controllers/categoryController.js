const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try { res.json(await Category.find({ isActive: true }).sort({ order: 1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
exports.createCategory = async (req, res) => {
  try { res.status(201).json(await Category.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
exports.updateCategory = async (req, res) => {
  try { res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
