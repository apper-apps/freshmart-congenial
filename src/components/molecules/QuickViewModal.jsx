import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cartService } from "@/services/api/cartService";
import { toast } from "react-toastify";

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock multiple images for gallery (using same image for demo)
  const productImages = product ? [
    product.imageUrl,
    product.imageUrl + "?variant=1",
    product.imageUrl + "?variant=2"
  ] : [];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    try {
      cartService.addItem(product.Id, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const getStockStatus = () => {
    if (!product) return { text: "", color: "success", icon: "CheckCircle" };
    
    if (product.stock === 0) {
      return { text: "Out of Stock", color: "error", icon: "XCircle" };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, color: "warning", icon: "AlertCircle" };
    } else {
      return { text: `${product.stock} available`, color: "success", icon: "CheckCircle" };
    }
  };

  if (!isOpen || !product) return null;

  const stockStatus = getStockStatus();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-premium-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-display font-bold text-gray-900">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ApperIcon name="X" className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ApperIcon name="ChevronLeft" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ApperIcon name="ChevronRight" className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              )}

              {/* Product Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.tags && product.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {tag}
                  </Badge>
                ))}
                {product.isOnSale && (
                  <Badge variant="deal">
                    <ApperIcon name="Zap" className="w-3 h-3 mr-1" />
                    Deal
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600">{product.category}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <ApperIcon 
                name={stockStatus.icon} 
                className={`w-5 h-5 text-${stockStatus.color === 'success' ? 'green' : stockStatus.color === 'warning' ? 'yellow' : 'red'}-500`} 
              />
              <span className={`font-medium text-${stockStatus.color === 'success' ? 'green' : stockStatus.color === 'warning' ? 'yellow' : 'red'}-600`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary-600">
                  ₹{product.price}
                </span>
                <span className="text-xl text-gray-500">/{product.unit}</span>
              </div>
              
              {product.bulkPricing && product.bulkPricing.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Bulk Pricing:</p>
                  {product.bulkPricing.map((bulk, index) => (
                    <div key={index} className="text-sm text-accent-600">
                      {bulk.quantity}: ₹{bulk.price}/{product.unit}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <ApperIcon name="Minus" className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              variant="primary"
              className="w-full py-3 text-lg"
            >
              <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2" />
              Add {quantity} to Cart
            </Button>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;