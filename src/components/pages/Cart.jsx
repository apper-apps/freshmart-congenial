import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "@/components/molecules/CartItem";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { cartService } from "@/services/api/cartService";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    savings: 0,
    deliveryFee: 0,
    total: 0
  });

  const loadCart = () => {
    const items = cartService.getItems();
    setCartItems(items);
    
    const summary = cartService.getCartSummary();
    setCartSummary(summary);
  };

  useEffect(() => {
    loadCart();
    
    // Listen for cart updates from other components
    const handleCartUpdate = (event) => {
      loadCart();
      
      // Update badge with animation
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(badge => {
        badge.classList.remove('updated');
        void badge.offsetWidth;
        badge.classList.add('updated');
        setTimeout(() => badge.classList.remove('updated'), 300);
      });
    };

    window.addEventListener('cartUpdate', handleCartUpdate);
    
    // Also listen for storage changes (cross-tab sync)
    const handleStorageChange = (event) => {
      if (event.key === 'freshmart_cart') {
        cartService.reloadFromStorage();
        loadCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleClearCart = () => {
    cartService.clearCart();
    loadCart();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Empty
            title="Your cart is empty"
            description="Add some fresh groceries to get started with your order."
            actionLabel="Start Shopping"
            onAction={() => navigate("/categories")}
            icon="ShoppingCart"
          />
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-background">
      <div className="w-full max-w-none sm:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          
          <Button
            onClick={handleClearCart}
            variant="outline"
            className="text-error border-error hover:bg-error hover:text-white w-full sm:w-auto min-h-[48px]"
          >
            <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdate={loadCart}
              />
            ))}
          </div>

{/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-premium p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="font-display font-semibold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
<span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">RS {cartSummary.subtotal}</span>
                </div>

                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-accent-600">
<span>Bulk Savings</span>
                    <span className="font-medium">-RS {cartSummary.savings}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
<span className="font-medium">
                    {cartSummary.deliveryFee === 0 ? (
                      <Badge variant="success" size="sm">FREE</Badge>
                    ) : (
                      `RS ${cartSummary.deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
<span>Total</span>
                    <span className="text-primary-600">RS {cartSummary.total}</span>
                  </div>
                </div>

                {cartSummary.subtotal < 500 && (
                  <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-secondary-700">
                      <ApperIcon name="Truck" className="w-4 h-4" />
<span className="text-sm font-medium">
                        Add RS {500 - cartSummary.subtotal} more for FREE delivery!
                      </span>
                    </div>
                    <div className="mt-2 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((cartSummary.subtotal / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => navigate("/checkout")}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <ApperIcon name="CreditCard" className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>

                <Button
                  onClick={() => navigate("/categories")}
                  variant="outline"
                  className="w-full"
                >
                  <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>

              {/* Recommendations */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                  You might also like
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Organic Bananas", price: 45, image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=100&h=100&fit=crop" },
                    { name: "Fresh Spinach", price: 25, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&h=100&fit=crop" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
<p className="font-medium text-sm">{item.name}</p>
                        <p className="text-primary-600 font-semibold text-sm">RS {item.price}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <ApperIcon name="Plus" className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;