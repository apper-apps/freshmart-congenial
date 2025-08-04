import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { subscriptionService } from "@/services/api/subscriptionService";
import { addDays, eachDayOfInterval, endOfWeek, format, formatDistance, startOfWeek } from "date-fns";
import { orderService } from "@/services/api/orderService";
import { cartService } from "@/services/api/cartService";
import ApperIcon from "@/components/ApperIcon";
import ProductCard from "@/components/molecules/ProductCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const Account = () => {
const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [recentlyPurchased, setRecentlyPurchased] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyPurchasedLoading, setRecentlyPurchasedLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
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

  const loadSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const data = await subscriptionService.getAll();
      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setSubscriptionsLoading(false);
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

  const handleUpdateFrequency = async (subscriptionId, frequency) => {
    try {
      await subscriptionService.updateFrequency(subscriptionId, frequency);
      toast.success("Subscription frequency updated!");
      loadSubscriptions();
    } catch (err) {
      toast.error("Failed to update frequency");
      console.error("Failed to update frequency:", err);
    }
  };

  const handleSkipDelivery = async (subscriptionId, date) => {
    try {
      await subscriptionService.skipDelivery(subscriptionId, date);
      toast.success("Delivery skipped successfully!");
      loadSubscriptions();
    } catch (err) {
      toast.error("Failed to skip delivery");
      console.error("Failed to skip delivery:", err);
    }
  };

  const handlePauseSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.pauseSubscription(subscriptionId);
      toast.success("Subscription paused!");
      loadSubscriptions();
    } catch (err) {
      toast.error("Failed to pause subscription");
      console.error("Failed to pause subscription:", err);
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.resumeSubscription(subscriptionId);
      toast.success("Subscription resumed!");
      loadSubscriptions();
    } catch (err) {
      toast.error("Failed to resume subscription");
      console.error("Failed to resume subscription:", err);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm("Are you sure you want to cancel this subscription? This action cannot be undone.")) {
      try {
        await subscriptionService.cancelSubscription(subscriptionId);
        toast.success("Subscription cancelled successfully!");
        loadSubscriptions();
      } catch (err) {
        toast.error("Failed to cancel subscription");
        console.error("Failed to cancel subscription:", err);
      }
    }
  };

useEffect(() => {
    loadOrders();
    loadRecentlyPurchased();
    loadSubscriptions();
  }, []);

const tabs = [
    { id: "orders", name: "Orders", icon: "ShoppingBag" },
    { id: "recently-purchased", name: "Recently Purchased", icon: "RotateCcw" },
    { id: "subscriptions", name: "Subscriptions", icon: "RefreshCw" },
    { id: "profile", name: "Profile", icon: "User" },
    { id: "addresses", name: "Addresses", icon: "MapPin" },
    { id: "preferences", name: "Preferences", icon: "Settings" }
  ];

  const SubscriptionCalendar = ({ subscription }) => {
    const [deliveries, setDeliveries] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    useEffect(() => {
      const loadDeliveries = async () => {
        try {
          const data = await subscriptionService.getUpcomingDeliveries(subscription.Id);
          setDeliveries(data);
        } catch (err) {
          console.error("Failed to load deliveries:", err);
        }
      };
      loadDeliveries();
    }, [subscription.Id]);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const navigateWeek = (direction) => {
      setCurrentWeek(prev => addDays(prev, direction * 7));
    };

    const getDeliveryForDate = (date) => {
      return deliveries.find(delivery => 
        new Date(delivery.date).toDateString() === date.toDateString()
      );
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Delivery Calendar</h4>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateWeek(-1)}
              className="p-1"
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateWeek(1)}
              className="p-1"
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          ))}
          
          {weekDays.map(day => {
            const delivery = getDeliveryForDate(day);
            const isToday = new Date().toDateString() === day.toDateString();
            const isPast = day < new Date();
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  relative h-10 rounded-md flex items-center justify-center text-sm
                  ${isToday ? 'bg-primary-100 text-primary-900 font-semibold' : 'text-gray-700'}
                  ${isPast ? 'text-gray-400' : ''}
                  ${delivery ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
                {delivery && (
                  <div className="absolute -top-1 -right-1">
                    {delivery.isSkipped ? (
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <ApperIcon name="X" size={10} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <ApperIcon name="Package" size={10} className="text-white" />
                      </div>
                    )}
                    {delivery.canSkip && !delivery.isSkipped && (
                      <button
                        onClick={() => handleSkipDelivery(subscription.Id, delivery.date)}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-yellow-600 hover:text-yellow-800"
                        title="Skip this delivery"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Skipped</span>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

const getOrderStatusColor = (status) => {
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
<Badge variant={getOrderStatusColor(order.status)}>
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
{activeTab === "subscriptions" && (
              <div className="space-y-6">
                {subscriptionsLoading ? (
                  <Loading />
                ) : subscriptions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-premium p-6">
                    <Empty
                      title="No active subscriptions"
                      description="Set up recurring deliveries for your favorite products to save time and never run out."
                      actionLabel="Browse Products"
                      icon="RefreshCw"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-premium p-6">
                      <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                        My Subscriptions
                      </h2>
                      
                      <div className="grid gap-6">
                        {subscriptions.map((subscription) => (
                          <div
                            key={subscription.Id}
                            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={subscription.productImage}
                                  alt={subscription.productName}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg">
                                    {subscription.productName}
                                  </h3>
                                  <p className="text-gray-600">
                                    ${subscription.price} × {subscription.quantity}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant={getStatusColor(subscription.status)}>
                                      {subscription.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Every {subscription.frequency.replace('-', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Next delivery</p>
                                <p className="font-semibold text-gray-900">
                                  {format(new Date(subscription.nextDelivery), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <div className="flex items-center space-x-2">
                                <label htmlFor={`frequency-${subscription.Id}`} className="text-sm font-medium text-gray-700">
                                  Frequency:
                                </label>
                                <select
                                  id={`frequency-${subscription.Id}`}
                                  value={subscription.frequency}
                                  onChange={(e) => handleUpdateFrequency(subscription.Id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                  <option value="weekly">Weekly</option>
                                  <option value="bi-weekly">Bi-weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>

                              <div className="flex items-center space-x-2">
                                {subscription.status === 'active' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePauseSubscription(subscription.Id)}
                                    className="flex items-center space-x-1"
                                  >
                                    <ApperIcon name="Pause" size={14} />
                                    <span>Pause</span>
                                  </Button>
                                ) : subscription.status === 'paused' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResumeSubscription(subscription.Id)}
                                    className="flex items-center space-x-1"
                                  >
                                    <ApperIcon name="Play" size={14} />
                                    <span>Resume</span>
                                  </Button>
                                ) : null}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelSubscription(subscription.Id)}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <ApperIcon name="X" size={14} />
                                  <span>Cancel</span>
                                </Button>
                              </div>
                            </div>

                            <SubscriptionCalendar subscription={subscription} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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