import React, { useState } from "react";
import { formatPrice } from '@/services/currency.formatter';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import QuickViewModal from "@/components/molecules/QuickViewModal";
import { cartService } from "@/services/api/cartService";
import ApperIcon from "@/components/ApperIcon";
import Cart from "@/components/pages/Cart";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addItem(product.Id, 1);
      toast.success(`${product.name} added to cart!`);
      
      // Trigger cart shake animation
      const cartIcons = document.querySelectorAll('.cart-icon-container');
      cartIcons.forEach(icon => {
        icon.classList.remove('shaking');
        // Force reflow
        void icon.offsetWidth;
        icon.classList.add('shaking');
        
        // Remove animation class after animation completes
        setTimeout(() => {
          icon.classList.remove('shaking');
        }, 800);
      });
      
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error('Add to cart error:', error);
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
<div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onMouseEnter={() => {
          const timeout = setTimeout(() => {
            setIsQuickViewOpen(true);
          }, 800);
          setHoverTimeout(timeout);
        }}
        onMouseLeave={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsQuickViewOpen(true);
        }}
      >
{imageLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageError ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMjAwTDIwMCAxNzVMMjI1IDIwMEwyMDAgMjI1TDE3NSAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNTAgMjI1TDE3NSAyMDBMMjAwIDIyNUwxNzUgMjUwTDE1MCAyMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMDAgMjI1TDIyNSAyMDBMMjUwIDIyNUwyMjUgMjUwTDIwMCAyMjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=' : product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => {
            setImageLoading(false);
          }}
          onError={(e) => {
            setImageError(true);
            setImageLoading(false);
            console.warn(`Failed to load image for product: ${product.name}`, product.imageUrl);
          }}
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg">
            <ApperIcon name="Eye" className="w-6 h-6 text-gray-700" />
          </div>
        </div>
        
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
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-xl sm:text-2xl font-bold text-primary-600 leading-tight">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">/{product.unit}</span>
            </div>
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <p className="text-xs text-accent-600 font-medium leading-tight">
                Bulk: {formatPrice(product.bulkPricing[0].price)}/{product.bulkPricing[0].quantity}
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
          className="w-full min-h-[44px] touch:min-h-[48px] text-sm sm:text-base transition-all duration-150 
                     active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none'
          }}
        >
          <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Add to Cart</span>
        </Button>
      </div>
      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};

export default ProductCard;