const Message = require('../models/Message');
const Booking = require('../models/Booking');

exports.getMessages = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.bookingId);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (b.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const messages = await Message.find({ booking: req.params.bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, messageType } = req.body;
    const b = await Booking.findById(req.params.bookingId);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    const msg = await Message.create({
      booking: req.params.bookingId,
      sender: 'user',
      senderId: req.user._id,
      message,
      messageType: messageType || 'text',
    });
    // Simulate provider auto-reply for consultation
    if (b.isProblemConsultation && messageType === 'consultation') {
      await Message.create({
        booking: req.params.bookingId,
        sender: 'system',
        senderId: b.provider || req.user._id,
        message: '✅ Your query has been noted. The provider will respond shortly. You can also call directly for urgent help.',
        messageType: 'system',
      });
    }
    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
