import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No items found", 
  description = "Try adjusting your search or filters to find what you're looking for.",
  actionLabel = "Browse All Products",
  onAction,
  icon = "Package"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="w-10 h-10 text-primary-600" />
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction} variant="primary" size="lg">
          <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;