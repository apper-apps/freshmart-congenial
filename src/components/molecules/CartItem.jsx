import React from "react";
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
    <div className="flex items-center gap-4 p-4 bg-surface rounded-xl shadow-premium">
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <h3 className="font-display font-semibold text-gray-900">
          {item.product.name}
        </h3>
<p className="text-sm text-gray-600">
          Rs {item.product.price.toLocaleString('en-PK')}/{item.product.unit}
        </p>
        {item.selectedBulkOption && (
          <p className="text-xs text-accent-600 font-medium">
            Bulk: {item.selectedBulkOption}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <ApperIcon name="Minus" className="w-4 h-4" />
          </Button>
          
          <span className="w-8 text-center font-medium">
            {item.quantity}
          </span>
          
          <Button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-right">
<div className="font-bold text-primary-600">
            Rs {item.subtotal.toLocaleString('en-PK')}
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
    </div>
  );
};

export default CartItem;