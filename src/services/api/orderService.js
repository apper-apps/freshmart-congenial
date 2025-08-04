import ordersData from "@/services/mockData/orders.json";
import React from "react";
import { notificationService } from "@/services/api/notificationService";
import Error from "@/components/ui/Error";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  async getAll() {
    await delay(300);
    return [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(200);
    const order = ordersData.find(o => o.Id === id);
    if (!order) {
      throw new Error("Order not found");
    }
    return { ...order };
  },

  async create(orderData) {
    await delay(500);
    const maxId = Math.max(...ordersData.map(o => o.Id), 0);
    const newOrder = {
      ...orderData,
      Id: maxId + 1,
      status: "processing",
      createdAt: new Date().toISOString()
    };
    ordersData.push(newOrder);
    return { ...newOrder };
  },

async updateStatus(id, status) {
    await delay(300);
    const index = ordersData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const oldStatus = ordersData[index].status;
    ordersData[index].status = status;
    ordersData[index].statusHistory = ordersData[index].statusHistory || [];
    ordersData[index].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: "Admin"
    });

    // Send automated notification for status changes
    try {
      if (status !== oldStatus && ['verified', 'shipped', 'delivered'].includes(status)) {
        await notificationService.sendAutomatedNotification(
          id, 
          status, 
          ordersData[index].deliveryInfo, 
          ordersData[index]
        );
      }
    } catch (notificationError) {
      console.warn('Notification failed but order status updated:', notificationError.message);
    }

    return { ...ordersData[index] };
  },

  async delete(id) {
    await delay(300);
    const index = ordersData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    const deleted = ordersData.splice(index, 1)[0];
    return { ...deleted };
  },

  async getFiltered(filters) {
    await delay(400);
    let filtered = [...ordersData];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(order => filters.status.includes(order.status));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(order => new Date(order.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(order => new Date(order.createdAt) <= new Date(filters.dateTo));
    }

    if (filters.customerSearch) {
      const search = filters.customerSearch.toLowerCase();
      filtered = filtered.filter(order => 
        order.deliveryInfo?.fullName?.toLowerCase().includes(search) ||
        order.Id.toString().includes(search)
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(order => order.paymentMethod === filters.paymentMethod);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(order => order.total >= filters.minAmount);
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.total <= filters.maxAmount);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getStatistics() {
    await delay(300);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const stats = {
      pendingVerification: ordersData.filter(o => o.status === 'pending').length,
      verifiedPayments: ordersData.filter(o => o.status === 'verified' || o.status === 'processing').length,
      packedOrders: ordersData.filter(o => o.status === 'packed').length,
      shippedDeliveries: ordersData.filter(o => o.status === 'shipped').length,
      todayDeliveries: ordersData.filter(o => 
        o.status === 'delivered' && new Date(o.createdAt) >= todayStart
      ).length,
      totalRevenue: ordersData.reduce((sum, order) => sum + order.total, 0),
      todayRevenue: ordersData.filter(o => 
        new Date(o.createdAt) >= todayStart
      ).reduce((sum, order) => sum + order.total, 0)
    };

    return stats;
  },

async updatePaymentVerification(id, verified, notes) {
    await delay(300);
    const index = ordersData.findIndex(o => o.Id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }
    
    const wasUnverified = !ordersData[index].paymentVerified;
    ordersData[index].paymentVerified = verified;
    ordersData[index].verificationNotes = notes;
    ordersData[index].verificationDate = new Date().toISOString();
    
    if (verified) {
      ordersData[index].status = 'verified';
      
      // Send verification email notification
      try {
        if (wasUnverified) {
          await notificationService.sendAutomatedNotification(
            id,
            'verified',
            ordersData[index].deliveryInfo,
            ordersData[index]
          );
        }
      } catch (notificationError) {
        console.warn('Verification notification failed:', notificationError.message);
      }
    }
    
    return { ...ordersData[index] };
  },

  async getFrequentlyPurchased() {
    await delay(300);
    
    // Get all orders and extract product purchase frequency
    const productFrequency = {};
    const productDetails = {};
    
    ordersData.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.productId;
          if (!productFrequency[productId]) {
            productFrequency[productId] = 0;
            productDetails[productId] = item.product;
          }
          productFrequency[productId] += item.quantity;
        });
      }
    });

    // Convert to array and sort by frequency
    const frequentProducts = Object.entries(productFrequency)
      .map(([productId, count]) => ({
        ...productDetails[productId],
        Id: parseInt(productId),
        purchaseCount: count
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 12); // Return top 12 frequently purchased items

    return frequentProducts;
  },

  async getRecentlyPurchased() {
    await delay(300);
    
    // Get all unique products from recent orders
    const recentProducts = new Map();
    const sortedOrders = [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.productId;
          if (!recentProducts.has(productId)) {
            recentProducts.set(productId, {
              ...item.product,
              Id: parseInt(productId),
              lastPurchased: order.createdAt,
              purchaseCount: 1
            });
          } else {
            // Update purchase count for frequency tracking
            const existing = recentProducts.get(productId);
            existing.purchaseCount += 1;
          }
        });
      }
    });

