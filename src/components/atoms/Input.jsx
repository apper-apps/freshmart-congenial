import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className, 
  type = "text", 
  label,
  error,
  required,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
<input
        type={type}
        className={cn(
          // Base styles with mobile optimization
          "w-full px-4 py-3 md:px-3 md:py-2 border border-gray-300 rounded-lg shadow-sm transition-all duration-200",
          // Focus styles
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          // Placeholder and hover
          "placeholder:text-gray-400",
          "hover:border-gray-400",
          // Mobile-specific optimizations
          "text-base md:text-sm", // Prevent zoom on mobile
          "min-h-[44px] md:min-h-0", // WCAG touch target size
          "touch-manipulation",
          // Error states
          error && "border-error focus:ring-error",
          className
        )}
        ref={ref}
        // Mobile keyboard optimizations
        autoComplete={props.autoComplete || "off"}
        autoCapitalize={type === "email" ? "none" : props.autoCapitalize}
        autoCorrect={type === "email" || type === "password" ? "off" : props.autoCorrect}
        spellCheck={type === "email" || type === "password" ? "false" : props.spellCheck}
        inputMode={
          type === "email" ? "email" :
          type === "tel" ? "tel" :
          type === "number" ? "numeric" :
          type === "search" ? "search" :
          props.inputMode
        }
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;