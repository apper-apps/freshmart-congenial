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

// Browser-specific error handling
  const getBrowserSpecificMessage = () => {
    const userAgent = navigator.userAgent;
    let browserMessage = "";
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserMessage = " If you're using Safari, try refreshing the page or checking your privacy settings.";
    } else if (userAgent.includes('Firefox')) {
      browserMessage = " If you're using Firefox, ensure cookies and JavaScript are enabled.";
    } else if (userAgent.includes('Edg')) {
      browserMessage = " If you're using Edge, try clearing your browser cache.";
    }
    
    return browserMessage;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 md:p-6 
                    touch-manipulation cross-browser-error" role="alert" aria-live="polite">
      <div className="w-20 h-20 md:w-16 md:h-16 bg-gradient-to-br from-error/10 to-error/20 
                      rounded-full flex items-center justify-center mb-6 md:mb-4
                      transform-gpu will-change-transform">
        <ApperIcon name={config.icon} className="w-10 h-10 md:w-8 md:h-8 text-error" />
      </div>
      <h3 className="text-2xl md:text-xl font-display font-semibold text-gray-900 mb-3 md:mb-2
                     leading-tight">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-8 md:mb-6 max-w-md text-base md:text-sm leading-relaxed">
        {message || config.defaultMessage}. Please try again or contact support if the problem persists.
        {getBrowserSpecificMessage()}
      </p>
{onRetry && (
        <Button 
          onClick={() => {
            // Cross-browser haptic feedback
            if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
              try {
                navigator.vibrate(50);
              } catch (e) {
                // Silently ignore vibration errors on unsupported devices
              }
            }
            onRetry();
          }}
          variant="primary"
          size="lg"
          className="min-h-[44px] touch:min-h-[48px] px-8 text-base md:text-sm md:px-4 md:py-2
                     transition-all duration-150 active:scale-95 focus:outline-none 
                     focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     transform-gpu will-change-transform"
          style={{
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none'
          }}
        >
          <ApperIcon name="RefreshCw" className="w-5 h-5 md:w-4 md:h-4 mr-2 flex-shrink-0" />
          <span>Try Again</span>
        </Button>
      )}
{/* Cross-browser offline message */}
      {!navigator.onLine && (
        <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg
                        transform-gpu will-change-transform">
          <div className="flex items-center gap-2 text-warning-700">
            <ApperIcon name="WifiOff" className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm leading-tight">
              You're offline. Check your connection and try again.
            </span>
          </div>
        </div>
      )}
      
      {/* Browser-specific help */}
      <details className="mt-4 max-w-md">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                           rounded px-2 py-1">
          Browser troubleshooting tips
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p>• Clear your browser cache and cookies</p>
          <p>• Disable browser extensions temporarily</p>
          <p>• Try opening in an incognito/private window</p>
          <p>• Update your browser to the latest version</p>
        </div>
      </details>
    </div>
  );
};

export default Error;