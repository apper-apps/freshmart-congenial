import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductGrid from "@/components/organisms/ProductGrid";
import CategoryFilter from "@/components/molecules/CategoryFilter";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { productService } from "@/services/api/productService";

const Categories = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const dealFilter = searchParams.get("deals") === "true";
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedTags, setSelectedTags] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags && product.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Apply price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply deal filter
    if (dealFilter) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, selectedTags, priceRange, dealFilter, sortBy]);

  const categories = [...new Set(products.map(product => product.category))];
  const totalResults = filteredProducts.length;

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" }
  ];

  if (selectedCategory) {
    breadcrumbs.push({ name: selectedCategory, path: `/categories/${selectedCategory}` });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.name}>
                {index > 0 && <ApperIcon name="ChevronRight" className="w-4 h-4" />}
                <span className={index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : "hover:text-primary-600 cursor-pointer"}>
                  {crumb.name}
                </span>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                {selectedCategory || (searchQuery ? `Search: "${searchQuery}"` : (dealFilter ? "Active Deals" : "All Products"))}
              </h1>
              <p className="text-gray-600 mt-1">
                {totalResults} {totalResults === 1 ? "product" : "products"} found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>    
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="lg:hidden"
              >
                <ApperIcon name="Filter" className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || selectedCategory || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-600 mr-2">Active filters:</span>
              {selectedCategory && (
                <Badge variant="primary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("")}>
                    <ApperIcon name="X" className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="accent" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}>
                    <ApperIcon name="X" className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedTags([]);
                  setPriceRange([0, 500]);
                }}
                variant="ghost"
                size="sm"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-premium p-6 sticky top-8">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedTags={selectedTags}
                onTagChange={setSelectedTags}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-premium-xl transform transition-transform duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="font-display font-semibold text-lg">Filters</h2>
                  <Button onClick={() => setShowFilters(false)} variant="ghost" size="sm">
                    <ApperIcon name="X" className="w-5 h-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedTags={selectedTags}
                    onTagChange={setSelectedTags}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <main className="flex-1">
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
              onRetry={loadProducts}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Categories;