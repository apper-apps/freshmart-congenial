import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  selectedTags,
  onTagChange,
  priceRange,
  onPriceRangeChange,
  className 
}) => {
  const dietaryTags = ["Organic", "Vegan", "Gluten-Free", "Non-GMO", "Fresh", "Local"];

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
          Categories
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
              selectedCategory === "" 
                ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 font-medium" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
                selectedCategory === category 
                  ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 font-medium" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
          Dietary Preferences
        </h3>
        <div className="space-y-2">
          {dietaryTags.map((tag) => (
            <label key={tag} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onTagChange([...selectedTags, tag]);
                  } else {
                    onTagChange(selectedTags.filter(t => t !== tag));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
          Price Range
        </h3>
        <div className="space-y-4">
          <div className="px-3">
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹0</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;