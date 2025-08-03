import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cartService } from "@/services/api/cartService";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    try {
      cartService.addItem(product.Id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.Id}`);
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: "Out of Stock", color: "error", icon: "XCircle" };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, color: "warning", icon: "AlertCircle" };
    } else {
      return { text: `${product.stock} available`, color: "success", icon: "CheckCircle" };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className="bg-surface rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group"
      onClick={handleViewProduct}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.tags && product.tags.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="primary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {product.isOnSale && (
          <Badge variant="deal" className="absolute top-2 left-2">
            <ApperIcon name="Zap" className="w-3 h-3 mr-1" />
            Deal
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-lg text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">{product.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-500">/{product.unit}</span>
            </div>
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <p className="text-xs text-accent-600 font-medium">
                Bulk: ₹{product.bulkPricing[0].price}/{product.bulkPricing[0].quantity}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ApperIcon 
            name={stockStatus.icon} 
            className={`w-4 h-4 text-${stockStatus.color === 'success' ? 'green' : stockStatus.color === 'warning' ? 'yellow' : 'red'}-500`} 
          />
          <span className={`text-sm font-medium text-${stockStatus.color === 'success' ? 'green' : stockStatus.color === 'warning' ? 'yellow' : 'red'}-600`}>
            {stockStatus.text}
          </span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          variant="primary"
          className="w-full"
        >
          <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;