const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Cemetery = require('../models/Cemetery');
const Section = require('../models/Section');
const Plot = require('../models/Plot');
const Crematorium = require('../models/Crematorium');
const Deceased = require('../models/Deceased');
const BurialEvent = require('../models/BurialEvent');
const Owner = require('../models/Owner');
const Ownership = require('../models/Ownership');
const Booking = require('../models/Booking');
const Tariff = require('../models/Tariff');
const Role = require('../models/Role');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cemetery_management';
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected for seeding');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    return false;
  }
};

const seedEThekwini = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    console.log('\n=== Seeding eThekwini Municipality Data ===\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Cemetery.deleteMany({});
    await Section.deleteMany({});
    await Plot.deleteMany({});
    await Crematorium.deleteMany({});
    await Deceased.deleteMany({});
    await BurialEvent.deleteMany({});
    await Owner.deleteMany({});
    await Ownership.deleteMany({});
    await Booking.deleteMany({});
    await Tariff.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // eThekwini Municipality Cemeteries (Durban area)
    const cemeteriesData = [
      {
        name: 'Westville Cemetery',
        code: 'WVL',
        address: 'Cnr. Jan Hofmeyr Road & St James Avenue, Westville, Durban, 3629',
        gpsLatitude: -29.8400,
        gpsLongitude: 30.9200,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 60',
        contactPhone: '031 311 1111',
        contactEmail: 'westville.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
      {
        name: 'Stellawood Cemetery',
        code: 'STL',
        address: 'Stellawood Road, Durban North, Durban, 4051',
        gpsLatitude: -29.8000,
        gpsLongitude: 31.0000,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 31',
        contactPhone: '031 311 1112',
        contactEmail: 'stellawood.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
      {
        name: 'Clairwood Cemetery',
        code: 'CLW',
        address: 'Cnr. Bellair Road & Cemetery Road, Clairwood, Durban, 4052',
        gpsLatitude: -29.9600,
        gpsLongitude: 30.9800,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 68',
        contactPhone: '031 311 1113',
        contactEmail: 'clairwood.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
      {
        name: 'Pinetown Cemetery',
        code: 'PIN',
        address: 'Old Main Road, Pinetown, Durban, 3610',
        gpsLatitude: -29.7800,
        gpsLongitude: 30.8500,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 58',
        contactPhone: '031 311 1114',
        contactEmail: 'pinetown.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
      {
        name: 'Chatsworth Cemetery',
        code: 'CHT',
        address: 'Chatsworth Drive, Chatsworth, Durban, 4092',
        gpsLatitude: -29.9200,
        gpsLongitude: 30.8800,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 70',
        contactPhone: '031 311 1115',
        contactEmail: 'chatsworth.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
      {
        name: 'Phoenix Cemetery',
        code: 'PHX',
        address: 'Phoenix Highway, Phoenix, Durban, 4068',
        gpsLatitude: -29.7500,
        gpsLongitude: 31.0200,
        status: 'Open',
        type: 'Mixed',
        region: 'eThekwini',
        ward: 'Ward 52',
        contactPhone: '031 311 1116',
        contactEmail: 'phoenix.cemetery@ethekwini.gov.za',
        openingHours: 'Monday-Sunday: 07:00-17:00',
      },
    ];

    console.log('Creating cemeteries...');
    const createdCemeteries = await Cemetery.insertMany(cemeteriesData);
    console.log(`✓ Created ${createdCemeteries.length} cemeteries`);

    // Create sections
    const sectionTypes = [
      { name: 'Roman Catholic', code: 'RC' },
      { name: 'Anglican', code: 'ANG' },
      { name: 'Methodist', code: 'MET' },
      { name: 'Muslim', code: 'MUS' },
      { name: 'Hindu', code: 'HIN' },
      { name: 'General', code: 'GEN' },
      { name: 'Children', code: 'CHD' },
      { name: 'Pauper', code: 'PAU' },
    ];

    const sectionsData = [];
    for (const cemetery of createdCemeteries) {
      for (let i = 0; i < 4; i++) {
        const sectionType = sectionTypes[i % sectionTypes.length];
        sectionsData.push({
          cemeteryId: cemetery._id,
          name: `${sectionType.name} Section`,
          code: `${cemetery.code}-${sectionType.code}-${i + 1}`,
          description: `${sectionType.name} burial section`,
          status: 'Active',
        });
      }
    }

    console.log('Creating sections...');
    const createdSections = await Section.insertMany(sectionsData);
    console.log(`✓ Created ${createdSections.length} sections`);

    // Create plots
    console.log('Creating plots...');
    const plotsData = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];

    for (const section of createdSections) {
      const cemetery = createdCemeteries.find(c => c._id.equals(section.cemeteryId));
      
      for (let row = 0; row < 3; row++) {
        for (let plotNum = 1; plotNum <= 10; plotNum++) {
          const uniqueId = `${cemetery.code}-${section.code}-${rows[row]}-${plotNum}`;
          const graveTypes = ['Single', 'Double-Depth', 'Family'];
          const statuses = ['Available', 'Available', 'Available', 'Reserved', 'Occupied'];
          
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const graveType = graveTypes[Math.floor(Math.random() * graveTypes.length)];
          const allowedBurials = graveType === 'Family' ? 4 : (graveType === 'Double-Depth' ? 2 : 1);
          
          const plot = {
            sectionId: section._id,
            uniqueIdentifier: uniqueId,
            row: rows[row],
            plotNumber: plotNum.toString(),
            graveType: graveType,
            graveSize: '2m x 1m',
            allowedBurials: allowedBurials,
            currentBurials: status === 'Occupied' ? allowedBurials : 0,
            status: status,
            gpsLatitude: cemetery.gpsLatitude + (Math.random() - 0.5) * 0.01,
            gpsLongitude: cemetery.gpsLongitude + (Math.random() - 0.5) * 0.01,
            location: {
              type: 'Point',
              coordinates: [
                cemetery.gpsLongitude + (Math.random() - 0.5) * 0.01,
                cemetery.gpsLatitude + (Math.random() - 0.5) * 0.01,
              ],
            },
          };

          plotsData.push(plot);
        }
      }
    }

    const createdPlots = await Plot.insertMany(plotsData);
    console.log(`✓ Created ${createdPlots.length} plots`);

    // Create crematoriums
    console.log('Creating crematoriums...');
    const crematoriumsData = [
      {
        name: 'Westville Crematorium',
        code: 'WVL-CREM',
        cemeteryId: createdCemeteries.find(c => c.code === 'WVL')._id,
        address: 'Westville Cemetery, Jan Hofmeyr Road, Westville, Durban, 3629',
        gpsLatitude: -29.8400,
        gpsLongitude: 30.9200,
        location: {
          type: 'Point',
          coordinates: [30.9200, -29.8400],
        },
        capacity: 3,
        status: 'Active',
        operatingHours: 'Monday-Sunday: 08:00-16:00',
        contactPhone: '031 311 2101',
      },
      {
        name: 'Stellawood Crematorium',
        code: 'STL-CREM',
        cemeteryId: createdCemeteries.find(c => c.code === 'STL')._id,
        address: 'Stellawood Cemetery, Stellawood Road, Durban North, Durban, 4051',
        gpsLatitude: -29.8000,
        gpsLongitude: 31.0000,
        location: {
          type: 'Point',
          coordinates: [31.0000, -29.8000],
        },
        capacity: 2,
        status: 'Active',
        operatingHours: 'Monday-Sunday: 08:00-16:00',
        contactPhone: '031 311 2102',
      },
      {
        name: 'Clairwood Crematorium',
        code: 'CLW-CREM',
        cemeteryId: createdCemeteries.find(c => c.code === 'CLW')._id,
        address: 'Clairwood Cemetery, Bellair Road, Clairwood, Durban, 4052',
        gpsLatitude: -29.9600,
        gpsLongitude: 30.9800,
        location: {
          type: 'Point',
          coordinates: [30.9800, -29.9600],
        },
        capacity: 3,
        status: 'Active',
        operatingHours: 'Monday-Sunday: 08:00-16:00',
        contactPhone: '031 311 2103',
      },
      {
        name: 'Pinetown Crematorium',
        code: 'PIN-CREM',
        cemeteryId: createdCemeteries.find(c => c.code === 'PIN')._id,
        address: 'Pinetown Cemetery, Old Main Road, Pinetown, Durban, 3610',
        gpsLatitude: -29.7800,
        gpsLongitude: 30.8500,
        location: {
          type: 'Point',
          coordinates: [30.8500, -29.7800],
        },
        capacity: 2,
        status: 'Active',
        operatingHours: 'Monday-Sunday: 08:00-16:00',
        contactPhone: '031 311 2104',
      },
    ];

    const createdCrematoriums = await Crematorium.insertMany(crematoriumsData);
    console.log(`✓ Created ${createdCrematoriums.length} crematoriums`);

    // Create deceased records
    console.log('Creating deceased records...');
    const deceasedNames = [
      { name: 'Sipho Mthembu', id: '8501015801085' },
      { name: 'Nomsa Dlamini', id: '9202154802085' },
      { name: 'Thabo Ndlovu', id: '7503055803085' },
      { name: 'Zanele Khumalo', id: '8804204804085' },
      { name: 'Mandla Zulu', id: '8206105805085' },
      { name: 'Nokuthula Cele', id: '9007254806085' },
      { name: 'Bongani Mkhize', id: '7808305807085' },
      { name: 'Lindiwe Ngubane', id: '9309124808085' },
    ];

    const deceasedData = [];
    for (let i = 0; i < 30; i++) {
      const baseName = deceasedNames[i % deceasedNames.length];
      const dateOfDeath = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      deceasedData.push({
        fullName: `${baseName.name} ${i > 7 ? i : ''}`,
        idNumber: baseName.id.replace(/\d{2}$/, String(i).padStart(2, '0')),
        dateOfDeath: dateOfDeath,
        sex: Math.random() > 0.5 ? 'Male' : 'Female',
        nationality: 'South African',
        maritalStatus: ['Single', 'Married', 'Widowed'][Math.floor(Math.random() * 3)],
      });
    }

    const createdDeceased = await Deceased.insertMany(deceasedData);
    console.log(`✓ Created ${createdDeceased.length} deceased records`);

    // Create burial events
    console.log('Creating burial events...');
    const occupiedPlots = createdPlots.filter(p => p.status === 'Occupied');
    const burialEventsData = [];

    for (let i = 0; i < Math.min(20, occupiedPlots.length, createdDeceased.length); i++) {
      const plot = occupiedPlots[i];
      const deceased = createdDeceased[i];
      const burialDate = new Date(deceased.dateOfDeath);
      burialDate.setDate(burialDate.getDate() + Math.floor(Math.random() * 7) + 1);

      burialEventsData.push({
        deceasedId: deceased._id,
        plotId: plot._id,
        burialDate: burialDate,
        burialTime: `${10 + Math.floor(Math.random() * 6)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        serviceType: 'Burial',
        funeralType: Math.random() > 0.3 ? 'Private' : 'Pauper',
        confirmed: true,
        confirmedAt: burialDate,
      });
    }

    await BurialEvent.insertMany(burialEventsData);
    console.log(`✓ Created ${burialEventsData.length} burial events`);

    // Create owners
    console.log('Creating owners...');
    const ownersData = [];
    for (let i = 0; i < 15; i++) {
      ownersData.push({
        name: `Owner ${i + 1} Surname`,
        idNumber: `8501015801${String(i).padStart(3, '0')}`,
        contactAddress: `${i + 1} Main Road, Durban, 4001`,
        phone: `031 ${String(200 + i).padStart(3, '0')} ${String(1000 + i).padStart(4, '0')}`,
        email: `owner${i + 1}@example.com`,
        ownershipType: ['Individual', 'Family'][Math.floor(Math.random() * 2)],
      });
    }

    const createdOwners = await Owner.insertMany(ownersData);
    console.log(`✓ Created ${createdOwners.length} owners`);

    // Create ownerships
    console.log('Creating ownerships...');
    const reservedPlots = createdPlots.filter(p => p.status === 'Reserved');
    const ownershipsData = [];

    for (let i = 0; i < Math.min(10, reservedPlots.length, createdOwners.length); i++) {
      ownershipsData.push({
        ownerId: createdOwners[i]._id,
        plotId: reservedPlots[i]._id,
        rightIssueDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        validityUnit: 'Perpetual',
        isActive: true,
      });
    }

    await Ownership.insertMany(ownershipsData);
    console.log(`✓ Created ${ownershipsData.length} ownerships`);

    // Create tariffs
    console.log('Creating tariffs...');
    const tariffsData = [
      {
        serviceType: 'Grave Purchase',
        serviceName: 'Single Grave Purchase',
        amount: 5500.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
      {
        serviceType: 'Grave Purchase',
        serviceName: 'Family Grave Purchase',
        amount: 13000.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
      {
        serviceType: 'Burial Fee',
        serviceName: 'Standard Burial Fee',
        amount: 2800.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
      {
        serviceType: 'Cremation Fee',
        serviceName: 'Cremation Service',
        amount: 3800.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
      {
        serviceType: 'Exhumation',
        serviceName: 'Exhumation Permit',
        amount: 5500.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
      {
        serviceType: 'Memorial Permit',
        serviceName: 'Headstone Permit',
        amount: 600.00,
        customerCategory: 'Resident',
        effectiveDate: new Date(2024, 0, 1),
        isActive: true,
      },
    ];

    await Tariff.insertMany(tariffsData);
    console.log(`✓ Created ${tariffsData.length} tariffs`);

    // Create sample bookings
    console.log('Creating bookings...');
    const availablePlots = createdPlots.filter(p => p.status === 'Available');
    const bookingsData = [];

    for (let i = 0; i < Math.min(5, availablePlots.length); i++) {
      const plot = availablePlots[i];
      const section = createdSections.find(s => s._id.equals(plot.sectionId));
      const cemetery = createdCemeteries.find(c => c._id.equals(section.cemeteryId));
      const deceased = createdDeceased[20 + i];
      const requestedDate = new Date();
      requestedDate.setDate(requestedDate.getDate() + Math.floor(Math.random() * 14) + 1);

      bookingsData.push({
        plotId: plot._id,
        deceasedId: deceased._id,
        cemeteryId: cemetery._id,
        requestedDate: requestedDate,
        requestedTime: `${10 + Math.floor(Math.random() * 6)}:00`,
        serviceDuration: 60,
        bufferMinutes: 30,
        status: ['Pending', 'Confirmed'][Math.floor(Math.random() * 2)],
        confirmationNumber: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
    }

    await Booking.insertMany(bookingsData);
    console.log(`✓ Created ${bookingsData.length} bookings`);

    console.log('\n=== Seeding Complete ===\n');
    console.log('Summary:');
    console.log(`  Cemeteries: ${createdCemeteries.length}`);
    console.log(`  Sections: ${createdSections.length}`);
    console.log(`  Plots: ${createdPlots.length}`);
    console.log(`  Crematoriums: ${createdCrematoriums.length}`);
    console.log(`  Deceased: ${createdDeceased.length}`);
    console.log(`  Burial Events: ${burialEventsData.length}`);
    console.log(`  Owners: ${createdOwners.length}`);
    console.log(`  Ownerships: ${ownershipsData.length}`);
    console.log(`  Tariffs: ${tariffsData.length}`);
    console.log(`  Bookings: ${bookingsData.length}`);
    console.log('\n✅ eThekwini Municipality demo data seeded successfully!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding data:', error);
    process.exit(1);
  }
};

seedEThekwini();

