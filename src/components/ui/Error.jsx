import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  type = "general",
  title
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case "orders":
        return {
          icon: "ShoppingBag",
          title: title || "Orders Loading Failed",
          defaultMessage: "Unable to load orders"
        };
      case "network":
        return {
          icon: "Wifi",
          title: title || "Network Error",
          defaultMessage: "Please check your internet connection"
        };
      case "permission":
        return {
          icon: "Lock",
          title: title || "Access Denied",
          defaultMessage: "You don't have permission to access this resource"
        };
      default:
        return {
          icon: "AlertTriangle",
          title: title || "Oops! Something went wrong",
          defaultMessage: "Something went wrong"
        };
    }
  };

  const config = getErrorConfig();

return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 md:p-6 touch-manipulation">
      <div className="w-20 h-20 md:w-16 md:h-16 bg-gradient-to-br from-error/10 to-error/20 rounded-full flex items-center justify-center mb-6 md:mb-4">
        <ApperIcon name={config.icon} className="w-10 h-10 md:w-8 md:h-8 text-error" />
      </div>
      <h3 className="text-2xl md:text-xl font-display font-semibold text-gray-900 mb-3 md:mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-8 md:mb-6 max-w-md text-base md:text-sm leading-relaxed">
        {message || config.defaultMessage}. Please try again or contact support if the problem persists.
      </p>
      {onRetry && (
        <Button 
          onClick={() => {
            // Haptic feedback for mobile
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
            onRetry();
          }} 
          variant="primary"
          size="lg"
          className="min-h-[44px] px-8 text-base md:text-sm md:px-4 md:py-2"
        >
          <ApperIcon name="RefreshCw" className="w-5 h-5 md:w-4 md:h-4 mr-2" />
          Try Again
        </Button>
      )}
      
      {/* Mobile-specific offline message */}
      {!navigator.onLine && (
        <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center gap-2 text-warning-700">
            <ApperIcon name="WifiOff" className="w-4 h-4" />
            <span className="text-sm">You're offline. Check your connection and try again.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Error;