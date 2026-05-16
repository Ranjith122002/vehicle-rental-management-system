const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Calculate price helper
function calculatePrice(vehicle, startDate, endDate, durationType) {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  if (durationType === 'monthly') return vehicle.pricingPlans.monthly || vehicle.pricingPlans.daily * 28;
  if (durationType === 'weekly') return vehicle.pricingPlans.weekly || vehicle.pricingPlans.daily * 7;
  return vehicle.pricingPlans.daily * days;
}

// @route POST /api/bookings - Create booking
router.post('/', auth, role('customer'), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, rentalDuration, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    if (vehicle.availabilityStatus !== 'available') {
      return res.status(400).json({ msg: 'Vehicle is not available' });
    }

    // Check for conflicting bookings (only approved/active block, not pending)
    const conflict = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['approved', 'active'] },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) }
    });
    if (conflict) return res.status(400).json({ msg: 'Vehicle already booked for this period' });

    const totalPrice = calculatePrice(vehicle, startDate, endDate, rentalDuration);
    const booking = new Booking({
      user: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      rentalDuration,
      totalPrice,
      notes
    });

    await booking.save();
    await booking.populate(['user', 'vehicle']);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route GET /api/bookings/my - Get current user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/bookings/owner - Get bookings for owner's vehicles
router.get('/owner', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);
    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route PUT /api/bookings/:id/status - Approve/Reject booking (owner/admin)
router.put('/:id/status', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('vehicle');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    booking.status = status;
    if (status === 'approved') {
      await Vehicle.findByIdAndUpdate(booking.vehicle._id, { availabilityStatus: 'booked' });
    } else if (status === 'rejected' || status === 'cancelled' || status === 'completed') {
      await Vehicle.findByIdAndUpdate(booking.vehicle._id, { availabilityStatus: 'available' });
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route PUT /api/bookings/:id/cancel - Cancel booking (customer)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    booking.status = 'cancelled';
    await booking.save();
    await Vehicle.findByIdAndUpdate(booking.vehicle, { availabilityStatus: 'available' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
