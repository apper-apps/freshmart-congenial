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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          
          <Button
            onClick={handleClearCart}
            variant="outline"
            className="text-error border-error hover:bg-error hover:text-white"
          >
            <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
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
            <div className="bg-white rounded-xl shadow-premium p-6 sticky top-8">
              <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cartSummary.subtotal}</span>
                </div>

                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-accent-600">
                    <span>Bulk Savings</span>
                    <span className="font-medium">-₹{cartSummary.savings}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {cartSummary.deliveryFee === 0 ? (
                      <Badge variant="success" size="sm">FREE</Badge>
                    ) : (
                      `₹${cartSummary.deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{cartSummary.total}</span>
                  </div>
                </div>

                {cartSummary.subtotal < 500 && (
                  <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-secondary-700">
                      <ApperIcon name="Truck" className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Add ₹{500 - cartSummary.subtotal} more for FREE delivery!
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
                        <p className="text-primary-600 font-semibold text-sm">₹{item.price}</p>
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