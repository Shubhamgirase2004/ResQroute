const admin = require('../config/firebase');

class FCMService {
  static async sendToDevice(token, notification, data = {}) {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data,
      android: {
        priority: 'high'
      },
      webpush: {
        notification: {
          icon: '/emergency-icon.png',
          vibrate: [200, 100, 200]
        }
      }
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Notification sent:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendToMultipleDevices(tokens, notification, data = {}) {
    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`✅ Sent: ${response.successCount}/${tokens.length}`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = FCMService;
