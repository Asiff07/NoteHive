const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testRegistration = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'test_debug@stu.adamasuniversity.ac.in';

        // Cleanup previous test
        await User.deleteOne({ email });

        console.log('Attempting to create user...');
        const user = await User.create({
            name: 'Debug User',
            email: email,
            password: 'password123', // This will be hashed by pre-save hook if it exists, but wait...
            // In auth.controller.js, hashing is done MANUALLY in the controller.
            // The model might not have a pre-save hook. Let's check User.js later.
            // But for this test, we just want to see if we can write to DB.
        });

        console.log('User created successfully:', user);

        // Clean up
        await User.deleteOne({ email });
        console.log('Test user cleaned up.');

        process.exit(0);
    } catch (error) {
        console.error('Registration Test Failed:', error);
        process.exit(1);
    }
};

testRegistration();
