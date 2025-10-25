const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
    // ✅ No enum - allows any action type (flexible for future additions)
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true  // ✅ Automatically adds createdAt and updatedAt
});

// ✅ Performance indexes for fast queries
ActivityLogSchema.index({ user: 1, createdAt: -1 });  // Fast user activity lookups
ActivityLogSchema.index({ action: 1 });                // Fast action type filtering

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
