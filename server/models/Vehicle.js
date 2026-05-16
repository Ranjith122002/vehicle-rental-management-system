const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['2W', '4W'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  modelYear: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'CNG'], required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  pricingPlans: {
    daily: { type: Number, required: true },
    weekly: { type: Number },
    monthly: { type: Number }
  },
  availabilityStatus: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
  location: { type: String, required: true },
  photos: [{ type: String }],
  specs: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
