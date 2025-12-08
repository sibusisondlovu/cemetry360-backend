require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { Role, User } = require('./models');
const bcrypt = require('bcryptjs');
const roleFilter = require('./middleware/roleFilter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Role-based filtering middleware (applied after authentication)
app.use('/api', roleFilter);

const authRoutes = require('./routes/auth');
const cemeteryRoutes = require('./routes/cemeteries');
const plotRoutes = require('./routes/plots');
const deceasedRoutes = require('./routes/deceased');
const bookingRoutes = require('./routes/bookings');
const burialRoutes = require('./routes/burials');
const ownerRoutes = require('./routes/owners');
const reportRoutes = require('./routes/reports');
const workOrderRoutes = require('./routes/workOrders');
const enquiryRoutes = require('./routes/enquiries');
const tariffRoutes = require('./routes/tariffs');
const serviceChargeRoutes = require('./routes/serviceCharges');
const sectionRoutes = require('./routes/sections');
const exhumationRoutes = require('./routes/exhumations');
const crematoriumRoutes = require('./routes/crematoriums');
const undertakerRoutes = require('./routes/undertaker');
const calendarRoutes = require('./routes/calendar');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/cemeteries', cemeteryRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/crematoriums', crematoriumRoutes);
app.use('/api/deceased', deceasedRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/burials', burialRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/exhumations', exhumationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/service-charges', serviceChargeRoutes);
app.use('/api/undertaker', undertakerRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const initializeDatabase = async () => {
  try {
    await connectDB();

    const roles = await Role.find();
    if (roles.length === 0) {
      await Role.insertMany([
        { name: 'Administrator', description: 'Full system access' },
        { name: 'Cemetery Manager', description: 'Cemetery management access' },
        { name: 'Cemetery Clerk', description: 'Front office and booking access' },
        { name: 'Burial Officer', description: 'On-site operations access' },
        { name: 'Finance User', description: 'Financial and billing access' },
        { name: 'Funeral Undertaker', description: 'Self-service portal for undertakers' },
        { name: 'Read-only', description: 'View-only access' },
      ]);
      console.log('Default roles created.');
    }

    const users = await User.find();
    if (users.length === 0) {
      const adminRole = await Role.findOne({ name: 'Administrator' });
      const managerRole = await Role.findOne({ name: 'Cemetery Manager' });
      const clerkRole = await Role.findOne({ name: 'Cemetery Clerk' });

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@mcms.local',
        password: hashedPassword,
        fullName: 'System Administrator',
        roleId: adminRole._id,
      });

      const managerPassword = await bcrypt.hash('manager123', 10);
      await User.create({
        username: 'manager',
        email: 'manager@mcms.local',
        password: managerPassword,
        fullName: 'Cemetery Manager',
        roleId: managerRole._id,
      });

      const clerkPassword = await bcrypt.hash('clerk123', 10);
      await User.create({
        username: 'clerk',
        email: 'clerk@mcms.local',
        password: clerkPassword,
        fullName: 'Cemetery Clerk',
        roleId: clerkRole._id,
      });

      console.log('Default users created.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;

