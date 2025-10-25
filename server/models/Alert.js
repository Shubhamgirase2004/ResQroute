const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fire', 'medical', 'accident', 'traffic', 'police'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
