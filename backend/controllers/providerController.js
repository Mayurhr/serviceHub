const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

const ALLOWED_CITIES = ['Davanagere', 'Shivamogga', 'Honnali', 'Sagar', 'Bhadravathi'];

const CITY_PROXIMITY = {
  'Davanagere': ['Davanagere', 'Honnali', 'Shivamogga', 'Bhadravathi', 'Sagar'],
  'Shivamogga': ['Shivamogga', 'Bhadravathi', 'Sagar', 'Honnali', 'Davanagere'],
  'Honnali':    ['Honnali', 'Davanagere', 'Shivamogga', 'Bhadravathi', 'Sagar'],
  'Sagar':      ['Sagar', 'Shivamogga', 'Bhadravathi', 'Honnali', 'Davanagere'],
  'Bhadravathi':['Bhadravathi', 'Shivamogga', 'Sagar', 'Honnali', 'Davanagere'],
};

// Generate a neutral avatar from provider initials (SVG data URI)
const getDefaultAvatar = (name = '') => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#6366f1', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="${color}"/><text x="40" y="46" text-anchor="middle" font-size="28" font-family="sans-serif" font-weight="bold" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

const smartMatch = (providers, { budget, urgency, userCity }) => {
  const cityOrder = CITY_PROXIMITY[userCity] || ALLOWED_CITIES;
  return providers.map(p => {
    let score = 0;
    score += (p.rating / 5) * 35;
    score += (p.trustScore / 100) * 25;
    const cityRank = cityOrder.indexOf(p.city);
    const locationScore = cityRank === 0 ? 25 : cityRank === 1 ? 20 : cityRank === 2 ? 15 : cityRank === 3 ? 8 : 3;
    score += locationScore;
    if (p.availabilityStatus === 'online') score += 10;
    else if (p.availabilityStatus === 'busy') score += 3;
    if (budget && p.priceMultiplier <= 1) score += 5;
    if (urgency === 'high' && p.availabilityStatus === 'online') score += 5;
    if (p.isStudent && budget && budget < 500) score += 5;
    return { ...p.toObject(), matchScore: Math.round(score) };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// Helper: attach default avatar if empty
const withAvatar = (provider) => {
  const p = provider.toObject ? provider.toObject() : { ...provider };
  if (!p.avatar || p.avatar.includes('pravatar') || p.avatar === '') {
    p.avatar = getDefaultAvatar(p.name);
  }
  return p;
};

// GET /providers?serviceId=xxx&city=xxx&available=online
exports.getProviders = async (req, res) => {
  try {
    const { serviceId, city, available, limit = 20 } = req.query;
    const query = { isActive: true };

    // Filter by service — only show providers who offer this service
    if (serviceId) {
      query.services = serviceId;
    }
    if (available) query.availabilityStatus = available;
    if (city && ALLOWED_CITIES.includes(city)) query.city = city;

    const providers = await Provider.find(query)
      .populate('categories', 'name slug icon')
      .limit(Number(limit));

    res.json(providers.map(withAvatar));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getProvider = async (req, res) => {
  try {
    const p = await Provider.findById(req.params.id)
      .populate('categories', 'name slug icon')
      .populate('services', 'name priceRange');
    if (!p) return res.status(404).json({ message: 'Provider not found' });
    res.json(withAvatar(p));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.smartMatch = async (req, res) => {
  try {
    const { serviceId, budget, urgency, userCity } = req.body;
    const resolvedCity = ALLOWED_CITIES.includes(userCity) ? userCity : 'Davanagere';
    const query = { isActive: true, availabilityStatus: { $ne: 'offline' } };
    // Filter by service during AI match
    if (serviceId) query.services = serviceId;
    const providers = await Provider.find(query).populate('categories', 'name');
    const matched = smartMatch(providers, { budget, urgency, userCity: resolvedCity });
    res.json({
      providers: matched.slice(0, 6).map(withAvatar),
      algorithm: 'ServeEase AI Smart Match v2',
      userCity: resolvedCity,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Provider dashboard - view own bookings
exports.getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user._id;
    const [bookings, providerData] = await Promise.all([
      Booking.find({ provider: providerId })
        .populate('user', 'name email phone city')
        .populate('service', 'name priceRange images')
        .sort({ createdAt: -1 }),
      Provider.findById(providerId).select('-password'),
    ]);
    const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0);
    const counts = bookings.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});
    res.json({ bookings, provider: withAvatar(providerData), totalEarnings, counts });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateAvailability = async (req, res) => {
  try {
    const p = await Provider.findByIdAndUpdate(req.params.id, { availabilityStatus: req.body.status }, { new: true });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createProvider = async (req, res) => {
  try {
    if (req.body.city && !ALLOWED_CITIES.includes(req.body.city)) {
      return res.status(400).json({ message: `City must be one of: ${ALLOWED_CITIES.join(', ')}` });
    }
    // Password will be hashed by pre-save hook
    const p = new Provider(req.body);
    await p.save();
    res.status(201).json(withAvatar(p));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateProvider = async (req, res) => {
  try {
    if (req.body.city && !ALLOWED_CITIES.includes(req.body.city)) {
      return res.status(400).json({ message: `City must be one of: ${ALLOWED_CITIES.join(', ')}` });
    }
    // Don't allow direct password update via PUT — use dedicated endpoint
    if (req.body.password) delete req.body.password;
    const p = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(withAvatar(p));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Provider deactivated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllowedCities = (req, res) => res.json({ cities: ALLOWED_CITIES });
