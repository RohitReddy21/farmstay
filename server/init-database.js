const mongoose = require('mongoose');
const User = require('./models/User');
const OtpVerification = require('./models/OtpVerification');

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing production database...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Check if collections exist
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        console.log('📋 Existing collections:', collectionNames);
        
        // Create User collection if not exists
        if (!collectionNames.includes('users')) {
            console.log('👤 Creating users collection...');
            await User.createIndexes();
            console.log('✅ Users collection created');
        } else {
            console.log('✅ Users collection already exists');
        }
        
        // Create OtpVerification collection if not exists
        if (!collectionNames.includes('otpverifications')) {
            console.log('🔢 Creating otpverifications collection...');
            await OtpVerification.createIndexes();
            console.log('✅ OtpVerification collection created');
        } else {
            console.log('✅ OtpVerification collection already exists');
        }
        
        // Test database operations
        console.log('🧪 Testing database operations...');
        
        // Test User model
        const userCount = await User.countDocuments();
        console.log('👤 Users in database:', userCount);
        
        // Test OtpVerification model
        const otpCount = await OtpVerification.countDocuments();
        console.log('🔢 OTP records in database:', otpCount);
        
        console.log('🎉 Database initialization complete!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

// Export for use in routes
module.exports = { initializeDatabase };

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}
