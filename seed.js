const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./server/models/User');
const Vehicle = require('./server/models/Vehicle');
const Booking = require('./server/models/Booking');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);

    // Create users
    const [customer, owner, admin] = await User.insertMany([
      {
        name: 'Demo Customer',
        email: 'customer@demo.com',
        password: await bcrypt.hash('123456', salt),
        phone: '+91 9876543210',
        role: 'customer'
      },
      {
        name: 'Demo Owner',
        email: 'owner@demo.com',
        password: await bcrypt.hash('123456', salt),
        phone: '+91 9876543211',
        role: 'owner'
      },
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: await bcrypt.hash('123456', salt),
        phone: '+91 9876543212',
        role: 'admin'
      }
    ]);

    console.log('Users created');

    // Create vehicles
    const vehicles = await Vehicle.insertMany([
      {
        name: 'Honda Activa 6G',
        type: '2W', brand: 'Honda', model: 'Activa 6G', modelYear: 2023,
        fuelType: 'Petrol', transmission: 'Automatic', vehicleNumber: 'KA01AB1234',
        pricingPlans: { daily: 350, weekly: 2100, monthly: 7500 },
        availabilityStatus: 'available', location: 'Bangalore',
        specs: 'Popular scooter with excellent mileage. Perfect for city commutes.',
        owner: owner._id, isApproved: true
      },
      {
        name: 'Royal Enfield Classic 350',
        type: '2W', brand: 'Royal Enfield', model: 'Classic 350', modelYear: 2022,
        fuelType: 'Petrol', transmission: 'Manual', vehicleNumber: 'KA02CD5678',
        pricingPlans: { daily: 700, weekly: 4200, monthly: 15000 },
        availabilityStatus: 'available', location: 'Bangalore',
        specs: 'Iconic cruiser bike. Ideal for highway trips and weekend getaways.',
        owner: owner._id, isApproved: true
      },
      {
        name: 'Maruti Suzuki Swift',
        type: '4W', brand: 'Maruti Suzuki', model: 'Swift', modelYear: 2023,
        fuelType: 'Petrol', transmission: 'Manual', vehicleNumber: 'KA03EF9012',
        pricingPlans: { daily: 1200, weekly: 7500, monthly: 25000 },
        availabilityStatus: 'available', location: 'Bangalore',
        specs: 'Compact hatchback. Great fuel efficiency for city and highway drives.',
        owner: owner._id, isApproved: true
      },
      {
        name: 'Toyota Innova Crysta',
        type: '4W', brand: 'Toyota', model: 'Innova Crysta', modelYear: 2022,
        fuelType: 'Diesel', transmission: 'Manual', vehicleNumber: 'KA04GH3456',
        pricingPlans: { daily: 2500, weekly: 16000, monthly: 55000 },
        availabilityStatus: 'available', location: 'Bangalore',
        specs: '7-seater premium MPV. Perfect for family trips or group travel.',
        owner: owner._id, isApproved: true
      },
      {
        name: 'Tata Nexon EV',
        type: '4W', brand: 'Tata', model: 'Nexon EV', modelYear: 2023,
        fuelType: 'Electric', transmission: 'Automatic', vehicleNumber: 'KA05IJ7890',
        pricingPlans: { daily: 1800, weekly: 11000, monthly: 38000 },
        availabilityStatus: 'available', location: 'Bangalore',
        specs: 'Electric SUV with 300km range. Zero emission, smooth city driving.',
        owner: owner._id, isApproved: true
      },
      {
        name: 'TVS Jupiter',
        type: '2W', brand: 'TVS', model: 'Jupiter', modelYear: 2023,
        fuelType: 'Petrol', transmission: 'Automatic', vehicleNumber: 'KA06KL2345',
        pricingPlans: { daily: 300, weekly: 1800, monthly: 6500 },
        availabilityStatus: 'available', location: 'Mumbai',
        specs: 'Comfortable family scooter with extra storage space.',
        owner: owner._id, isApproved: true
      },
    ]);

    console.log('Vehicles created');


    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo accounts:');
    console.log('  Customer: customer@demo.com / 123456');
    console.log('  Owner:    owner@demo.com / 123456');
    console.log('  Admin:    admin@demo.com / 123456');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
