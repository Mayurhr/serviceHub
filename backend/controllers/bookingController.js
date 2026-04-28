const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const User = require('../models/User');

const STATUS_FLOW = ['pending','accepted','traveling','started','in_progress','completed','cancelled'];

const ROLE_ALLOWED_TRANSITIONS = {
  user:     { from: ['in_progress'], to: 'completed' },
  provider: { allowed: ['accepted','traveling','in_progress'] },
  admin:    { allowed: ['started'] },
};

const generateInvoice = (booking, service, provider, user) => {
  const breakdown = [{ item: service?.name || 'Service', amount: booking.baseAmount }];
  if (booking.isBundleBooking && booking.discountAmount > 0) {
    breakdown.push({ item: `Bundle Discount (${booking.bundleDiscount}%)`, amount: -booking.discountAmount });
  }
  return {
    invoiceId: 'INV-' + booking.bookingId,
    generatedAt: new Date().toISOString(),
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: booking.phone,
    customerAddress: booking.address,
    providerName: provider?.name || 'N/A',
    providerPhone: provider?.phone || 'N/A',
    serviceName: service?.name || '',
    serviceDescription: service?.shortDescription || '',
    bookingDate: booking.bookingDate,
    timeSlot: booking.timeSlot,
    breakdown,
    baseAmount: booking.baseAmount,
    discountAmount: booking.discountAmount || 0,
    totalAmount: booking.totalAmount,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    notes: booking.notes || '',
    legalNote: 'Prices are service charges only. Final cost may vary based on actual work done.',
  };
};

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, bookingDate, timeSlot, address, phone, notes,
      bundleServices, isBundleBooking, paymentMethod, aiMatchUsed, city } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    let baseAmount = service.priceRange.min;
    let discountAmount = 0;
    let bundleDiscount = 0;

    if (isBundleBooking && bundleServices?.length > 0) {
      for (const bid of bundleServices) {
        const bs = await Service.findById(bid);
        if (bs) baseAmount += bs.priceRange.min;
      }
      bundleDiscount = bundleServices.length >= 2 ? 15 : 10;
      discountAmount = Math.round(baseAmount * (bundleDiscount / 100));
    }

    const totalAmount = baseAmount - discountAmount;

    // Auto-assign nearest provider if none selected
    let resolvedProviderId = providerId || null;
    if (!resolvedProviderId && city) {
      const Provider = require('../models/Provider');
      const { ALLOWED_CITIES } = require('../models/Provider');
      const cityProximity = require('../controllers/providerController').CITY_PROXIMITY;
      const cityOrder = cityProximity[city] || ALLOWED_CITIES;
      for (const c of cityOrder) {
        const p = await Provider.findOne({ isActive: true, availabilityStatus: { $ne: 'offline' }, services: serviceId, city: c });
        if (p) { resolvedProviderId = p._id; break; }
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: resolvedProviderId,
      bookingDate,
      timeSlot,
      address,
      phone,
      notes,
      baseAmount,
      discountAmount,
      totalAmount,
      bundleServices: bundleServices || [],
      isBundleBooking: !!isBundleBooking,
      bundleDiscount,
      paymentMethod: paymentMethod || 'cash',
      aiMatchUsed: !!aiMatchUsed,
      trackingHistory: [{ status: 'pending', timestamp: new Date(), note: 'Booking created' }],
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalBookings: 1, totalSpent: totalAmount } });
    if (resolvedProviderId) await Provider.findByIdAndUpdate(resolvedProviderId, { $inc: { totalJobs: 1 } });

    const populated = await Booking.findById(booking._id)
      .populate('service', 'name priceRange images slug')
      .populate('provider', 'name phone avatar rating trustScore');

    res.status(201).json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'service', populate: { path: 'category', select: 'name icon color emoji' } })
      .populate('provider', 'name phone avatar rating trustScore availabilityStatus city')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'service', populate: { path: 'category', select: 'name icon' } })
      .populate('provider', 'name phone avatar rating trustScore availabilityStatus city');
    if (!b) return res.status(404).json({ message: 'Not found' });
    const isOwner = b.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isProvider = req.user.role === 'provider' && b.provider?._id?.toString() === req.user._id.toString();
    if (!isOwner && !isAdmin && !isProvider) return res.status(403).json({ message: 'Not authorized' });
    res.json(b);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateTrackingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });

    const role = req.user.role;
    const currentIdx = STATUS_FLOW.indexOf(booking.status);
    const newIdx = STATUS_FLOW.indexOf(status);

    if (newIdx === -1) return res.status(400).json({ message: 'Invalid status' });

    // Strict role-based sequential permission check
    if (role === 'user') {
      if (status !== 'completed') return res.status(403).json({ message: 'Users can only mark as completed' });
      if (booking.status !== 'in_progress') return res.status(400).json({ message: 'Can only complete when In Progress' });
    } else if (role === 'provider') {
      if (!['accepted','traveling','in_progress'].includes(status))
        return res.status(403).json({ message: 'Providers can only set: accepted, traveling, in_progress' });
      if (newIdx !== currentIdx + 1)
        return res.status(400).json({ message: 'Must follow status flow sequentially' });
    } else if (role === 'admin') {
      if (status !== 'started') return res.status(403).json({ message: 'Admin can only set: started' });
      if (booking.status !== 'traveling') return res.status(400).json({ message: 'Can only start when Traveling' });
    }

    booking.status = status;
    booking.trackingHistory.push({ status, timestamp: new Date(), note: note || '' });

    if (status === 'completed') {
      const service = await Service.findById(booking.service);
      const provider = booking.provider ? await Provider.findById(booking.provider) : null;
      const user = await User.findById(booking.user).select('name email phone');
      booking.invoiceData = generateInvoice(booking, service, provider, user);
      booking.invoiceGenerated = true;
      if (booking.provider) await Provider.findByIdAndUpdate(booking.provider, { $inc: { completedJobs: 1 } });
    }
    if (status === 'cancelled') {
      if (booking.provider) await Provider.findByIdAndUpdate(booking.provider, { $inc: { cancelledJobs: 1 } });
    }

    await booking.save();
    res.json(booking);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Not found' });

    const role = req.user.role;
    const isOwner = b.user.toString() === req.user._id.toString();

    if (role === 'user') {
      if (!isOwner) return res.status(403).json({ message: 'Not authorized' });
      // User can only cancel before accepted
      if (b.status !== 'pending') return res.status(400).json({ message: 'You can only cancel before the provider accepts' });
    } else if (role === 'admin') {
      // Admin can cancel at pending or accepted only
      if (!['pending','accepted'].includes(b.status)) return res.status(400).json({ message: 'Admin can cancel only pending or accepted bookings' });
    } else {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }

    b.status = 'cancelled';
    b.cancelReason = req.body.reason || '';
    b.trackingHistory.push({ status: 'cancelled', timestamp: new Date(), note: req.body.reason || `Cancelled by ${role}` });
    await b.save();
    res.json(b);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('service', 'name priceRange')
        .populate('provider', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getInvoice = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('service', 'name shortDescription priceRange')
      .populate('provider', 'name phone city');
    if (!b) return res.status(404).json({ message: 'Not found' });
    if (b.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const invoice = generateInvoice(b, b.service, b.provider, b.user);
    res.json(invoice);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
