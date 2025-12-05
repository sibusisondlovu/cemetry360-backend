const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Role = require('../models/Role');
const Undertaker = require('../models/Undertaker');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cemetery_management';
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected for seeding undertakers');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    return false;
  }
};

const seedUndertakers = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    console.log('\n=== Seeding Funeral Undertakers ===\n');

    // Ensure Funeral Undertaker role exists
    let undertakerRole = await Role.findOne({ name: 'Funeral Undertaker' });
    if (!undertakerRole) {
      undertakerRole = await Role.create({
        name: 'Funeral Undertaker',
        description: 'Self-service portal for undertakers',
      });
      console.log('✓ Created Funeral Undertaker role');
    }

    // Create sample undertakers with all required documents
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2); // Valid for 2 years

    const undertakersData = [
      {
        businessName: 'Durban Funeral Services',
        registrationNumber: 'UND-001',
        contactPerson: 'Sipho Mthembu',
        email: 'undertaker1@example.com',
        phone: '031 201 2001',
        address: '123 West Street, Durban, 4001',
        certificateOfCompetence: 'CoC-ETH-001-2024',
        certificateExpiryDate: futureDate,
        dhaDesignationNumber: 'DHA-ETH-001-2024',
        businessLicense: 'BL-ETH-001-2024',
        businessLicenseExpiryDate: futureDate,
        taxRegistrationNumber: 'TAX-ETH-001-2024',
        taxRegistrationExpiryDate: futureDate,
        associationMembershipProof: 'AMP-ETH-001-2024',
        associationMembershipExpiryDate: futureDate,
        isActive: true,
      },
      {
        businessName: 'eThekwini Memorial Services',
        registrationNumber: 'UND-002',
        contactPerson: 'Nomsa Dlamini',
        email: 'undertaker2@example.com',
        phone: '031 201 2002',
        address: '456 Smith Street, Durban, 4001',
        certificateOfCompetence: 'CoC-ETH-002-2024',
        certificateExpiryDate: futureDate,
        dhaDesignationNumber: 'DHA-ETH-002-2024',
        businessLicense: 'BL-ETH-002-2024',
        businessLicenseExpiryDate: futureDate,
        taxRegistrationNumber: 'TAX-ETH-002-2024',
        taxRegistrationExpiryDate: futureDate,
        associationMembershipProof: 'AMP-ETH-002-2024',
        associationMembershipExpiryDate: futureDate,
        isActive: true,
      },
    ];

    for (const undertakerData of undertakersData) {
      // Check if undertaker already exists
      let undertaker = await Undertaker.findOne({ registrationNumber: undertakerData.registrationNumber });
      
      if (!undertaker) {
        // Create user account
        const hashedPassword = await bcrypt.hash('undertaker123', 10);
        const user = await User.create({
          username: undertakerData.registrationNumber.toLowerCase().replace('-', ''),
          email: undertakerData.email,
          password: hashedPassword,
          fullName: undertakerData.contactPerson,
          roleId: undertakerRole._id,
        });

        // Create undertaker profile with all required documents
        undertaker = await Undertaker.create({
          ...undertakerData,
          userId: user._id,
        });

        console.log(`✓ Created undertaker: ${undertakerData.businessName}`);
        console.log(`  Email: ${undertakerData.email} / Password: undertaker123`);
        console.log(`  All required documents configured and valid`);
      } else {
        // Update existing undertaker with required documents if missing
        const needsUpdate = !undertaker.certificateOfCompetence || 
                           !undertaker.dhaDesignationNumber || 
                           !undertaker.businessLicense || 
                           !undertaker.taxRegistrationNumber || 
                           !undertaker.associationMembershipProof;
        
        if (needsUpdate) {
          await Undertaker.findByIdAndUpdate(undertaker._id, {
            certificateOfCompetence: undertakerData.certificateOfCompetence,
            certificateExpiryDate: undertakerData.certificateExpiryDate,
            dhaDesignationNumber: undertakerData.dhaDesignationNumber,
            businessLicense: undertakerData.businessLicense,
            businessLicenseExpiryDate: undertakerData.businessLicenseExpiryDate,
            taxRegistrationNumber: undertakerData.taxRegistrationNumber,
            taxRegistrationExpiryDate: undertakerData.taxRegistrationExpiryDate,
            associationMembershipProof: undertakerData.associationMembershipProof,
            associationMembershipExpiryDate: undertakerData.associationMembershipExpiryDate,
          });
          console.log(`✓ Updated undertaker: ${undertakerData.businessName} (added required documents)`);
        } else {
          console.log(`- Undertaker already exists: ${undertakerData.businessName}`);
        }
      }
    }

    console.log('\n✅ Undertaker seeding complete!\n');
    console.log('Demo Undertaker Credentials:');
    console.log('  1. undertaker1@example.com / undertaker123');
    console.log('  2. undertaker2@example.com / undertaker123');
    console.log('\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding undertakers:', error);
    process.exit(1);
  }
};

seedUndertakers();


