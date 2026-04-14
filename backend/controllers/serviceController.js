const Service = require('../models/Service');
const Category = require('../models/Category');

exports.getServices = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page=1, limit=12, featured, popular } = req.query;
    const query = { isActive: true };
    if (category) { const c = await Category.findOne({ slug: category }); if (c) query.category = c._id; }
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search,'i')] } }];
    if (minPrice) query['priceRange.min'] = { $gte: Number(minPrice) };
    if (maxPrice) query['priceRange.min'] = { ...(query['priceRange.min']||{}), $lte: Number(maxPrice) };
    if (featured === 'true') query.isFeatured = true;
    if (popular === 'true') query.isPopular = true;
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { 'priceRange.min': 1 };
    else if (sort === 'price_desc') sortObj = { 'priceRange.min': -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'popular') sortObj = { totalBookings: -1 };
    const skip = (page-1)*limit;
    const [services, total] = await Promise.all([
      Service.find(query).populate('category','name slug color icon emoji gradientFrom gradientTo').sort(sortObj).skip(skip).limit(Number(limit)),
      Service.countDocuments(query)
    ]);
    res.json({ services, total, pages: Math.ceil(total/limit), page: Number(page) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getService = async (req, res) => {
  try {
    const s = await Service.findOne({ slug: req.params.slug, isActive: true }).populate('category','name slug color icon emoji');
    if (!s) return res.status(404).json({ message: 'Service not found' });
    res.json(s);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createService = async (req, res) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '-' + Date.now();
    res.status(201).json(await Service.create({ ...req.body, slug }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateService = async (req, res) => {
  try {
    const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteService = async (req, res) => {
  try { await Service.findByIdAndUpdate(req.params.id, { isActive: false }); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
