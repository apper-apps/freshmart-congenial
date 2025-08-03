import ordersData from "@/services/mockData/orders.json";

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
    ordersData[index].status = status;
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
  }
};