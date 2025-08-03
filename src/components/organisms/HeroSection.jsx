import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="deal" size="lg" className="inline-flex items-center">
                <ApperIcon name="Leaf" className="w-4 h-4 mr-2" />
                Farm Fresh • Local • Organic
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
                Fresh Groceries
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  {" "}Delivered
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg">
                Get farm-fresh produce and essentials delivered to your door. 
                Support local farmers while enjoying the best quality groceries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/categories")}
                variant="primary"
                size="lg"
                className="inline-flex items-center"
              >
                <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
              
              <Button
                onClick={() => navigate("/categories?deals=true")}
                variant="outline"
                size="lg"
                className="inline-flex items-center"
              >
                <ApperIcon name="Tag" className="w-5 h-5 mr-2" />
                View Deals
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Fresh Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600">Local Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">24h</div>
                <div className="text-sm text-gray-600">Fresh Delivery</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop&crop=center"
                alt="Fresh groceries"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-premium-xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-premium-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Star" className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600">Customer Rating</p>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl p-4 shadow-premium-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Truck" className="w-5 h-5" />
                  <span className="font-semibold">Free Delivery</span>
                </div>
                <p className="text-sm opacity-90">Orders over ₹500</p>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary-200/50 to-accent-200/50 rounded-full filter blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;