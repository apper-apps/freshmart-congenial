import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className, 
  disabled,
  loading,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-premium-lg hover:shadow-premium-xl",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-premium-lg hover:shadow-premium-xl",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-premium-lg hover:shadow-premium-xl",
    outline: "border-2 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400",
    ghost: "text-gray-600 hover:text-primary-600 hover:bg-primary-50",
    danger: "bg-gradient-to-r from-error to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-premium-lg hover:shadow-premium-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

return (
    <button
      ref={ref}
      className={cn(
        // Base styles with mobile optimization
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300",
        // Mobile-first touch optimization
        "transform hover:scale-105 active:scale-95 md:hover:scale-105 md:active:scale-95",
        // Focus and accessibility
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        // Touch-friendly sizing
        "min-h-[44px] md:min-h-0", // WCAG touch target size
        "touch-manipulation select-none",
        // Disabled states
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={(e) => {
        // Haptic feedback for mobile
        if ('vibrate' in navigator && !disabled && !loading) {
          navigator.vibrate(50);
        }
        if (props.onClick) {
          props.onClick(e);
        }
      }}
      onTouchStart={(e) => {
        // Immediate visual feedback on touch
        e.currentTarget.style.transform = 'scale(0.95)';
        if (props.onTouchStart) {
          props.onTouchStart(e);
        }
      }}
      onTouchEnd={(e) => {
        // Reset visual feedback
        e.currentTarget.style.transform = '';
        if (props.onTouchEnd) {
          props.onTouchEnd(e);
        }
      }}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;