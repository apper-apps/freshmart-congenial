import productsData from "@/services/mockData/products.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  async getAll() {
    await delay(300);
    return [...productsData];
  },

  async getById(id) {
    await delay(200);
    const product = productsData.find(p => p.Id === id);
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  },

  async getByCategory(category) {
    await delay(300);
    return productsData.filter(p => p.category === category).map(p => ({ ...p }));
  },

  async search(query) {
    await delay(300);
    const lowercaseQuery = query.toLowerCase();
    return productsData
      .filter(p => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      )
      .map(p => ({ ...p }));
  },

  async create(productData) {
    await delay(400);
    const maxId = Math.max(...productsData.map(p => p.Id));
    const newProduct = {
      ...productData,
      Id: maxId + 1
    };
    productsData.push(newProduct);
    return { ...newProduct };
  },

  async update(id, productData) {
    await delay(400);
    const index = productsData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    productsData[index] = { ...productsData[index], ...productData };
    return { ...productsData[index] };
  },

  async delete(id) {
    await delay(300);
    const index = productsData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error("Product not found");
    }
    const deleted = productsData.splice(index, 1)[0];
return { ...deleted };
  },

  async getTrendingByLocation(userLocation = "default") {
    await delay(350);
    
    // Location-based category preferences (simulated)
    const locationPreferences = {
      default: { Fruits: 0.3, Vegetables: 0.25, Dairy: 0.2, Bakery: 0.15, Meat: 0.1 },
      urban: { Bakery: 0.3, Dairy: 0.25, Fruits: 0.2, Vegetables: 0.15, Meat: 0.1 },
      suburban: { Vegetables: 0.3, Fruits: 0.25, Meat: 0.2, Dairy: 0.15, Bakery: 0.1 },
      rural: { Meat: 0.3, Vegetables: 0.25, Dairy: 0.2, Fruits: 0.15, Bakery: 0.1 }
    };

    const preferences = locationPreferences[userLocation] || locationPreferences.default;
    
    // Calculate trending score for each product
    const productsWithScore = productsData.map(product => {
      // Category preference weight (30%)
      const categoryWeight = (preferences[product.category] || 0.1) * 0.3;
      
      // Stock turnover simulation (25%) - lower stock = higher demand
      const maxStock = Math.max(...productsData.map(p => p.stock));
      const stockTurnover = (1 - (product.stock / maxStock)) * 0.25;
      
      // Price competitiveness (20%) - competitive pricing within category
      const categoryProducts = productsData.filter(p => p.category === product.category);
      const avgCategoryPrice = categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length;
      const priceCompetitiveness = product.price <= avgCategoryPrice ? 0.2 : 0.1;
      
      // Sale status bonus (15%)
      const saleBonus = product.isOnSale ? 0.15 : 0.05;
      
      // Random popularity factor (10%) - simulates real-time trends
      const popularityFactor = Math.random() * 0.1;
      
      const trendingScore = categoryWeight + stockTurnover + priceCompetitiveness + saleBonus + popularityFactor;
      
      return {
        ...product,
        trendingScore
      };
    });

    // Sort by trending score and return top 8
    return productsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 8)
      .map(({ trendingScore, ...product }) => ({ ...product }));
  }
};