const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route GET /api/vehicles - Get all available approved vehicles with filters
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, fuelType, transmission, location } = req.query;
    let query = { isApproved: true, availabilityStatus: 'available' };

    if (type) query.type = type;
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (location) query.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query['pricingPlans.daily'] = {};
      if (minPrice) query['pricingPlans.daily'].$gte = Number(minPrice);
      if (maxPrice) query['pricingPlans.daily'].$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query).populate('owner', 'name email');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/vehicles/:id - Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email phone');
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route POST /api/vehicles - Add vehicle (owner/admin)
router.post('/', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const vehicle = new Vehicle({ ...req.body, owner: req.user.id });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route PUT /api/vehicles/:id - Update vehicle
router.put('/:id', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await vehicle.deleteOne();
    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route GET /api/vehicles/owner/my - Get owner's vehicles
router.get('/owner/my', auth, role('owner', 'admin'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
