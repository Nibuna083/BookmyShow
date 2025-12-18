const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const NodeCache = require('node-cache');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const seatRoutes = require('./routes/seats');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache

// Middleware
app.use(cors());
app.use(express.json());

// Make cache available globally
app.locals.cache = cache;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', seatRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});