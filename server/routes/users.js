const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger'); // ✅ Add this

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
// GET ALL USERS (Admin Only)
// ============================================
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching all users');
    
    const users = await User.find()
      .select('-password') // Exclude password
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET USER BY ID (Admin Only)
// ============================================
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching user:', id);
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.email);
    
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// UPDATE USER ROLE (Admin Only)
// ============================================
router.put('/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log('🔄 Updating user role:', id, 'to', role);

    // Validate role
    const validRoles = ['user', 'admin', 'driver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: user, admin, driver' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User role updated:', user.email);

    // ✅ Log role change
    await logActivity(
      req.user.userId,
      'role_changed',
      `Changed ${user.name}'s role to ${role}`,
      { 
        targetUserId: user._id.toString(),
        targetUserEmail: user.email,
        oldRole: user.role, // Note: This will show new role due to update
        newRole: role 
      },
      req
    );

    res.json({ 
      message: 'User role updated successfully', 
      user 
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// DELETE USER (Admin Only)
// ============================================
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting user:', id);

    // Prevent admin from deleting themselves
    if (req.user.userId === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User deleted:', user.email);

    // ✅ Log user deletion
    await logActivity(
      req.user.userId,
      'user_deleted',
      `Deleted user: ${user.name} (${user.email})`,
      { 
        deletedUserId: user._id.toString(),
        deletedUserEmail: user.email,
        deletedUserRole: user.role 
      },
      req
    );

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// UPDATE USER PROFILE (Self or Admin)
// ============================================
router.put('/:id/profile', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Users can only update their own profile, admins can update anyone's
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('📝 Updating profile for user:', id);

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Profile updated:', user.email);

    // ✅ Log profile update
    await logActivity(
      req.user.userId,
      'profile_updated',
      `Updated profile for ${user.name}`,
      { 
        targetUserId: user._id.toString(),
        updatedFields: Object.keys(updateData)
      },
      req
    );

    res.json({ 
      message: 'Profile updated successfully', 
      user 
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// GET USER STATS (Admin Only)
// ============================================
router.get('/stats/overview', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching user stats');
    
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const driverCount = await User.countDocuments({ role: 'driver' });
    const regularCount = await User.countDocuments({ role: 'user' });
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const stats = {
      total: totalUsers,
      admins: adminCount,
      drivers: driverCount,
      users: regularCount,
      recent: recentUsers
    };
    
    console.log('✅ Stats generated');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
