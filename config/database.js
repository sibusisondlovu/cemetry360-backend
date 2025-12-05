const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cemetery_management';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('\n⚠️  MongoDB is not running or not accessible.');
    console.error('Please start MongoDB or update MONGODB_URI in server/.env');
    console.error('For quick setup, use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
    // Don't exit - let the server start but API calls will fail gracefully
  }
};

module.exports = connectDB;

