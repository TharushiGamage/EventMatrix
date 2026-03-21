require('dotenv').config();
const express = require('express');
const path = require('path');
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

// Global error handler
app.use(errorHandler);

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
