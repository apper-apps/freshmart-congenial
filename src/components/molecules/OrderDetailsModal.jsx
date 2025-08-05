import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { orderService } from '@/services/api/orderService';

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, statusConfig }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [verificationNotes, setVerificationNotes] = useState('');

  // Mock payment proof images (in real app, these would come from order data)
  const paymentProofImages = [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop'
  ];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleZoom = (delta) => {
    setImageZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleImageDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `payment-proof-order-${order.Id}-${selectedImage + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started');
  };

  const handleVerifyPayment = async (verified) => {
    try {
      await orderService.updatePaymentVerification(order.Id, verified, verificationNotes);
      toast.success(`Payment ${verified ? 'verified' : 'rejected'} successfully`);
      if (verified) {
        onStatusUpdate(order.Id, 'verified');
      }
    } catch (err) {
      toast.error('Failed to update payment verification');
    }
  };

  const workflowSteps = [
    { key: 'pending', label: 'Pending Verification', icon: 'Clock' },
    { key: 'verified', label: 'Payment Verified', icon: 'CheckCircle' },
    { key: 'processing', label: 'Processing', icon: 'Package' },
    { key: 'packed', label: 'Packed', icon: 'Box' },
    { key: 'shipped', label: 'Shipped', icon: 'Truck' },
    { key: 'delivered', label: 'Delivered', icon: 'CheckCircle2' }
  ];

  const getCurrentStepIndex = () => {
    return workflowSteps.findIndex(step => step.key === order.status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-premium-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Order #{order.Id}
            </h2>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            <ApperIcon name="X" className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Information */}
            <div className="space-y-6">
              {/* Customer Details */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="User" className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{order.deliveryInfo?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">
                      {order.deliveryInfo?.address || 'N/A'}, {order.deliveryInfo?.city || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Slot</label>
                    <p className="text-gray-900">{order.deliveryInfo?.deliverySlot || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-surface border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="ShoppingBag" className="w-5 h-5 mr-2" />
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Value</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900">{order.paymentMethod || 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Reference</span>
                    <span className="text-gray-900 font-mono">TXN{order.Id}ABC123</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-surface border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Package" className="w-5 h-5 mr-2" />
                  Items ({order.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Workflow */}
              <div className="bg-surface border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="GitBranch" className="w-5 h-5 mr-2" />
                  Order Workflow
                </h3>
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => {
                    const currentIndex = getCurrentStepIndex();
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-success text-white' :
                          isCurrent ? 'bg-primary-500 text-white' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          <ApperIcon name={step.icon} className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium ${
                            isCurrent ? 'text-primary-600' : 
                            isCompleted ? 'text-success' : 
                            'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <Badge variant="primary" size="sm" className="ml-2">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Verification */}
            <div className="space-y-6">
              {/* Payment Proof Viewer */}
              <div className="bg-surface border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="CreditCard" className="w-5 h-5 mr-2" />
                  Payment Proof Verification
                </h3>
                
                {/* Image Viewer */}
                <div className="mb-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64">
                    <img
                      src={paymentProofImages[selectedImage]}
                      alt={`Payment proof ${selectedImage + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
                      }}
                    />
                    
                    {/* Zoom Controls */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                      <Button
                        onClick={() => handleZoom(0.2)}
                        variant="outline"
                        size="sm"
                        className="bg-white/90"
                      >
                        <ApperIcon name="ZoomIn" className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleZoom(-0.2)}
                        variant="outline"
                        size="sm"
                        className="bg-white/90"
                      >
                        <ApperIcon name="ZoomOut" className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setImageZoom(1);
                          setImagePosition({ x: 0, y: 0 });
                        }}
                        variant="outline"
                        size="sm"
                        className="bg-white/90"
                      >
                        <ApperIcon name="RotateCcw" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Navigation */}
                  {paymentProofImages.length > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                      {paymentProofImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === selectedImage ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image Actions */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleImageDownload(paymentProofImages[selectedImage])}
                        variant="outline"
                        size="sm"
                      >
                        <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => toast.info('EXIF data: Timestamp - 2024-01-15 14:30:25')}
                        variant="outline"
                        size="sm"
                      >
                        <ApperIcon name="Info" className="w-4 h-4 mr-2" />
                        EXIF Data
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedImage + 1} of {paymentProofImages.length}
                    </span>
                  </div>
                </div>

                {/* Verification Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about payment verification..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
</div>

                {/* Transaction Validation Section */}
                {order.paymentValidation && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Transaction Validation Results</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Overall Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Overall Status</span>
                        <Badge 
                          variant={
                            order.paymentValidation.overallStatus === 'valid' ? 'success' :
                            order.paymentValidation.overallStatus === 'invalid' ? 'error' : 'warning'
                          }
                          className="flex items-center space-x-1"
                        >
                          <ApperIcon 
                            name={
                              order.paymentValidation.overallStatus === 'valid' ? 'CheckCircle' :
                              order.paymentValidation.overallStatus === 'invalid' ? 'XCircle' : 'AlertCircle'
                            } 
                            className="w-3 h-3" 
                          />
                          <span>{order.paymentValidation.overallStatus}</span>
                        </Badge>
                      </div>

                      {/* Validation Results */}
                      {order.paymentValidation.results && (
                        <div className="space-y-3">
                          {/* Bank Reference Validation */}
                          {order.paymentValidation.results.bankReference && (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <ApperIcon name="Building" className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">Bank Reference</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {order.paymentValidation.results.bankReference.message}
                                </p>
                                {order.paymentValidation.results.bankReference.details && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Reference: {order.paymentValidation.results.bankReference.details.reference}
                                  </p>
                                )}
                              </div>
                              <Badge 
                                variant={order.paymentValidation.results.bankReference.status === 'valid' ? 'success' : 'error'}
                                size="sm"
                              >
                                {order.paymentValidation.results.bankReference.status}
                              </Badge>
                            </div>
                          )}

                          {/* Timestamp Validation */}
                          {order.paymentValidation.results.timestamp && (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <ApperIcon name="Clock" className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">Payment Timing</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {order.paymentValidation.results.timestamp.message}
                                </p>
                                {order.paymentValidation.results.timestamp.details && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Time difference: {order.paymentValidation.results.timestamp.details.timeDifferenceMinutes} minutes
                                  </p>
                                )}
                              </div>
                              <Badge 
                                variant={order.paymentValidation.results.timestamp.status === 'valid' ? 'success' : 'error'}
                                size="sm"
                              >
                                {order.paymentValidation.results.timestamp.status}
                              </Badge>
                            </div>
                          )}

                          {/* Amount Validation */}
                          {order.paymentValidation.results.amount && (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <ApperIcon name="DollarSign" className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">Amount Matching</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {order.paymentValidation.results.amount.message}
                                </p>
                                {order.paymentValidation.results.amount.details && (
<p className="text-xs text-gray-500 mt-1">
                                    Paid: Rs {order.paymentValidation.results.amount.details.paidAmount.toLocaleString('en-PK')} | 
                                    Expected: Rs {order.paymentValidation.results.amount.details.expectedAmount.toLocaleString('en-PK')}
                                  </p>
                                )}
                              </div>
                              <Badge 
                                variant={order.paymentValidation.results.amount.status === 'valid' ? 'success' : 'error'}
                                size="sm"
                              >
                                {order.paymentValidation.results.amount.status}
                              </Badge>
                            </div>
                          )}

                          {/* Third-party Validation */}
                          {order.paymentValidation.results.thirdParty && (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <ApperIcon name="Shield" className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">Third-party Verification</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {order.paymentValidation.results.thirdParty.message}
                                </p>
                                {order.paymentValidation.results.thirdParty.details && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Validation ID: {order.paymentValidation.results.thirdParty.details.validationId}
                                  </p>
                                )}
                              </div>
                              <Badge 
                                variant={order.paymentValidation.results.thirdParty.status === 'valid' ? 'success' : 
                                        order.paymentValidation.results.thirdParty.status === 'error' ? 'warning' : 'error'}
                                size="sm"
                              >
                                {order.paymentValidation.results.thirdParty.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Validation Timestamp */}
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Validated on: {new Date(order.paymentValidation.timestamp).toLocaleString()}
                        </p>
                        {order.paymentValidation.transactionId && (
                          <p className="text-xs text-gray-500">
                            Transaction ID: {order.paymentValidation.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Actions */}
                {order.status === 'pending' && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleVerifyPayment(true)}
                      variant="primary"
                      className="flex-1"
                    >
                      <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                      Verify Payment
                    </Button>
                    <Button
                      onClick={() => handleVerifyPayment(false)}
                      variant="error"
                      className="flex-1"
                    >
                      <ApperIcon name="XCircle" className="w-4 h-4 mr-2" />
                      Reject Payment
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Status Update */}
              <div className="bg-surface border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ApperIcon name="Truck" className="w-5 h-5 mr-2" />
                  Quick Status Update
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Status</span>
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
                  </div>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <Button
                          key={status}
                          onClick={() => onStatusUpdate(order.Id, status)}
                          variant={order.status === status ? 'primary' : 'outline'}
                          size="sm"
                          disabled={order.status === status}
                          className="text-xs"
                        >
                          <ApperIcon name={config.icon} className="w-3 h-3 mr-1" />
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;