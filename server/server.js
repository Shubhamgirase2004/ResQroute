const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const fcmRoutes = require('./routes/fcm');



require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/alerts', alertRoutes);
app.use('/api/fcm', fcmRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'ResQroute API Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/emergencyroute';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
