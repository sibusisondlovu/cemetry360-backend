const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models (assuming index.js exports them, if not import individually)
const { User, Role, Undertaker } = require('../models');
// If models/index.js doesn't export them all, fallback to individual imports:
// const User = require('../models/User');
// const Role = require('../models/Role');
// const Undertaker = require('../models/Undertaker');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(mongoURI);
        console.log('✓ MongoDB connected');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const resetProject = async () => {
    await connectDB();
    console.log('\n=== Resetting Project Data ===\n');

    // 1. Clear all Collections
    console.log('Clearing database...');
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
    console.log('✓ Database cleared');

    // 2. Create Roles
    console.log('Creating roles...');
    const rolesData = [
        { name: 'Administrator', description: 'Full system access' },
        { name: 'Cemetery Manager', description: 'Cemetery management access' },
        { name: 'Cemetery Clerk', description: 'Front office and booking access' },
        { name: 'Burial Officer', description: 'On-site operations access' },
        { name: 'Finance User', description: 'Financial and billing access' },
        { name: 'Funeral Undertaker', description: 'Self-service portal for undertakers' },
        { name: 'Read-only', description: 'View-only access' },
    ];
    const createdRoles = await Role.insertMany(rolesData);
    console.log(`✓ Created ${createdRoles.length} roles`);

    // Helper to get role ID
    const getRoleId = (name) => createdRoles.find(r => r.name === name)._id;

    // 3. Create Users
    console.log('Creating users...');
    const defaultPassword = 'password123'; // Default password as requested
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const usersToCreate = [
        {
            username: 'admin',
            email: 'admin@mcms.local',
            fullName: 'System Administrator',
            roleName: 'Administrator'
        },
        {
            username: 'manager',
            email: 'manager@mcms.local',
            fullName: 'Cemetery Manager',
            roleName: 'Cemetery Manager'
        },
        {
            username: 'clerk',
            email: 'clerk@mcms.local',
            fullName: 'Cemetery Clerk',
            roleName: 'Cemetery Clerk'
        },
        // Undertaker requires special handling
    ];

    for (const u of usersToCreate) {
        await User.create({
            username: u.username,
            email: u.email,
            password: hashedPassword,
            fullName: u.fullName,
            roleId: getRoleId(u.roleName)
        });
        console.log(`✓ Created user: ${u.email} (${u.roleName})`);
    }

    // 4. Create Undertaker User & Profile
    const undertakerUserPayload = {
        username: 'undertaker1',
        email: 'undertaker1@example.com', // Requested email
        fullName: 'Sipho Mthembu',
        password: hashedPassword,
        roleId: getRoleId('Funeral Undertaker')
    };

    const undertakerUser = await User.create(undertakerUserPayload);
    console.log(`✓ Created user: ${undertakerUser.email} (Funeral Undertaker)`);

    // Create Undertaker Profile (Required for logic to work)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    await Undertaker.create({
        userId: undertakerUser._id,
        businessName: 'Durban Funeral Services',
        registrationNumber: 'UND-001',
        contactPerson: undertakerUser.fullName,
        email: undertakerUser.email,
        phone: '031 201 2001',
        address: '123 West Street, Durban, 4001',
        // Dummy documents to satisfy validation
        certificateOfCompetence: 'CoC-RESET-001',
        certificateExpiryDate: futureDate,
        dhaDesignationNumber: 'DHA-RESET-001',
        businessLicense: 'BL-RESET-001',
        businessLicenseExpiryDate: futureDate,
        taxRegistrationNumber: 'TAX-RESET-001',
        taxRegistrationExpiryDate: futureDate,
        associationMembershipProof: 'AMP-RESET-001',
        associationMembershipExpiryDate: futureDate,
        isActive: true,
    });
    console.log(`✓ Created undertaker profile for: ${undertakerUser.email}`);

    console.log('\n=== Reset Complete ===\n');
    console.log('New Credentials:');
    usersToCreate.forEach(u => console.log(`- ${u.roleName}: ${u.email} / ${defaultPassword}`));
    console.log(`- Funeral Undertaker: undertaker1@example.com / ${defaultPassword}`);
    console.log('\n');

    await mongoose.disconnect();
    process.exit(0);
};

resetProject();
