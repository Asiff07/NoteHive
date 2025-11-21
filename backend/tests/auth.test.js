const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth.routes');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock Mongoose models
jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
}));

const User = require('../models/User');

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a user with valid university email', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            _id: '123',
            name: 'Test User',
            email: 'test@stu.adamasuniversity.ac.in',
            role: 'student'
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@stu.adamasuniversity.ac.in',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registration successful. Please login.');
    });

    it('should reject registration with invalid email domain', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Bad User',
                email: 'bad@gmail.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Only @stu.adamasuniversity.ac.in emails are allowed.');
    });
});
