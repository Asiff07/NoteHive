require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const chatRoutes = require('./routes/chat.routes');
const reviewRoutes = require('./routes/review.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

const fs = require('fs');
const path = require('path');

// GLOBAL DEBUG LOGGING
app.use((req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\nCookies: ${JSON.stringify(req.cookies)}\nHeaders: ${JSON.stringify(req.headers)}\n\n`;
    fs.appendFileSync(path.join(__dirname, 'backend_debug.log'), logMessage);
    console.log(logMessage);
    next();
});

// Rate Limiting (increased for development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs (increased from 100)
});
app.use(limiter);

// Stripe Webhook needs raw body, so we mount it before express.json()
// However, in payment.routes.js we handled it with express.raw() on the specific route.
// So we can just use express.json() globally, but we need to be careful.
// The standard way is to use a custom verify function or just mount the webhook route before this.
// But since we defined the raw parser in the route itself, it should be fine IF we don't parse JSON before it.
// Express executes middleware in order.
// So we should mount payment routes that need raw body BEFORE express.json() OR use a condition.
// Actually, `paymentRoutes` has the webhook. If we mount `app.use(express.json())` here, it will parse the body for ALL routes.
// We need to exclude the webhook route from global json parsing or move the webhook route to a separate file mounted before json.
// For simplicity, let's just use the `verify` option in `express.json` to preserve raw body if needed, OR just rely on the route-specific parser if we don't mount json globally yet.
// But we need json for other routes.
// Best practice: Mount webhook routes FIRST.

app.use('/api/payments/webhook', paymentRoutes); // Only webhooks here? No, paymentRoutes has other stuff.
// Let's split payment routes or just handle the JSON parsing carefully.
// A common pattern:
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notes', reviewRoutes); // Review routes are nested under notes
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes); // The rest of payment routes
app.use('/api/chat', chatRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Only listen if not running in Vercel (Vercel exports the app)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
