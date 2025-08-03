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
  }
};