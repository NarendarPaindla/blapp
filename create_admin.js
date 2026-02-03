const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood-donation-system');
        console.log('MongoDB Connected');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@bloodlink.com' });

        if (adminExists) {
            console.log('Admin already exists.');
            adminExists.role = 'admin'; // Ensure role is admin
            await adminExists.save();
            console.log('Admin Role Verified/Updated.');
        } else {
            const admin = new User({
                name: 'System Admin',
                email: 'admin@bloodlink.com',
                password: 'adminpassword123', // Will be hashed by pre-save hook
                phone: '0000000000',
                location: 'HQ',
                role: 'admin'
            });

            await admin.save();
            console.log('Admin Account Created Successfully.');
        }

        console.log('\n--- ADMIN CREDENTIALS ---');
        console.log('Email: admin@bloodlink.com');
        console.log('Password: adminpassword123');
        console.log('-------------------------');

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createAdmin();
