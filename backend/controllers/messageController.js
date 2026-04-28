const Message = require('../models/Message');
const Booking = require('../models/Booking');

exports.getMessages = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.bookingId);
    if (!b) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user._id.toString();
    const isUser = b.user.toString() === userId;
    const isProvider = req.user.role === 'provider' && b.provider?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isProvider && !isAdmin)
      return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ booking: req.params.bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, messageType } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const b = await Booking.findById(req.params.bookingId);
    if (!b) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user._id.toString();
    const isUser = b.user.toString() === userId;
    const isProvider = req.user.role === 'provider' && b.provider?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isProvider && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to send messages in this booking' });

    const senderRole = isProvider ? 'provider' : isAdmin ? 'system' : 'user';

    const msg = await Message.create({
      booking: req.params.bookingId,
      sender: senderRole,
      senderId: req.user._id,
      senderName: req.user.name,
      message,
      messageType: messageType || 'text',
    });

    res.status(201).json(msg);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
