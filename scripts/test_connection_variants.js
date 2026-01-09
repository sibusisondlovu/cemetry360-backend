const mongoose = require('mongoose');

const password = '!Obenyathi@2025';
const encodedPassword = encodeURIComponent(password);

const uris = [
    // Original from .env
    'mongodb+srv://dbadmin_user:%21Obenyathi%402025@cluster0.ck9sh20.mongodb.net/cemetery_management?appName=Cluster0',
    // Manually encoded
    `mongodb+srv://dbadmin_user:${encodedPassword}@cluster0.ck9sh20.mongodb.net/cemetery_management?appName=Cluster0`,
    // Not encoded (some drivers handle it)
    `mongodb+srv://dbadmin_user:${password}@cluster0.ck9sh20.mongodb.net/cemetery_management?appName=Cluster0`,
    // Trying 'admin' auth source
    `mongodb+srv://dbadmin_user:${encodedPassword}@cluster0.ck9sh20.mongodb.net/cemetery_management?authSource=admin&appName=Cluster0`,
    // Just the Cluster, no DB name
    `mongodb+srv://dbadmin_user:${encodedPassword}@cluster0.ck9sh20.mongodb.net/?appName=Cluster0`,
];

async function testConnection(uri) {
    console.log(`\nTesting: ${uri.replace(/:([^:@]+)@/, ':***@')}`); // Hide password in logs
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ Success!`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log('Starting connection tests...');
    for (const uri of uris) {
        if (await testConnection(uri)) {
            console.log(`\nFound working configuration!`);
            // Print the working one (be careful with logs, but user needs it)
            console.log('WORKING URI:', uri);
            process.exit(0);
        }
    }
    console.log('\nAll attempts failed.');
    process.exit(1);
}

run();
