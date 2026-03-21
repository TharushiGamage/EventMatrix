// MUST load before requiring any modules that use env vars
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Log that env was loaded
console.log('✅ dotenv loaded from:', path.join(__dirname, '.env'));
console.log('   MONGO_URI:', process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 50) + '...' : 'NOT SET');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const feedRoutes = require('./routes/feedRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded images as static files
app.use('/uploaded_images', express.static(path.join(__dirname, 'uploaded_images')));
// Serve uploaded payment receipts as static files
app.use('/uploaded_receipts', express.static(path.join(__dirname, 'uploaded_receipts')));

// Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/notifications', notificationRoutes);


// Health check
app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Smart Campus Event API is running' });
});

// Global error handler - MUST be last
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Try to connect to database, but continue anyway if it fails
        try {
            await connectDB();
            console.log('✅ Database connected successfully');
        } catch (dbError) {
            console.error('⚠️  Database connection failed, but server will continue running');
            console.error('   Error:', dbError.message);
        }
        
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
