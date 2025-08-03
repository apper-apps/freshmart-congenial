import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ProductCard from "@/components/molecules/ProductCard";
import { orderService } from "@/services/api/orderService";
import { cartService } from "@/services/api/cartService";
import { formatDistance } from "date-fns";

const Account = () => {
const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [recentlyPurchased, setRecentlyPurchased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyPurchasedLoading, setRecentlyPurchasedLoading] = useState(true);
  const [error, setError] = useState("");
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

const loadRecentlyPurchased = async () => {
    try {
      setRecentlyPurchasedLoading(true);
      const data = await orderService.getRecentlyPurchased();
      setRecentlyPurchased(data);
    } catch (err) {
      console.error("Failed to load recently purchased products:", err);
    } finally {
      setRecentlyPurchasedLoading(false);
    }
  };

  const handleReorder = async (product) => {
    try {
      await cartService.addItem(product.Id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add item to cart");
      console.error("Failed to reorder:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadRecentlyPurchased();
  }, []);

  const tabs = [
    { id: "orders", name: "Orders", icon: "ShoppingBag" },
    { id: "recently-purchased", name: "Recently Purchased", icon: "RotateCcw" },
    { id: "profile", name: "Profile", icon: "User" },
    { id: "addresses", name: "Addresses", icon: "MapPin" },
    { id: "preferences", name: "Preferences", icon: "Settings" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "processing":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "primary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "CheckCircle";
      case "processing":
        return "Clock";
      case "cancelled":
        return "XCircle";
      default:
        return "Package";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600">Manage your orders, profile, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-premium p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ApperIcon name={tab.icon} className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
{activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-premium p-6">
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                    Order History
                  </h2>

                  {loading ? (
                    <Loading />
                  ) : error ? (
                    <Error message={error} onRetry={loadOrders} />
                  ) : orders.length === 0 ? (
                    <Empty
                      title="No orders yet"
                      description="Start shopping to see your orders here."
                      actionLabel="Start Shopping"
                      onAction={() => window.location.href = "/categories"}
                      icon="ShoppingBag"
                    />
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.Id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-display font-semibold text-lg text-gray-900">
                                Order #{order.Id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Placed {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(order.status)}>
                              <ApperIcon name={getStatusIcon(order.status)} className="w-3 h-3 mr-1" />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items && order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <img
                                  src={item.product?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop"}
                                  alt={item.product?.name || "Product"}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product?.name || "Product"}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-primary-600">₹{item.subtotal}</p>
                              </div>
                            ))}
                            {order.items && order.items.length > 3 && (
                              <p className="text-sm text-gray-600 pl-13">
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-lg font-bold text-primary-600">Total: ₹{order.total}</p>
                              {order.deliveryInfo?.deliverySlot && (
                                <p className="text-sm text-gray-600">
                                  Delivery: {order.deliveryInfo.deliverySlot}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {order.status === "delivered" && (
                                <Button variant="primary" size="sm">
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "recently-purchased" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-premium p-6">
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                    Recently Purchased Items
                  </h2>

                  {recentlyPurchasedLoading ? (
                    <Loading />
                  ) : recentlyPurchased.length === 0 ? (
                    <Empty
                      title="No purchase history"
                      description="Start shopping to see your frequently purchased items here."
                      actionLabel="Start Shopping"
                      onAction={() => window.location.href = "/categories"}
                      icon="RotateCcw"
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recentlyPurchased.map((product) => (
                          <div key={product.Id} className="relative">
                            <ProductCard product={product} />
                            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(product)}
                                className="p-2 hover:bg-primary-50"
                              >
                                <ApperIcon name="RotateCcw" size={16} className="text-primary-600" />
                              </Button>
                            </div>
                            {product.purchaseCount > 1 && (
                              <div className="absolute top-2 left-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
                                Bought {product.purchaseCount} times
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Profile Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl text-gray-900">Guest User</h3>
                      <p className="text-gray-600">Fresh grocery shopper</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Guest User"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="guest@freshmart.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Delivery Addresses
                </h2>
                <Empty
                  title="No saved addresses"
                  description="Add delivery addresses to make checkout faster."
                  actionLabel="Add Address"
                  icon="MapPin"
                />
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="bg-white rounded-xl shadow-premium p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Shopping Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Dietary Preferences</h3>
                    <div className="space-y-2">
                      {["Organic", "Vegan", "Gluten-Free", "Non-GMO", "Local"].map((pref) => (
                        <label key={pref} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-2">
                      {["Email notifications", "SMS updates", "Deal alerts", "New product alerts"].map((notif) => (
                        <label key={notif} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700">{notif}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button variant="primary">
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;