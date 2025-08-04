// Mock notification service for automated customer notifications
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock notification delivery tracking
const notificationHistory = [];
const notificationPreferences = {
  sms: { enabled: true, provider: 'Twilio' },
  email: { enabled: true, provider: 'SendGrid' },
  app: { enabled: true, provider: 'Firebase' }
};

// Mock delivery status tracking
const deliveryStatus = {
  pending: 'Queued for delivery',
  sent: 'Successfully delivered',
  failed: 'Delivery failed',
  bounced: 'Message bounced'
};

const notificationService = {
  // Send SMS notification on shipping
  async sendSMSNotification(orderId, customerData, orderData) {
    await delay(500);
    
    if (!notificationPreferences.sms.enabled) {
      throw new Error('SMS notifications are disabled');
    }

    const notification = {
      id: Date.now(),
      orderId,
      type: 'sms',
      recipient: customerData.phone || customerData.deliveryInfo?.phone,
      message: `Your order #${orderId} has been shipped! Track your package with items worth ₹${orderData.total}. Expected delivery in 2-3 days.`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      provider: notificationPreferences.sms.provider,
      metadata: {
        orderTotal: orderData.total,
        itemCount: orderData.items?.length || 0,
        shippingAddress: orderData.deliveryInfo?.address
      }
    };

    notificationHistory.push(notification);
    return notification;
  },

  // Send email notification on verification
  async sendEmailNotification(orderId, customerData, orderData) {
    await delay(400);

    if (!notificationPreferences.email.enabled) {
      throw new Error('Email notifications are disabled');
    }

    const notification = {
      id: Date.now() + 1,
      orderId,
      type: 'email',
      recipient: customerData.email || customerData.deliveryInfo?.email,
      subject: `Payment Verified - Order #${orderId}`,
      message: `Dear ${customerData.deliveryInfo?.fullName || 'Customer'}, your payment for order #${orderId} has been verified. Your order is now being processed.`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      provider: notificationPreferences.email.provider,
      metadata: {
        orderTotal: orderData.total,
        paymentMethod: orderData.paymentMethod,
        verificationDate: orderData.verificationDate
      }
    };

    notificationHistory.push(notification);
    return notification;
  },

  // Send app notification on delivery
  async sendAppNotification(orderId, customerData, orderData) {
    await delay(300);

    if (!notificationPreferences.app.enabled) {
      throw new Error('App notifications are disabled');
    }

    const notification = {
      id: Date.now() + 2,
      orderId,
      type: 'app',
      recipient: customerData.userId || `user_${orderId}`,
      title: 'Order Delivered Successfully!',
      message: `Your order #${orderId} has been delivered. Thank you for shopping with us!`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      provider: notificationPreferences.app.provider,
      metadata: {
        orderTotal: orderData.total,
        deliveryDate: new Date().toISOString(),
        deliveryAddress: orderData.deliveryInfo?.address
      }
    };

    notificationHistory.push(notification);
    return notification;
  },

  // Get notification history for an order
  async getNotificationHistory(orderId) {
    await delay(200);
    return notificationHistory.filter(n => n.orderId === orderId);
  },

  // Get all notification history
  async getAllNotifications() {
    await delay(200);
    return [...notificationHistory].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Update notification preferences
  async updatePreferences(preferences) {
    await delay(300);
    Object.assign(notificationPreferences, preferences);
    return notificationPreferences;
  },

  // Get current notification preferences
  async getPreferences() {
    await delay(100);
    return { ...notificationPreferences };
  },

  // Check notification delivery status
  async getDeliveryStatus(notificationId) {
    await delay(200);
    const notification = notificationHistory.find(n => n.id === notificationId);
    return notification ? {
      id: notificationId,
      status: notification.status,
      deliveredAt: notification.timestamp,
      attempts: 1,
      lastAttempt: notification.timestamp
    } : null;
  },

  // Resend failed notification
  async resendNotification(notificationId) {
    await delay(400);
    const notification = notificationHistory.find(n => n.id === notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Update status to resent
    notification.status = 'sent';
    notification.timestamp = new Date().toISOString();
    
    return notification;
  },

  // Get notification statistics
  async getStatistics() {
    await delay(200);
    const total = notificationHistory.length;
    const byType = notificationHistory.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    
    const byStatus = notificationHistory.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byType,
      byStatus,
      deliveryRate: total > 0 ? ((byStatus.sent || 0) / total * 100).toFixed(1) : '0',
      recentActivity: notificationHistory
        .filter(n => new Date() - new Date(n.timestamp) < 24 * 60 * 60 * 1000)
        .length
    };
  },

  // Send notification based on order status
  async sendAutomatedNotification(orderId, status, customerData, orderData) {
    try {
      let notification = null;
      
      switch (status) {
        case 'verified':
          notification = await this.sendEmailNotification(orderId, customerData, orderData);
          break;
        case 'shipped':
          notification = await this.sendSMSNotification(orderId, customerData, orderData);
          break;
        case 'delivered':
          notification = await this.sendAppNotification(orderId, customerData, orderData);
          break;
        default:
          return null;
      }
      
      return notification;
    } catch (error) {
      console.error('Automated notification failed:', error);
      // Log failed notification
      notificationHistory.push({
        id: Date.now(),
        orderId,
        type: this.getNotificationTypeForStatus(status),
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  // Helper method to determine notification type for status
  getNotificationTypeForStatus(status) {
    switch (status) {
      case 'verified': return 'email';
      case 'shipped': return 'sms';
      case 'delivered': return 'app';
      default: return 'unknown';
    }
  }
};

export { notificationService };