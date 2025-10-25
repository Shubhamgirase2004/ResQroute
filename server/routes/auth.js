const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger'); // ✅ Add activity logging

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ============================================
// SIGNUP ROUTE (user or admin)
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate role (default to 'user')
    const userRole = role && ['user', 'admin', 'driver'].includes(role) ? role : 'user';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: userRole 
    });
    
    await newUser.save();
    console.log('✅ User created:', newUser.email);

    // ✅ Log signup activity
    await logActivity(
      newUser._id,
      'user_created',
      `${newUser.name} registered as ${userRole}`,
      { email: newUser.email, role: userRole },
      req
    );

    // Create JWT token with consistent field names
    const token = jwt.sign(
      { 
        userId: newUser._id.toString(),  // ✅ Consistent: userId
        email: newUser.email,
        name: newUser.name,
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      message: 'User registered successfully!',
      token,
      user: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error('❌ Signup error:', err);
    return res.status(500).json({ message: 'Server error during signup' });
  }
});

// ============================================
// UNIFIED LOGIN ROUTE (all roles)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('🔐 Login attempt for:', email);

    // Find user (any role)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful:', user.email, 'Role:', user.role);

    // ✅ Log login activity
    await logActivity(
      user._id,
      'login',
      `${user.name} logged in as ${user.role}`,
      { email: user.email, role: user.role },
      req
    );

    // Create JWT token with consistent field names
    const token = jwt.sign(
      { 
        userId: user._id.toString(),  // ✅ Consistent: userId
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// ============================================
// LOGOUT ROUTE
// ============================================
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // ✅ Log logout activity
        await logActivity(
          decoded.userId,
          'logout',
          `${decoded.name || 'User'} logged out`,
          { email: decoded.email },
          req
        );
      } catch (jwtError) {
        console.log('⚠️ Invalid token during logout (ignoring)');
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.json({ message: 'Logged out successfully' });
  }
});

// ============================================
// ADMIN-SPECIFIC LOGIN ROUTE (optional - for admin-only pages)
// ============================================
router.post('/login/admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt for:', email);

    // Find admin specifically
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Admin login successful:', admin.email);

    // ✅ Log admin login activity
    await logActivity(
      admin._id,
      'login',
      `Admin ${admin.name} logged in`,
      { email: admin.email, role: 'admin' },
      req
    );

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ 
      message: 'Admin login successful',
      token,
      user: {
        userId: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error('❌ Admin login error:', err);
    return res.status(500).json({ message: 'Server error during admin login' });
  }
});

// ============================================
// USER-SPECIFIC LOGIN ROUTE (optional)
// ============================================
router.post('/login/user', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 User login attempt for:', email);

    // Find regular user specifically
    const user = await User.findOne({ email, role: 'user' });
    if (!user) {
      return res.status(401).json({ message: 'User account not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User login successful:', user.email);

    // ✅ Log user login activity
    await logActivity(
      user._id,
      'login',
      `User ${user.name} logged in`,
      { email: user.email, role: 'user' },
      req
    );

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ 
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ User login error:', err);
    return res.status(500).json({ message: 'Server error during user login' });
  }
});

// ============================================
// GET CURRENT USER (protected route)
// ============================================
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