// Convert to array and limit to recent 12 items
    return Array.from(recentProducts.values()).slice(0, 12);
  },

  // Monitoring Analytics Functions
  getMonitoringAnalytics: async () => {
    await delay(800);
    
    const totalOrders = ordersData.length;
    const verifiedToday = ordersData.filter(order => {
      const today = new Date().toDateString();
      return new Date(order.createdAt).toDateString() === today && order.status === 'verified';
}).length;
    
    const rejectedOrders = ordersData.filter(order => order.status === 'cancelled').length;
    const rejectionRate = totalOrders > 0 ? rejectedOrders / totalOrders : 0;
    
    return {
      avgVerificationTime: 45, // minutes
      targetTime: 60, // minutes
      rejectionRate: rejectionRate,
      rejectionTrend: 'down',
      rejectedToday: 2,
      verifiedToday: verifiedToday,
      verificationTrend: 'up',
      verificationChange: 12,
      dailyTarget: 50
    };
  },

  getVerificationHeatmap: async () => {
    await delay(600);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => ({
      day,
      hours: Array.from({ length: 12 }, (_, i) => {
        const hour = i + 8; // 8 AM to 7 PM
        const count = Math.floor(Math.random() * 25) + 1;
        const intensity = count < 8 ? 'low' : count < 16 ? 'medium' : 'high';
        
        return {
          hour,
          count,
          intensity
        };
      })
    }));
  },

  getModeratorProductivity: async () => {
    await delay(500);
    
    return [
      {
        id: 1,
        name: 'Alice Johnson',
        role: 'Senior Moderator',
        ordersVerified: 78,
        avgTime: 38,
        accuracyRate: 0.97,
        status: 'online'
      },
      {
        id: 2,
        name: 'Bob Smith',
        role: 'Moderator',
        ordersVerified: 65,
        avgTime: 42,
        accuracyRate: 0.94,
        status: 'online'
      },
      {
        id: 3,
        name: 'Carol Williams',
        role: 'Junior Moderator',
        ordersVerified: 45,
        avgTime: 58,
        accuracyRate: 0.91,
        status: 'offline'
      }
    ];
  },

  getSLAAlerts: async () => {
    await delay(400);
    
    return [
      {
        id: 'sla-001',
        orderId: 1001,
        message: 'Order verification approaching SLA deadline',
        timeRemaining: '2h 15m',
        priority: 'high'
      },
      {
        id: 'sla-002',
        orderId: 1005,
        message: 'Payment verification overdue',
        timeRemaining: 'Overdue',
        priority: 'critical'
      }
    ];
  },

  getVerificationFailures: async () => {
    await delay(450);
    
    return [
      {
        id: 'fail-001',
        orderId: 1003,
        failureType: 'Payment',
        reason: 'Invalid payment gateway response',
        timestamp: new Date().toISOString()
      },
      {
        id: 'fail-002',
        orderId: 1007,
        failureType: 'Document',
        reason: 'Missing required verification documents',
        timestamp: new Date().toISOString()
      }
    ];
  },

  getDiscrepancyAlerts: async () => {
    await delay(350);
    
    return [
      {
        id: 'disc-001',
        orderId: 1004,
        severity: 'Medium',
        description: 'Order total mismatch with payment amount',
        detectedAt: new Date().toISOString()
      },
      {
        id: 'disc-002',
        orderId: 1008,
        severity: 'Low',
        description: 'Delivery address format inconsistency',
        detectedAt: new Date().toISOString()
      }
    ];
  },

  resolveAlert: async (alertId, action) => {
    await delay(300);
    
    // In a real implementation, this would update the alert status
    console.log(`Alert ${alertId} resolved with action: ${action}`);
    
    // Send notification about alert resolution
    if (notificationService?.createNotification) {
      await notificationService.createNotification({
        type: 'system',
        title: 'Alert Resolved',
        message: `Alert ${alertId} has been ${action}d successfully`,
        priority: 'normal'
      });
    }
    
    return { success: true, action };
  }
};