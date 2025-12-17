const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmstay');
        console.log('MongoDB Connected');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'MISSING');

        const user = await User.findOne({ email: 'admin@farmstay.com' });
        if (!user) {
            console.log('Admin user NOT FOUND');
        } else {
            console.log('Admin user found:', user.email);
            console.log('Hashed Password:', user.password);
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('Password Match for "admin123":', isMatch);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyAdmin();
