const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('Please provide an email address.');
        console.log('Usage: node create-admin.js <email>');
        process.exit(1);
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! User ${user.name} (${user.email}) is now an Admin.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

promoteUser();
