import { productService } from "./productService.js";

// In-memory cart storage (would typically use localStorage or Redux)
let cartItems = [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cartService = {
  async addItem(productId, quantity = 1, bulkOption = null) {
    await delay(100);
    
    const product = await productService.getById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existingItemIndex = cartItems.findIndex(
      item => item.productId === productId && 
               JSON.stringify(item.selectedBulkOption) === JSON.stringify(bulkOption)
    );

    const price = bulkOption ? bulkOption.price : product.price;
    const subtotal = price * quantity;

    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += quantity;
      cartItems[existingItemIndex].subtotal = cartItems[existingItemIndex].quantity * price;
    } else {
      cartItems.push({
        productId,
        quantity,
        selectedBulkOption: bulkOption,
        subtotal,
        product: { ...product }
      });
    }

    return this.getItems();
  },

  getItems() {
    return [...cartItems];
  },

  async updateQuantity(productId, newQuantity) {
    await delay(100);
    
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    if (newQuantity <= 0) {
      return this.removeItem(productId);
    }

    const item = cartItems[itemIndex];
    const price = item.selectedBulkOption ? item.selectedBulkOption.price : item.product.price;
    
    cartItems[itemIndex].quantity = newQuantity;
    cartItems[itemIndex].subtotal = price * newQuantity;

    return this.getItems();
  },

  async removeItem(productId) {
    await delay(100);
    
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    cartItems.splice(itemIndex, 1);
    return this.getItems();
  },

  clearCart() {
    cartItems = [];
    return [];
  },

  getCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate bulk savings
    let savings = 0;
    cartItems.forEach(item => {
      if (item.selectedBulkOption) {
        const regularPrice = item.product.price * item.quantity;
        const bulkPrice = item.selectedBulkOption.price * item.quantity;
        savings += regularPrice - bulkPrice;
      }
    });

    // Free delivery over ₹500
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    return {
      subtotal: Math.round(subtotal),
      savings: Math.round(savings),
      deliveryFee,
      total: Math.round(total)
    };
  },

  getItemCount() {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};