import React from "react";

const Loading = ({ type = "products", count = 6 }) => {
  if (type === "products") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl shadow-premium overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="w-1/2 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-20 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="w-full h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "deals") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-32 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="w-48 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "orders") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count || 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl shadow-premium p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-32 h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="w-24 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-40 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count || 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              <div className="w-16 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="w-32 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <div className="flex space-x-2" role="status" aria-label="Loading">
        <div 
          className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
          style={{ 
            animationDelay: "0s",
            WebkitAnimationDelay: "0s"
          }}
        ></div>
        <div 
          className="w-3 h-3 bg-secondary-500 rounded-full animate-bounce" 
          style={{ 
            animationDelay: "0.1s",
            WebkitAnimationDelay: "0.1s"
          }}
        ></div>
        <div 
          className="w-3 h-3 bg-accent-500 rounded-full animate-bounce" 
          style={{ 
            animationDelay: "0.2s",
            WebkitAnimationDelay: "0.2s"
          }}
        ></div>
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

export default Loading;