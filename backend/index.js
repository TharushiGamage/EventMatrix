require('dotenv').config(); // feed fields updated
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const feedRoutes = require('./routes/feedRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploaded_images', express.static(path.join(__dirname, 'uploaded_images')));

// Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/feed', feedRoutes);

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
