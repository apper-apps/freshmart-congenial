import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { orderService } from '@/services/api/orderService';
import OrderSummaryCards from '@/components/molecules/OrderSummaryCards';
import OrderFilters from '@/components/molecules/OrderFilters';
import OrderDetailsModal from '@/components/molecules/OrderDetailsModal';

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    dateFrom: '',
    dateTo: '',
    customerSearch: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: ''
  });

  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending Verification', icon: 'Clock' },
    verified: { variant: 'info', label: 'Payment Verified', icon: 'CheckCircle' },
    processing: { variant: 'primary', label: 'Processing', icon: 'Package' },
    packed: { variant: 'secondary', label: 'Packed', icon: 'Box' },
    shipped: { variant: 'accent', label: 'Shipped', icon: 'Truck' },
    delivered: { variant: 'success', label: 'Delivered', icon: 'CheckCircle2' },
    cancelled: { variant: 'error', label: 'Cancelled', icon: 'XCircle' }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, statsData] = await Promise.all([
        orderService.getAll(),
        orderService.getStatistics()
      ]);
      setOrders(ordersData);
      setStatistics(statsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await orderService.getFiltered(filters);
      setFilteredOrders(filtered);
    } catch (err) {
      console.error('Filter error:', err);
      setFilteredOrders(orders);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.Id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Update statistics
      const newStats = await orderService.getStatistics();
      setStatistics(newStats);
      
      toast.success(`Order status updated to ${statusConfig[newStatus]?.label || newStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
          <Loading type="cards" count={6} />
          <div className="mt-8">
            <Loading type="orders" count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Error 
            message={error} 
            onRetry={loadData}
            type="orders"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order Management Dashboard
          </h1>
          <p className="text-gray-600">
            Manage customer orders, verify payments, and track deliveries
          </p>
        </div>

        {/* Summary Cards */}
        {statistics && (
          <OrderSummaryCards statistics={statistics} />
        )}

        {/* Filters */}
        <div className="mb-8">
          <OrderFilters 
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({
              status: [],
              dateFrom: '',
              dateTo: '',
              customerSearch: '',
              paymentMethod: '',
              minAmount: '',
              maxAmount: ''
            })}
          />
        </div>

        {/* Orders List */}
        <div className="bg-surface rounded-xl shadow-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Orders ({filteredOrders.length})
            </h2>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="ShoppingBag" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.Id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-premium transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                        <ApperIcon name="ShoppingBag" className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.Id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.deliveryInfo?.fullName || 'Unknown Customer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={statusConfig[order.status]?.variant || 'default'}
                        className="flex items-center space-x-1"
                      >
                        <ApperIcon 
                          name={statusConfig[order.status]?.icon || 'Circle'} 
                          className="w-3 h-3" 
                        />
                        <span>{statusConfig[order.status]?.label || order.status}</span>
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.Id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                        >
                          <option value="pending">Pending Verification</option>
                          <option value="verified">Payment Verified</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      )}
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        size="sm"
                      >
                        <ApperIcon name="Eye" className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            statusConfig={statusConfig}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;