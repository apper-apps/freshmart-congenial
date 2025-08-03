import dealsData from "@/services/mockData/deals.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dealsService = {
  async getAll() {
    await delay(250);
    return [...dealsData];
  },

  async getById(id) {
    await delay(200);
    const deal = dealsData.find(d => d.Id === id);
    if (!deal) {
      throw new Error("Deal not found");
    }
    return { ...deal };
  },

  async getActiveDeals() {
    await delay(300);
    const now = new Date();
    return dealsData
      .filter(deal => new Date(deal.expiresAt) > now)
      .map(deal => ({ ...deal }));
  },

  async getDealsByType(type) {
    await delay(250);
    return dealsData
      .filter(deal => deal.type === type)
      .map(deal => ({ ...deal }));
  },

  async create(dealData) {
    await delay(400);
    const maxId = Math.max(...dealsData.map(d => d.Id));
    const newDeal = {
      ...dealData,
      Id: maxId + 1
    };
    dealsData.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await delay(400);
    const index = dealsData.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error("Deal not found");
    }
    dealsData[index] = { ...dealsData[index], ...dealData };
    return { ...dealsData[index] };
  },

  async delete(id) {
    await delay(300);
    const index = dealsData.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error("Deal not found");
    }
    const deleted = dealsData.splice(index, 1)[0];
    return { ...deleted };
  }
};