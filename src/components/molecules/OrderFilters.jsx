import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';

const OrderFilters = ({ filters, onFiltersChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending Verification', color: 'warning' },
    { value: 'verified', label: 'Payment Verified', color: 'info' },
    { value: 'processing', label: 'Processing', color: 'primary' },
    { value: 'packed', label: 'Packed', color: 'secondary' },
    { value: 'shipped', label: 'Shipped', color: 'accent' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const paymentMethods = [
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'wallet', label: 'Digital Wallet' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const handleStatusToggle = (status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleInputChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.customerSearch) count++;
    if (filters.paymentMethod) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  };

  const isFilterActive = () => {
    return getActiveFiltersCount() > 0;
  };

  return (
    <div className="bg-surface rounded-xl shadow-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Order Filters
          </h3>
          {isFilterActive() && (
            <Badge variant="primary" size="sm">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            <ApperIcon 
              name={showAdvanced ? "ChevronUp" : "ChevronDown"} 
              className="w-4 h-4 mr-2" 
            />
            Advanced
          </Button>
          {isFilterActive() && (
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="X" className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="space-y-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Order Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusToggle(status.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status.includes(status.value)
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Customer Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Customer/Order ID
          </label>
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter customer name or order ID..."
              value={filters.customerSearch}
              onChange={(e) => handleInputChange('customerSearch', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleInputChange('minAmount', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFilters;