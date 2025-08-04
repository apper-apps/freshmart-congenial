import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import { cartService } from "@/services/api/cartService";
import { orderService } from "@/services/api/orderService";
import { paymentGatewayService } from "@/services/api/paymentGatewayService";
import { toast } from "react-toastify";
const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({});
  const [loading, setLoading] = useState(false);
const [availableGateways, setAvailableGateways] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    deliverySlot: "",
    instructions: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const deliverySlots = [
    { value: "morning", label: "Morning (8:00 AM - 12:00 PM)", fee: 0 },
    { value: "afternoon", label: "Afternoon (12:00 PM - 6:00 PM)", fee: 0 },
    { value: "evening", label: "Evening (6:00 PM - 10:00 PM)", fee: 25 },
    { value: "express", label: "Express (Within 2 hours)", fee: 50 }
  ];

useEffect(() => {
    const loadInitialData = async () => {
      const items = cartService.getItems();
      if (items.length === 0) {
        navigate("/cart");
        return;
      }
      
      setCartItems(items);
      setCartSummary(cartService.getCartSummary());

      // Load available payment gateways
      try {
        const gateways = await paymentGatewayService.getAllActive();
        setAvailableGateways(gateways);
        if (gateways.length > 0 && !paymentMethod) {
          setPaymentMethod(gateways[0].Id.toString());
        }
      } catch (error) {
        console.error("Failed to load payment gateways:", error);
        toast.error("Failed to load payment methods");
      } finally {
        setGatewaysLoading(false);
      }
    };

    loadInitialData();
  }, [navigate, paymentMethod]);

  const handleInputChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.deliverySlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: cartItems,
        deliveryInfo,
        paymentMethod,
        summary: cartSummary,
        total: cartSummary.total
      };

      const order = await orderService.create(orderData);
      
      // Clear cart after successful order
      cartService.clearCart();
      
      toast.success("Order placed successfully!");
      navigate("/account");
      
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const selectedSlot = deliverySlots.find(slot => slot.value === deliveryInfo.deliverySlot);
  const selectedGateway = availableGateways.find(gateway => gateway.Id.toString() === paymentMethod);
  const deliveryFee = selectedSlot?.fee || 0;
  const gatewayFee = selectedGateway?.transactionFee || 0;
  const finalTotal = cartSummary.total + deliveryFee + gatewayFee;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order details below</p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  <ApperIcon name="MapPin" className="w-5 h-5 inline mr-2" />
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    value={deliveryInfo.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                  
                  <Input
                    label="Phone Number"
                    required
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Email Address"
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Street Address"
                      required
                      value={deliveryInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your street address"
                    />
                  </div>
                  
                  <Input
                    label="Apartment/Unit"
                    value={deliveryInfo.apartment}
                    onChange={(e) => handleInputChange("apartment", e.target.value)}
                    placeholder="Apt, suite, floor (optional)"
                  />
                  
                  <Input
                    label="City"
                    required
                    value={deliveryInfo.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Delivery Instructions"
                      value={deliveryInfo.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
                      placeholder="Any special delivery instructions (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  <ApperIcon name="Clock" className="w-5 h-5 inline mr-2" />
                  Delivery Time
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliverySlots.map((slot) => (
                    <label
                      key={slot.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        deliveryInfo.deliverySlot === slot.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliverySlot"
                        value={slot.value}
                        checked={deliveryInfo.deliverySlot === slot.value}
                        onChange={(e) => handleInputChange("deliverySlot", e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{slot.label}</p>
                          {slot.fee > 0 && (
                            <Badge variant="secondary" size="sm" className="mt-1">
                              +₹{slot.fee}
                            </Badge>
                          )}
                        </div>
                        {deliveryInfo.deliverySlot === slot.value && (
                          <ApperIcon name="CheckCircle" className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

{/* Payment Method */}
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  <ApperIcon name="CreditCard" className="w-5 h-5 inline mr-2" />
                  Payment Method
                </h2>

                {gatewaysLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600">Loading payment methods...</span>
                  </div>
                ) : availableGateways.length === 0 ? (
                  <div className="text-center py-8">
                    <ApperIcon name="AlertCircle" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No payment methods available</p>
                    <p className="text-sm text-gray-500 mt-1">Please contact support</p>
                  </div>
                ) : (
                  <div className="space-y-3">
{availableGateways.map((gateway) => (
                      <label
                        key={gateway.Id}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          paymentMethod === gateway.Id.toString()
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={gateway.Id.toString()}
                          checked={paymentMethod === gateway.Id.toString()}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <img
                          src={gateway.logoUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=50&h=50&fit=crop"}
                          alt={gateway.name}
                          className="w-8 h-8 rounded object-cover mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{gateway.name}</span>
                            <Badge variant="secondary" size="sm">
                              {gateway.gatewayType}
                            </Badge>
                            {gateway.transactionFee > 0 && (
                              <Badge variant="warning" size="sm">
                                +RS {gateway.transactionFee} fee
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{gateway.accountHolderName}</p>
                        </div>
                        {paymentMethod === gateway.Id.toString() && (
                          <ApperIcon name="CheckCircle" className="w-5 h-5 text-primary-500" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-premium p-6 sticky top-8">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
</div>
                      <p className="font-semibold text-primary-600">RS {item.subtotal}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
<span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">RS {cartSummary.subtotal}</span>
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
                        `RS ${cartSummary.deliveryFee}`
                      )}
                    </span>
                  </div>

                  {selectedSlot && selectedSlot.fee > 0 && (
                    <div className="flex justify-between">
<span className="text-gray-600">Time Slot Fee</span>
                      <span className="font-medium">RS {selectedSlot.fee}</span>
                    </div>
                  )}
{gatewayFee > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-600">Payment Gateway Fee</span>
                      <span className="text-sm">RS {gatewayFee}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">RS {finalTotal}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  loading={loading}
                  disabled={!deliveryInfo.deliverySlot}
                >
                  <ApperIcon name="ShoppingBag" className="w-5 h-5 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;