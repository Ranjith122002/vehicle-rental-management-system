const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All admin routes require authentication and admin role
router.use(auth, role('admin'));

// @route GET /api/admin/analytics - System analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalVehicles = await Vehicle.countDocuments({ isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const monthlyActiveUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Revenue calculation
    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['completed', 'active'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalVehicles,
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      monthlyActiveUsers,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route PUT /api/admin/users/:id - Update user status
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/admin/vehicles - Get all vehicles (including unapproved)
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route PUT /api/admin/vehicles/:id/approve - Approve vehicle
router.put('/vehicles/:id/approve', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('owner', 'name email');
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/admin/bookings - Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
