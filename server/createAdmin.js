const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmstay');
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await User.deleteOne({ email: 'admin@farmstay.com' });

        // Create new admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@farmstay.com',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@farmstay.com');
        console.log('Password: admin123');
        console.log('Role:', admin.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdminUser();
