import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/organisms/HeroSection";
import DealsCarousel from "@/components/organisms/DealsCarousel";
import WeatherDealsCarousel from "@/components/organisms/WeatherDealsCarousel";
import ProductGrid from "@/components/organisms/ProductGrid";
import WeatherWidget from "@/components/molecules/WeatherWidget";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { productService } from "@/services/api/productService";

const Home = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadTrendingProducts = async () => {
    try {
      setLoading(true);
      setError("");
      // Use location-based trending algorithm
      const data = await productService.getTrendingByLocation("default");
      setTrendingProducts(data);
    } catch (err) {
      setError("Failed to load trending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingProducts();
  }, []);

  const categories = [
    { name: "Fresh Fruits", icon: "Apple", color: "from-red-500 to-pink-500", path: "/categories/Fruits" },
    { name: "Vegetables", icon: "Carrot", color: "from-green-500 to-emerald-500", path: "/categories/Vegetables" },
    { name: "Dairy Products", icon: "Milk", color: "from-blue-500 to-cyan-500", path: "/categories/Dairy" },
    { name: "Bakery", icon: "Croissant", color: "from-yellow-500 to-orange-500", path: "/categories/Bakery" },
    { name: "Meat & Fish", icon: "Fish", color: "from-purple-500 to-indigo-500", path: "/categories/Meat" },
    { name: "Organic", icon: "Leaf", color: "from-primary-500 to-accent-500", path: "/categories?tags=Organic" }
  ];

  return (
<div>
      {/* Weather Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WeatherWidget />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover fresh produce and essentials across our carefully curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(category.path)}
                className="group p-6 bg-white rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-105 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <ApperIcon name={category.icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 text-center">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
<WeatherDealsCarousel />
      
      <DealsCarousel />

{/* Trending Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-display font-bold text-gray-900">
                  🔥 Trending in Your Area
                </h2>
                <Badge variant="secondary" className="text-xs font-medium">
                  <ApperIcon name="MapPin" className="w-3 h-3 mr-1" />
                  Local Favorites
                </Badge>
              </div>
              <p className="text-gray-600">Popular products based on your location's preferences</p>
            </div>
            <Button
              onClick={() => navigate("/categories")}
              variant="outline"
            >
              View All
              <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <ProductGrid 
            products={trendingProducts}
            loading={loading}
            error={error}
            onRetry={loadTrendingProducts}
          />
        </div>
      </section>

      {/* Farmer Spotlight */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Meet Your Local Farmers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Supporting local agriculture and bringing you the freshest produce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Green Valley Farm",
                owner: "Sarah Johnson",
                specialty: "Organic Vegetables",
                image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Sunny Orchards",
                owner: "Mike Chen",
                specialty: "Fresh Fruits",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
              },
              {
                name: "Heritage Dairy",
                owner: "Emma Rodriguez",
                specialty: "Organic Dairy",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b93c?w=300&h=300&fit=crop&crop=face"
              }
            ].map((farmer, index) => (
              <div key={index} className="bg-white rounded-xl shadow-premium p-6 text-center">
                <img
                  src={farmer.image}
                  alt={farmer.owner}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-1">
                  {farmer.name}
                </h3>
                <p className="text-gray-600 mb-2">{farmer.owner}</p>
                <Badge variant="primary" size="sm">
                  {farmer.specialty}
                </Badge>
                <p className="text-sm text-gray-500 mt-3">
                  "Committed to providing the freshest, highest quality produce to our community."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <ApperIcon name="Mail" className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-3xl font-display font-bold mb-4">
              Stay Fresh with Updates
            </h2>
            <p className="text-gray-300 text-lg">
              Get weekly deals, seasonal produce updates, and farmer spotlights delivered to your inbox
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button variant="primary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;