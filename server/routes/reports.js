const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Alert = require('../models/Alert');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ============================================
// MIDDLEWARE: Verify Token
// ============================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ============================================
// MIDDLEWARE: Verify Admin
// ============================================
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// ============================================
// GET ALL ACTIVITY LOGS (Admin Only)
// ============================================
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId, action, limit = 50, page = 1 } = req.query;
    
    console.log('📋 Fetching activity logs');
    
    const query = {};
    if (userId) query.user = userId;
    if (action) query.action = action;

    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ActivityLog.countDocuments(query);

    console.log(`✅ Found ${logs.length} logs`);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: logs.length,
        totalLogs: total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET USER-SPECIFIC ACTIVITY LOGS
// ============================================
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own logs, admins can view anyone's
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('📋 Fetching logs for user:', userId);

    const logs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${logs.length} logs for user`);

    res.json(logs);
  } catch (error) {
    console.error('❌ Error fetching user logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// CREATE ACTIVITY LOG
// ============================================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { action, description, metadata } = req.body;
    
    const userId = req.user.userId || req.user.id || req.user._id;

    console.log('📝 Creating activity log:', action);

    const log = new ActivityLog({
      user: userId,
      action,
      description,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: metadata || {}
    });

    await log.save();

    console.log('✅ Activity log created:', log._id);

    res.status(201).json({ message: 'Log created', log });
  } catch (error) {
    console.error('❌ Error creating log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET DASHBOARD STATS (Admin Only)
// ============================================
router.get('/stats/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Alert stats
    const totalAlerts = await Alert.countDocuments();
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });

    // Activity stats
    const todayLogs = await ActivityLog.countDocuments({ 
      createdAt: { $gte: today } 
    });

    const recentActivities = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      alerts: {
        total: totalAlerts,
        active: activeAlerts,
        resolved: resolvedAlerts
      },
      activities: {
        today: todayLogs,
        recent: recentActivities
      }
    };

    console.log('✅ Stats generated');

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// DELETE OLD LOGS (Admin Only)
// ============================================
router.delete('/cleanup', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    console.log(`🗑️ Deleting logs older than ${days} days`);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Deleted ${result.deletedCount} logs`);

    res.json({ 
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
