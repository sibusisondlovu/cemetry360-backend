const mongoose = require('mongoose');

const uris = [
    'mongodb://localhost:27017/cemetery_management',
    'mongodb://127.0.0.1:27017/cemetery_management'
];

async function testConnection(uri) {
    console.log(`Testing: ${uri}`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`✅ Success: ${uri}`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${uri} - ${err.message}`);
        return false;
    }
}

async function run() {
    for (const uri of uris) {
        if (await testConnection(uri)) {
            console.log(`\nFound working URI: ${uri}`);
            process.exit(0);
        }
    }
    console.log('\nNo working connection found.');
    process.exit(1);
}

run();
