const mongoose = require('mongoose');

const connectDB = async () => {
    const envUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();
    const localUri = 'mongodb://127.0.0.1:27017/eventmatrix';
    
    console.log('DEBUG: process.env.MONGO_URI exists?', !!process.env.MONGO_URI);
    console.log('DEBUG: envUri:', envUri ? envUri.substring(0, 50) + '...' : 'NOT SET');
    
    const atlasOptions = {
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
    };
    
    const localOptions = {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    };
    
    // Try Atlas with retries
    if (envUri) {
        console.log('🔄 Attempting to connect to MongoDB Atlas (with retries)...');
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`   Attempt ${attempt}/3...`);
                await mongoose.connect(envUri, atlasOptions);
                console.log(`✅ MongoDB Atlas Connected successfully`);
                return;
            } catch (error) {
                console.error(`   ❌ Attempt ${attempt} failed: ${error.message}`);
                if (attempt < 3) {
                    // Wait before retrying (exponential backoff)
                    const delay = attempt * 2000;
                    console.log(`   ⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        console.warn('⚠️  All Atlas attempts failed. Falling back to local MongoDB...');
    } else {
        console.log('ℹ️  No Atlas URI found, skipping to local MongoDB...');
    }
    
    // Try local MongoDB as fallback
    try {
        console.log('🔄 Attempting to connect to local MongoDB...');
        await mongoose.connect(localUri, localOptions);
        console.log(`✅ Local MongoDB Connected successfully`);
        return;
    } catch (error) {
        console.error(`❌ Local MongoDB connection failed: ${error.message}`);
        console.error('\n⚠️  DATABASE CONNECTION FAILED');
        console.error('   To fix this, do ONE of the following:');
        console.error('   1. Start local MongoDB: mongod');
        console.error('   2. Check Atlas network settings (IP whitelist)');
        console.error('   3. Verify firewall allows *.mongodb.net');
        console.error('   4. Check internet connectivity\n');
        throw error;
    }
};

module.exports = connectDB;
