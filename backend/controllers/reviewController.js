const Review = require('../models/Review');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

exports.getServiceReviews = async (req, res) => {
  try {
    const s = await Service.findOne({ slug: req.params.slug });
    if (!s) return res.status(404).json({ message: 'Not found' });
    const reviews = await Review.find({ service: s._id }).populate('user','name avatar').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createReview = async (req, res) => {
  try {
    const { serviceId, providerId, bookingId, rating, providerRating, comment, title } = req.body;

    // Only allow review after booking is completed
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.status !== 'completed') return res.status(400).json({ message: 'Can only review completed bookings' });
      if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    }

    const existing = await Review.findOne({ user: req.user._id, booking: bookingId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this booking' });

    const review = await Review.create({
      user: req.user._id, service: serviceId, provider: providerId,
      booking: bookingId, rating, providerRating: providerRating || rating, comment, title
    });

    // Mark booking as reviewed
    if (bookingId) await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

    // Update service average rating
    const reviews = await Review.find({ service: serviceId });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Service.findByIdAndUpdate(serviceId, { rating: Math.round(avg * 10) / 10, numReviews: reviews.length });

    // Update provider rating
    if (providerId) {
      const pReviews = await Review.find({ provider: providerId });
      const pAvg = pReviews.reduce((a, r) => a + (r.providerRating || r.rating), 0) / pReviews.length;
      const provider = await Provider.findById(providerId);
      if (provider) {
        provider.rating = Math.round(pAvg * 10) / 10;
        provider.numReviews = pReviews.length;
        provider.calculateTrustScore();
        await provider.save();
      }
    }

    res.status(201).json(await Review.findById(review._id).populate('user', 'name avatar'));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteReview = async (req, res) => {
  try {
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await r.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
