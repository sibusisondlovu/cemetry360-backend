const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Undertaker = require('../models/Undertaker');
const User = require('../models/User');

const verifyUndertakers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cemetery_management';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB\n');

    const undertakers = await Undertaker.find().populate('userId', 'email username fullName');
    
    console.log('=== Undertaker Credentials & Documents ===\n');
    
    for (const u of undertakers) {
      console.log(`Business: ${u.businessName}`);
      console.log(`Email: ${u.userId?.email || u.email}`);
      console.log(`Password: undertaker123`);
      console.log(`Username: ${u.userId?.username || 'N/A'}`);
      console.log(`Contact: ${u.contactPerson}`);
      console.log(`\nRequired Documents:`);
      console.log(`  Certificate of Competence (CoC): ${u.certificateOfCompetence ? '✓ ' + u.certificateOfCompetence : '✗ Missing'}`);
      console.log(`  CoC Expiry: ${u.certificateExpiryDate ? new Date(u.certificateExpiryDate).toLocaleDateString() : 'N/A'}`);
      console.log(`  DHA Designation Number: ${u.dhaDesignationNumber ? '✓ ' + u.dhaDesignationNumber : '✗ Missing'}`);
      console.log(`  Business License: ${u.businessLicense ? '✓ ' + u.businessLicense : '✗ Missing'}`);
      console.log(`  License Expiry: ${u.businessLicenseExpiryDate ? new Date(u.businessLicenseExpiryDate).toLocaleDateString() : 'N/A'}`);
      console.log(`  Tax Registration: ${u.taxRegistrationNumber ? '✓ ' + u.taxRegistrationNumber : '✗ Missing'}`);
      console.log(`  Tax Expiry: ${u.taxRegistrationExpiryDate ? new Date(u.taxRegistrationExpiryDate).toLocaleDateString() : 'N/A'}`);
      console.log(`  Association Membership: ${u.associationMembershipProof ? '✓ ' + u.associationMembershipProof : '✗ Missing'}`);
      console.log(`  Membership Expiry: ${u.associationMembershipExpiryDate ? new Date(u.associationMembershipExpiryDate).toLocaleDateString() : 'N/A'}`);
      console.log(`  Status: ${u.isActive ? '✓ Active' : '✗ Inactive'}`);
      
      // Check if all required documents are present
      const hasAllDocs = u.certificateOfCompetence && 
                         u.dhaDesignationNumber && 
                         u.businessLicense && 
                         u.taxRegistrationNumber && 
                         u.associationMembershipProof;
      
      console.log(`\n  Can Create Bookings: ${hasAllDocs && u.isActive ? '✓ YES' : '✗ NO'}`);
      console.log('─'.repeat(50));
      console.log('');
    }

    await mongoose.connection.close();
    console.log('✓ Verification complete');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

verifyUndertakers();

