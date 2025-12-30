const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const createdUser = await User.create([
            {
                name: 'Admin User',
                email: 'admin@rextoken.com',
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin',
                wallet: '0xAdminWalletAddress',
                status: 'active',
                kycStatus: 'verified',
                referralCode: 'ADM1001'
            },
            {
                name: 'John Doe',
                email: 'user@example.com',
                password: 'password123',
                role: 'user',
                wallet: '0xUserWalletAddress',
                status: 'active',
                kycStatus: 'pending',
                referralCode: 'JOH1002'
            },
        ]);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
