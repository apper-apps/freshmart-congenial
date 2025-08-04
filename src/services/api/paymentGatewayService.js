import paymentGatewaysData from "@/services/mockData/paymentGateways.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentGatewayService = {
  async getAll() {
    await delay(300);
    return [...paymentGatewaysData].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getActive() {
    await delay(200);
    return paymentGatewaysData.filter(gateway => gateway.isActive);
  },

  async getById(id) {
    await delay(200);
    const gateway = paymentGatewaysData.find(g => g.Id === parseInt(id));
    if (!gateway) {
      throw new Error("Payment gateway not found");
    }
    return { ...gateway };
  },

  async create(gatewayData) {
    await delay(500);
    
    // Generate new ID
    const maxId = Math.max(...paymentGatewaysData.map(g => g.Id), 0);
    const newGateway = {
      ...gatewayData,
      Id: maxId + 1,
      isActive: gatewayData.isActive !== undefined ? gatewayData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    paymentGatewaysData.push(newGateway);
    return { ...newGateway };
  },

  async update(id, gatewayData) {
    await delay(300);
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    paymentGatewaysData[index] = {
      ...paymentGatewaysData[index],
      ...gatewayData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    return { ...paymentGatewaysData[index] };
  },

  async delete(id) {
    await delay(300);
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    // Check if gateway has active transactions (simulated check)
    const gateway = paymentGatewaysData[index];
    if (gateway.hasActiveTransactions) {
      throw new Error("Cannot delete gateway with active transactions");
    }
    
    const deleted = paymentGatewaysData.splice(index, 1)[0];
    return { ...deleted };
  },

  async toggleStatus(id) {
    await delay(200);
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    paymentGatewaysData[index].isActive = !paymentGatewaysData[index].isActive;
    paymentGatewaysData[index].updatedAt = new Date().toISOString();
    
    return { ...paymentGatewaysData[index] };
  }
};