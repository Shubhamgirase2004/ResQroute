const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ UPDATED: Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    );
    
    console.log('✅ Decoded token:', decoded); // Debug log
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Register FCM token
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token required' });
    }

    // ✅ UPDATED: Handle different possible field names
    const userId = req.user.userId || req.user.id || req.user._id || req.user.sub;
    
    if (!userId) {
      console.error('❌ No user ID found in token:', req.user);
      return res.status(400).json({ message: 'Invalid token: no user ID' });
    }

    console.log('📝 Registering FCM token for user:', userId);

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        fcmToken,
        $addToSet: { fcmTokens: fcmToken }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    res.json({ message: 'FCM token registered successfully', user });
  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ UPDATED: Test notification route
router.post('/test', verifyToken, async (req, res) => {
  try {
    // ✅ Handle different possible field names
    const userId = req.user.userId || req.user.id || req.user._id || req.user.sub;
    
    if (!userId) {
      console.error('❌ No user ID found in token:', req.user);
      return res.status(400).json({ message: 'Invalid token: no user ID' });
    }

    console.log('🔍 Looking for user:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('❌ User not found in database for ID:', userId);
      return res.status(404).json({ 
        message: 'User not found',
        userId: userId,
        hint: 'Check if this user ID exists in MongoDB'
      });
    }

    console.log('✅ User found:', user.email);
    
    if (!user.fcmToken) {
      return res.status(400).json({ 
        message: 'No FCM token registered. Please log in again to register for notifications.' 
      });
    }

    console.log('📤 Sending notification to token:', user.fcmToken.substring(0, 20) + '...');

    const FCMService = require('../services/fcmService');
    
    const result = await FCMService.sendToDevice(
      user.fcmToken,
      {
        title: '🚨 Test Emergency Alert',
        body: 'This is a test notification from ResQroute'
      },
      {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    );

    if (result.success) {
      console.log('✅ Notification sent successfully');
      res.json({ 
        message: 'Test notification sent successfully!',
        messageId: result.messageId,
        user: {
          email: user.email,
          name: user.name
        }
      });
    } else {
      console.error('❌ Failed to send notification:', result.error);
      res.status(500).json({ 
        message: 'Failed to send notification',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Test notification error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
