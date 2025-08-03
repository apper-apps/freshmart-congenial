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
  }
};