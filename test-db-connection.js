require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log('Testing connection from .env...');
console.log('URI:', uri ? uri.replace(/:([^:@]+)@/, ':***@') : 'undefined');

if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connection SUCCESSFUL!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection FAILED');
        console.error('Error:', err.message);
        process.exit(1);
    });
