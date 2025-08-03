import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { productService } from "@/services/api/productService";
import { cartService } from "@/services/api/cartService";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedBulkOption, setSelectedBulkOption] = useState(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getById(parseInt(id));
      setProduct(data);
    } catch (err) {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      cartService.addItem(product.Id, selectedQuantity, selectedBulkOption);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const getStockStatus = () => {
    if (!product) return { text: "", color: "", icon: "" };
    
    if (product.stock === 0) {
      return { text: "Out of Stock", color: "error", icon: "XCircle" };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, color: "warning", icon: "AlertCircle" };
    } else {
      return { text: `${product.stock} in stock`, color: "success", icon: "CheckCircle" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Error message={error} onRetry={loadProduct} />
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const currentPrice = selectedBulkOption ? selectedBulkOption.price : product.price;
  const totalPrice = currentPrice * selectedQuantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={() => navigate("/")} className="hover:text-primary-600">
              Home
            </button>
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
            <button onClick={() => navigate("/categories")} className="hover:text-primary-600">
              Categories
            </button>
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
            <button onClick={() => navigate(`/categories/${product.category}`)} className="hover:text-primary-600">
              {product.category}
            </button>
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-premium">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{product.category}</Badge>
                {product.tags && product.tags.map((tag, index) => (
                  <Badge key={index} variant="accent" size="sm">{tag}</Badge>
                ))}
              </div>
              
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary-600">
                  ₹{currentPrice}
                </span>
                <span className="text-lg text-gray-500">/{product.unit}</span>
              </div>
              {selectedQuantity > 1 && (
                <div className="text-lg font-semibold text-gray-900">
                  Total: ₹{totalPrice}
                </div>
              )}
            </div>

            {/* Bulk Pricing */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg text-gray-900">
                  Bulk Pricing Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedBulkOption(null)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      !selectedBulkOption 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">Regular Price</div>
                      <div className="text-primary-600">₹{product.price}/{product.unit}</div>
                    </div>
                  </button>
                  
                  {product.bulkPricing.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedBulkOption(option)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedBulkOption === option 
                          ? "border-primary-500 bg-primary-50" 
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{option.quantity}</div>
                        <div className="text-primary-600">₹{option.price}/{product.unit}</div>
                        <Badge variant="deal" size="sm" className="mt-1">
                          Save {Math.round(((product.price - option.price) / product.price) * 100)}%
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-lg text-gray-900">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                >
                  <ApperIcon name="Minus" className="w-4 h-4" />
                </Button>
                
                <span className="w-16 text-center text-lg font-semibold">
                  {selectedQuantity}
                </span>
                
                <Button
                  onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  disabled={selectedQuantity >= product.stock}
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2" />
                Add to Cart - ₹{totalPrice}
              </Button>
              
              <Button
                onClick={() => navigate("/cart")}
                variant="outline"
                size="lg"
              >
                <ApperIcon name="Eye" className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-3">
                Product Details
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>Fresh, high-quality {product.name.toLowerCase()} sourced directly from local farms.</p>
                <p>Category: {product.category}</p>
                <p>Unit: {product.unit}</p>
                {product.tags && (
                  <p>Features: {product.tags.join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;