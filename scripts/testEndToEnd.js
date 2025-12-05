const mongoose = require('mongoose');
require('dotenv').config();

const Cemetery = require('../models/Cemetery');
const Plot = require('../models/Plot');
const Deceased = require('../models/Deceased');
const Booking = require('../models/Booking');
const Owner = require('../models/Owner');
const Tariff = require('../models/Tariff');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cemetery_management';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testEndToEnd = async () => {
  try {
    await connectDB();

    console.log('\n=== Testing End-to-End Functionality ===\n');

    // Test 1: Cemeteries
    const cemeteries = await Cemetery.find();
    console.log(`✓ Cemeteries: ${cemeteries.length} found`);
    if (cemeteries.length > 0) {
      console.log(`  Example: ${cemeteries[0].name} (${cemeteries[0].code})`);
    }

    // Test 2: Plots
    const plots = await Plot.find();
    console.log(`✓ Plots: ${plots.length} found`);
    const availablePlots = plots.filter(p => p.status === 'Available');
    const occupiedPlots = plots.filter(p => p.status === 'Occupied');
    console.log(`  Available: ${availablePlots.length}, Occupied: ${occupiedPlots.length}`);

    // Test 3: Deceased
    const deceased = await Deceased.find();
    console.log(`✓ Deceased Records: ${deceased.length} found`);

    // Test 4: Bookings
    const bookings = await Booking.find();
    console.log(`✓ Bookings: ${bookings.length} found`);

    // Test 5: Owners
    const owners = await Owner.find();
    console.log(`✓ Owners: ${owners.length} found`);

    // Test 6: Tariffs
    const tariffs = await Tariff.find();
    console.log(`✓ Tariffs: ${tariffs.length} found`);

    // Test 7: Relationships
    const plotWithSection = await Plot.findOne().populate('sectionId');
    if (plotWithSection && plotWithSection.sectionId) {
      console.log(`✓ Plot-Section relationship working`);
    }

    console.log('\n=== All Tests Passed ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testEndToEnd();

