const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentalDuration: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
