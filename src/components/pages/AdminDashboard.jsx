import React from "react";
import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const AdminDashboard = () => {
  const adminModules = [
    {
      id: "payment-gateways",
      name: "Payment Gateways",
      description: "Manage payment methods and gateway configurations",
      icon: "CreditCard",
      path: "/admin/payment-gateways",
      color: "primary"
    },
    {
      id: "orders",
      name: "Order Management",
      description: "View and manage customer orders",
      icon: "ShoppingBag",
      path: "/admin/orders",
      color: "secondary",
      comingSoon: true
    },
    {
      id: "products",
      name: "Product Management",
      description: "Add, edit, and manage product catalog",
      icon: "Package",
      path: "/admin/products",
      color: "accent",
      comingSoon: true
    },
    {
      id: "users",
      name: "User Management",
      description: "Manage customer accounts and permissions",
      icon: "Users",
      path: "/admin/users",
      color: "warning",
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your FreshMart store operations</p>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-premium p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <ApperIcon name="ShoppingBag" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. 45,678</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">567</p>
              </div>
              <div className="p-3 bg-accent-100 rounded-lg">
                <ApperIcon name="Package" className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-premium p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">890</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <ApperIcon name="Users" className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="bg-white rounded-xl shadow-premium p-6">
          <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
            Admin Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => (
              <div
                key={module.id}
                className="relative border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {module.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" size="sm">Coming Soon</Badge>
                  </div>
                )}
                <div className={`inline-flex p-3 rounded-lg mb-4 bg-${module.color}-100`}>
                  <ApperIcon name={module.icon} className={`w-6 h-6 text-${module.color}-600`} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {module.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {module.description}
                </p>
                {module.comingSoon ? (
                  <Button variant="outline" disabled className="w-full">
                    Coming Soon
                  </Button>
                ) : (
                  <Link to={module.path} className="block">
                    <Button variant="primary" className="w-full">
                      Manage
                      <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;