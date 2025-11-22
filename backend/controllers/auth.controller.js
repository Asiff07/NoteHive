const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.register = async (req, res) => {
    try {
        console.log('Register request received:', req.body);
        const { name, email, password } = req.body;

        // 1. Validate email domain
        if (!email.endsWith('@stu.adamasuniversity.ac.in')) {
            return res.status(400).json({ message: 'Only @stu.adamasuniversity.ac.in emails are allowed.' });
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            // 5. Generate token
            const token = generateToken(user._id);

            // 6. Set cookie (same settings as login)
            const cookieOptions = {
                httpOnly: true,
                secure: false, // Keep false for dev
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            };
            console.log('Register Controller - Setting Cookie:', 'token', token.substring(0, 10) + '...', cookieOptions);
            res.cookie('token', token, cookieOptions);

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate token
        const token = generateToken(user._id);

        // 4. Set cookie
        const cookieOptions = {
            httpOnly: true,
            secure: false, // Keep false for dev
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        console.log('Login Controller - Setting Cookie:', 'token', token.substring(0, 10) + '...', cookieOptions);
        res.cookie('token', token, cookieOptions);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
