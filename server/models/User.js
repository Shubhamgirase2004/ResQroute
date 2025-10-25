const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  fcmToken: { type: String }, // ✅ ADD THIS
  fcmTokens: [{ type: String }] // ✅ ADD THIS (for multiple devices)
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
