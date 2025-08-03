import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { formatDistanceToNow } from "date-fns";

const DealCard = ({ deal }) => {
  const navigate = useNavigate();

  const timeRemaining = formatDistanceToNow(new Date(deal.expiresAt), { addSuffix: true });

  const handleViewDeal = () => {
    if (deal.products && deal.products.length > 0) {
      navigate(`/categories?deal=${deal.Id}`);
    }
  };

  const getDealIcon = () => {
    switch (deal.type) {
      case "flash-sale":
        return "Zap";
      case "bulk-discount":
        return "Package";
      case "weather-special":
        return deal.weatherTrigger === "rainy" ? "CloudRain" : "Sun";
      default:
        return "Tag";
    }
  };

  const getDealGradient = () => {
    switch (deal.type) {
      case "flash-sale":
        return "from-secondary-500 to-red-500";
      case "bulk-discount":
        return "from-primary-500 to-accent-500";
      case "weather-special":
        return "from-blue-500 to-primary-500";
      default:
        return "from-primary-500 to-secondary-500";
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getDealGradient()} rounded-xl p-6 text-white shadow-premium-lg hover:shadow-premium-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ApperIcon name={getDealIcon()} className="w-5 h-5" />
            <Badge variant="warning" size="sm">
              {deal.discount}% OFF
            </Badge>
          </div>
          
          <h3 className="font-display font-bold text-xl mb-2">
            {deal.title || `${deal.type.replace('-', ' ').toUpperCase()}`}
          </h3>
          
          <p className="text-white/90 mb-4">
            {deal.description || `Save ${deal.discount}% on selected items`}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ApperIcon name="Clock" className="w-4 h-4" />
              <span className="text-sm">Ends {timeRemaining}</span>
            </div>
            {deal.weatherTrigger && (
              <div className="flex items-center gap-1">
                <ApperIcon name="CloudRain" className="w-4 h-4" />
                <span className="text-sm capitalize">{deal.weatherTrigger} Special</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleViewDeal}
            variant="outline"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2" />
            Shop Now
          </Button>
        </div>

        <div className="text-right">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-2xl font-bold">
              {deal.discount}%
            </div>
            <div className="text-sm">OFF</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;