import React from "react";
import { formatPrice } from '@/services/currency.formatter';
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cartService } from "@/services/api/cartService";
import { toast } from "react-toastify";

const CartItem = ({ item, onUpdate }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      cartService.updateQuantity(item.productId, newQuantity);
      onUpdate();
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const handleRemove = () => {
    try {
      cartService.removeItem(item.productId);
      onUpdate();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-surface rounded-xl shadow-premium">
      {/* Mobile: Image and content stacked */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-gray-900 text-sm sm:text-base truncate">
            {item.product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {formatPrice(item.product.price)}/{item.product.unit}
          </p>
          {item.selectedBulkOption && (
            <p className="text-xs text-accent-600 font-medium">
              Bulk: {item.selectedBulkOption}
            </p>
          )}
        </div>
      </div>
{/* Mobile: Controls stacked, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
        {/* Quantity and Price Row on Mobile */}
        <div className="flex items-center justify-between sm:justify-start sm:gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              variant="ghost"
              size="sm"
              className="w-10 h-10 sm:w-8 sm:h-8 p-0 min-h-[48px] sm:min-h-[32px]"
            >
              <ApperIcon name="Minus" className="w-4 h-4" />
            </Button>
            
            <span className="w-8 text-center font-medium text-sm sm:text-base">
              {item.quantity}
            </span>
            
            <Button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              variant="ghost"
              size="sm"
              className="w-10 h-10 sm:w-8 sm:h-8 p-0 min-h-[48px] sm:min-h-[32px]"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-right sm:hidden">
            <div className="font-bold text-primary-600 text-sm">
              {formatPrice(item.subtotal)}
            </div>
          </div>
        </div>

        {/* Desktop: Price and Delete */}
        <div className="hidden sm:flex sm:items-center sm:gap-3">
          <div className="text-right">
            <div className="font-bold text-primary-600">
              {formatPrice(item.subtotal)}
            </div>
          </div>

          <Button
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            className="text-error hover:text-error w-8 h-8 p-0"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile: Delete Button */}
        <div className="sm:hidden">
          <Button
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            className="text-error hover:text-error w-full min-h-[48px] justify-center"
          >
            <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
            Remove Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;