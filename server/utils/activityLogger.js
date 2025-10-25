const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, description, metadata = {}, req = null) => {
  try {
    const log = new ActivityLog({
      user: userId,
      action,
      description,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('user-agent') || 'unknown',
      metadata
    });
    await log.save();
    console.log(`✅ Activity logged: ${action} by user ${userId}`);
    return log;
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    return null;
  }
};
module.exports = { logActivity };
