import subscriptionData from '@/services/mockData/subscriptions.json';

let subscriptions = [...subscriptionData];
let nextId = Math.max(...subscriptions.map(s => s.Id)) + 1;

const subscriptionService = {
  getAll: () => {
    return Promise.resolve([...subscriptions]);
  },

  getById: (id) => {
    const subscription = subscriptions.find(s => s.Id === parseInt(id));
    if (!subscription) {
      return Promise.reject(new Error('Subscription not found'));
    }
    return Promise.resolve({ ...subscription });
  },

  create: (subscriptionData) => {
    const newSubscription = {
      ...subscriptionData,
      Id: nextId++,
      createdAt: new Date().toISOString(),
      status: 'active',
      skippedDates: []
    };
    subscriptions.push(newSubscription);
    return Promise.resolve({ ...newSubscription });
  },

  update: (id, updates) => {
    const index = subscriptions.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Subscription not found'));
    }
    
    subscriptions[index] = { ...subscriptions[index], ...updates };
    return Promise.resolve({ ...subscriptions[index] });
  },

  delete: (id) => {
    const index = subscriptions.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Subscription not found'));
    }
    
    const deleted = subscriptions.splice(index, 1)[0];
    return Promise.resolve({ ...deleted });
  },

  updateFrequency: (id, frequency) => {
    return subscriptionService.update(id, { frequency });
  },

  skipDelivery: (id, date) => {
    const subscription = subscriptions.find(s => s.Id === parseInt(id));
    if (!subscription) {
      return Promise.reject(new Error('Subscription not found'));
    }

    const skippedDates = [...subscription.skippedDates, date];
    return subscriptionService.update(id, { skippedDates });
  },

  pauseSubscription: (id) => {
    return subscriptionService.update(id, { status: 'paused' });
  },

  resumeSubscription: (id) => {
    return subscriptionService.update(id, { status: 'active' });
  },

  cancelSubscription: (id) => {
    return subscriptionService.update(id, { status: 'cancelled' });
  },

  getUpcomingDeliveries: (subscriptionId, weeks = 8) => {
    return new Promise((resolve) => {
      const subscription = subscriptions.find(s => s.Id === parseInt(subscriptionId));
      if (!subscription) {
        resolve([]);
        return;
      }

      const deliveries = [];
      const startDate = new Date(subscription.nextDelivery);
      const frequencyDays = {
        'weekly': 7,
        'bi-weekly': 14,
        'monthly': 30
      };

      const intervalDays = frequencyDays[subscription.frequency] || 7;

      for (let i = 0; i < weeks; i++) {
        const deliveryDate = new Date(startDate);
        deliveryDate.setDate(startDate.getDate() + (i * intervalDays));
        
        const isSkipped = subscription.skippedDates.some(skipped => 
          new Date(skipped).toDateString() === deliveryDate.toDateString()
        );

        deliveries.push({
          date: deliveryDate.toISOString(),
          isSkipped,
          canSkip: deliveryDate > new Date()
        });
      }

      resolve(deliveries);
    });
  }
};

export { subscriptionService };