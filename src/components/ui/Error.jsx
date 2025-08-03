import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
      <div className="w-16 h-16 bg-gradient-to-br from-error/10 to-error/20 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {message}. Please try again or contact support if the problem persists.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;