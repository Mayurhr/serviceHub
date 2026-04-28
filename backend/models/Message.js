const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender: { type: String, enum: ['user','provider','system'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderName: { type: String, default: '' },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text','image','system','consultation'], default: 'text' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
