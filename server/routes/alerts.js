const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');
const FCMService = require('../services/fcmService');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ============================================
// MIDDLEWARE: Verify Token
// ============================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No authorization header' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token error:', error.message);
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

// ============================================
// MIDDLEWARE: Verify Admin
// ============================================
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin only.' });
  next();
};

// ============================================
// CREATE ALERT
// ============================================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, message, location, coordinates, priority } = req.body;
    console.log('📝 Creating alert:', { type, location, priority });
    
    const userId = req.user.userId || req.user.id || req.user._id || req.user.sub;
    if (!userId) return res.status(400).json({ message: 'Invalid token: no user ID' });
    
    // Defensive validation
    if (!type || !message || !location) return res.status(400).json({ message: 'Missing type, message, or location' });

    // Safe coordinates
    const safeCoordinates = (coordinates && coordinates.latitude && coordinates.longitude)
      ? { latitude: parseFloat(coordinates.latitude), longitude: parseFloat(coordinates.longitude) }
      : { latitude: 0, longitude: 0 };

    const newAlert = new Alert({
      type, message, location,
      coordinates: safeCoordinates,
      priority: priority || 'high',
      status: 'active',
      createdBy: userId
    });
    await newAlert.save();
    console.log('✅ Alert created:', newAlert._id);

    // Log activity (non-blocking)
    try {
      await logActivity(userId, 'alert_created', `Created ${type.toUpperCase()} alert: ${message}`,
        { alertId: newAlert._id.toString(), type, location, priority: newAlert.priority }, req);
    } catch (e) { console.warn('Activity logging failed:', e.message); }

    // === NOTIFICATIONS (non-blocking) ===
    try {
      // 1. Notify admins
      const admins = await User.find({ role: 'admin', fcmToken: { $exists: true, $ne: null } });
      const adminTokens = admins.map(a => a.fcmToken).filter(Boolean);
      if (adminTokens.length > 0 && FCMService?.sendToMultipleDevices) {
        await FCMService.sendToMultipleDevices(adminTokens,
          { title: '🚨 NEW EMERGENCY ALERT', body: `${type.toUpperCase()}: ${message} at ${location}` },
          { alertId: newAlert._id.toString(), type, location, priority: newAlert.priority, action: 'admin_review',
            latitude: safeCoordinates.latitude.toString(), longitude: safeCoordinates.longitude.toString() }
        );
      }

      // 2. Notify drivers
      const drivers = await User.find({ role: 'driver', fcmToken: { $exists: true, $ne: null } });
      const driverTokens = drivers.map(d => d.fcmToken).filter(Boolean);
      if (driverTokens.length > 0 && FCMService?.sendToMultipleDevices) {
        await FCMService.sendToMultipleDevices(driverTokens,
          { title: '🚑 EMERGENCY DISPATCH', body: `${type.toUpperCase()} alert: ${message}` },
          { alertId: newAlert._id.toString(), type, location, priority: newAlert.priority, action: 'respond_to_emergency',
            latitude: safeCoordinates.latitude.toString(), longitude: safeCoordinates.longitude.toString() }
        );
      }

      // 3. Notify nearby users
      if (safeCoordinates.latitude && safeCoordinates.longitude) {
        const users = await User.find({ role: 'user', fcmToken: { $exists: true, $ne: null } }).limit(50);
        const userTokens = users.map(u => u.fcmToken).filter(Boolean);
        if (userTokens.length > 0 && FCMService?.sendToMultipleDevices) {
          await FCMService.sendToMultipleDevices(userTokens,
            { title: '⚠️ CLEAR ROUTE AHEAD', body: `Emergency vehicle approaching near ${location}. Please clear the route.` },
            { alertId: newAlert._id.toString(), type, location, priority: newAlert.priority, action: 'clear_route',
              latitude: safeCoordinates.latitude.toString(), longitude: safeCoordinates.longitude.toString() }
          );
        }
      }
    } catch (notifyError) { console.warn('Notification failed:', notifyError.message); }

    res.status(201).json({ message: 'Alert created and notifications sent successfully', alert: newAlert });
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET ALL ALERTS
// ============================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const alerts = await Alert.find().populate('createdBy', 'name email role').sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET ALERT BY ID
// ============================================
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('createdBy', 'name email role');
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    console.error('❌ Error fetching alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// RESOLVE ALERT (Admin Only)
// ============================================
router.put('/:id/resolve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id,
      { status: 'resolved', resolvedAt: new Date() }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    try {
      await logActivity(req.user.userId, 'alert_resolved',
        `Resolved ${alert.type.toUpperCase()} alert at ${alert.location}`,
        { alertId: alert._id.toString(), type: alert.type, location: alert.location }, req);
    } catch (e) { console.warn('Activity logging failed:', e.message); }

    // Notify resolution
    try {
      const allUsers = await User.find({ fcmToken: { $exists: true, $ne: null } });
      const allTokens = allUsers.map(u => u.fcmToken).filter(Boolean);
      if (allTokens.length > 0 && FCMService?.sendToMultipleDevices) {
        await FCMService.sendToMultipleDevices(allTokens,
          { title: '✅ ALERT RESOLVED', body: `${alert.type.toUpperCase()} alert at ${alert.location} has been resolved.` },
          { alertId: alert._id.toString(), type: alert.type, action: 'alert_resolved' }
        );
      }
    } catch (e) { console.warn('Notification failed:', e.message); }

    res.json({ message: 'Alert resolved successfully', alert });
  } catch (error) {
    console.error('❌ Error resolving alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// DELETE ALERT (Admin Only)
// ============================================
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    try {
      await logActivity(req.user.userId, 'alert_deleted',
        `Deleted ${alert.type.toUpperCase()} alert at ${alert.location}`,
        { alertId: alert._id.toString(), type: alert.type, location: alert.location }, req);
    } catch (e) { console.warn('Activity logging failed:', e.message); }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// UPDATE ALERT STATUS (Admin Only)
// ============================================
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'resolved', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const alert = await Alert.findByIdAndUpdate(req.params.id,
      { status, ...(status === 'resolved' ? { resolvedAt: new Date() } : {}) }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    try {
      await logActivity(req.user.userId, 'alert_updated',
        `Changed alert status to ${status} for ${alert.type} alert at ${alert.location}`,
        { alertId: alert._id.toString(), type: alert.type, location: alert.location, newStatus: status }, req);
    } catch (e) { console.warn('Activity logging failed:', e.message); }

    res.json({ message: 'Alert status updated successfully', alert });
  } catch (error) {
    console.error('❌ Error updating alert status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
