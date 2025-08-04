import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { paymentGatewayService } from "@/services/api/paymentGatewayService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Account from "@/components/pages/Account";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

function AdminPaymentGateways() {
  const [gateways, setGateways] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(true)
  const [selectedGateway, setSelectedGateway] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'card',
    accountNumber: '',
    routingNumber: '',
    merchantId: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    isActive: true,
    priority: 1,
    fees: {
      transactionFee: 0,
      percentageFee: 0
    },
    supportedCurrencies: ['USD'],
    paymentMethods: ['card']
  })
  const [showForm, setShowForm] = useState(false)
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState({})
  const [testingMode, setTestingMode] = useState(false)

  useEffect(() => {
    loadGateways()
  }, [])

async function loadGateways() {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentGatewayService.getAll('admin')
      setGateways(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load payment gateways:', err)
      setError(err.message || 'Failed to load payment gateways')
      setGateways([])
    } finally {
      setLoading(false)
    }
  }
  function handleInputChange(field, value) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (selectedGateway) {
        await paymentGatewayService.update(selectedGateway.Id, formData, 'admin')
        toast.success('Payment gateway updated successfully!')
      } else {
        await paymentGatewayService.create(formData, 'admin')
        toast.success('Payment gateway created successfully!')
      }
      await loadGateways()
      setShowForm(false)
      setSelectedGateway(null)
      setFormData({
        name: '',
        type: 'card',
        accountNumber: '',
        routingNumber: '',
        merchantId: '',
        apiKey: '',
        apiSecret: '',
        webhookUrl: '',
        isActive: true,
        priority: 1,
        fees: {
          transactionFee: 0,
          percentageFee: 0
        },
        supportedCurrencies: ['USD'],
        paymentMethods: ['card']
      })
    } catch (err) {
      console.error('Failed to save payment gateway:', err)
      toast.error(err.message || 'Failed to save payment gateway')
    }
  }
  function handleEdit(gateway) {
    setSelectedGateway(gateway)
    setFormData({
      name: gateway.name || '',
      type: gateway.type || 'card',
      accountNumber: gateway.accountNumber || '',
      routingNumber: gateway.routingNumber || '',
      merchantId: gateway.merchantId || '',
      apiKey: gateway.apiKey || '',
      apiSecret: gateway.apiSecret || '',
      webhookUrl: gateway.webhookUrl || '',
      isActive: gateway.isActive !== false,
      priority: gateway.priority || 1,
      fees: {
        transactionFee: gateway.fees?.transactionFee || 0,
        percentageFee: gateway.fees?.percentageFee || 0
      },
      supportedCurrencies: gateway.supportedCurrencies || ['USD'],
      paymentMethods: gateway.paymentMethods || ['card']
    })
    setShowForm(true)
  }

async function handleDelete(gateway) {
    if (!window.confirm(`Are you sure you want to delete ${gateway.name}?`)) {
      return
    }
    
    try {
      await paymentGatewayService.delete(gateway.Id, 'admin')
      toast.success('Payment gateway deleted successfully!')
      await loadGateways()
    } catch (err) {
      console.error('Failed to delete payment gateway:', err)
      toast.error(err.message || 'Failed to delete payment gateway')
    }
  }
  async function handleDragEnd(result) {
    if (!result.destination) return

    const items = Array.from(gateways)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update priorities based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1
    }))

    setGateways(updatedItems)
try {
      await paymentGatewayService.updateOrder(updatedItems.map(item => item.Id), 'admin')
      toast.success('Gateway order updated successfully!')
    } catch (err) {
      console.error('Failed to update gateway order:', err)
      toast.error('Failed to update gateway order')
      // Revert on error
      await loadGateways()
    }
  }
async function handleToggleTestingMode() {
    try {
      const newMode = !testingMode
      await paymentGatewayService.toggleTestingMode(newMode, 'admin')
      setTestingMode(newMode)
      toast.success(`Testing mode ${newMode ? 'enabled' : 'disabled'}`)
      await loadGateways()
    } catch (err) {
      console.error('Failed to toggle testing mode:', err)
      toast.error('Failed to toggle testing mode')
    }
  }
async function handleToggleStatus(gateway) {
    try {
      await paymentGatewayService.toggleStatus(gateway.Id, 'admin')
      toast.success(`Gateway ${!gateway.isActive ? 'activated' : 'deactivated'}`)
      await loadGateways()
    } catch (err) {
      console.error('Failed to toggle gateway status:', err)
      toast.error('Failed to update gateway status')
    }
  }
  function toggleAccountNumberVisibility(gatewayId) {
    setVisibleAccountNumbers(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }))
  }

  function maskAccountNumber(accountNumber) {
    if (!accountNumber) return 'Not set'
    if (accountNumber.length <= 4) return accountNumber
    return `****${accountNumber.slice(-4)}`
  }

  function copyAccountNumber(accountNumber) {
    if (!accountNumber) return
    navigator.clipboard.writeText(accountNumber)
      .then(() => toast.success('Account number copied to clipboard'))
      .catch(() => toast.error('Failed to copy account number'))
  }

  if (!isAdmin) {
    return <Account />
  }

  if (loading) {
    return <Loading message="Loading payment gateways..." />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadGateways}
      />
    )
  }

  const filteredGateways = gateways.filter(gateway => gateway && gateway.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Payment Gateways
            </h1>
            <p className="text-gray-600 mt-2">
              Manage payment processing gateways and configurations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleToggleTestingMode}
              variant={testingMode ? 'primary' : 'secondary'}
              className="flex items-center gap-2"
            >
              <ApperIcon name="TestTube" size={16} />
              {testingMode ? 'Testing Mode' : 'Production Mode'}
            </Button>
            
            <Button
              onClick={() => {
                setSelectedGateway(null)
                setFormData({
                  name: '',
                  type: 'card',
                  accountNumber: '',
                  routingNumber: '',
                  merchantId: '',
                  apiKey: '',
                  apiSecret: '',
                  webhookUrl: '',
                  isActive: true,
                  priority: 1,
                  fees: {
                    transactionFee: 0,
                    percentageFee: 0
                  },
                  supportedCurrencies: ['USD'],
                  paymentMethods: ['card']
                })
                setShowForm(true)
              }}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Gateway
            </Button>
          </div>
        </div>

        {/* Testing Mode Banner */}
        {testingMode && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <ApperIcon name="AlertTriangle" size={20} className="text-warning" />
              <div>
                <h3 className="font-semibold text-warning">Testing Mode Active</h3>
                <p className="text-sm text-gray-600">
                  All transactions will be processed in test mode. No real payments will be charged.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gateway Form */}
        {showForm && (
          <div className="bg-surface rounded-lg shadow-premium-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold">
                {selectedGateway ? 'Edit Gateway' : 'Add New Gateway'}
              </h2>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setSelectedGateway(null)
                }}
                variant="ghost"
                size="sm"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Gateway Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Stripe, PayPal, Square"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateway Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="digital_wallet">Digital Wallet</option>
                    <option value="cryptocurrency">Cryptocurrency</option>
                  </select>
                </div>

                <Input
                  label="Account Number"
                  type="password"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Account or merchant ID"
                />

                <Input
                  label="Routing Number"
                  value={formData.routingNumber}
                  onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                  placeholder="Optional routing number"
                />

                <Input
                  label="Merchant ID"
                  value={formData.merchantId}
                  onChange={(e) => handleInputChange('merchantId', e.target.value)}
                  placeholder="Merchant identifier"
                />

                <Input
                  label="API Key"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="API key for gateway"
                />

                <Input
                  label="API Secret"
                  type="password"
                  value={formData.apiSecret}
                  onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                  placeholder="API secret key"
                />

                <Input
                  label="Webhook URL"
                  value={formData.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  placeholder="https://your-site.com/webhook"
                />

                <Input
                  label="Transaction Fee ($)"
                  type="number"
                  step="0.01"
                  value={formData.fees.transactionFee}
                  onChange={(e) => handleInputChange('fees.transactionFee', parseFloat(e.target.value) || 0)}
                  placeholder="0.30"
                />

                <Input
                  label="Percentage Fee (%)"
                  type="number"
                  step="0.01"
                  value={formData.fees.percentageFee}
                  onChange={(e) => handleInputChange('fees.percentageFee', parseFloat(e.target.value) || 0)}
                  placeholder="2.9"
                />

                <Input
                  label="Priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  min="1"
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Gateway
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedGateway(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedGateway ? 'Update Gateway' : 'Create Gateway'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Gateway List */}
        {filteredGateways.length === 0 ? (
          <Empty 
            title="No Payment Gateways"
            description="Add your first payment gateway to start processing payments"
            actionLabel="Add Gateway"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gateways">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {filteredGateways.map((gateway, index) => (
                    <Draggable
                      key={gateway.id}
                      draggableId={gateway.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-surface rounded-lg shadow-premium p-6 border-2 transition-all ${
                            snapshot.isDragging
                              ? 'border-primary-300 shadow-premium-lg'
                              : 'border-transparent hover:shadow-premium-lg'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <ApperIcon name="GripVertical" size={20} />
                              </div>

                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {gateway.name}
                                  </h3>
                                  <Badge
                                    variant={gateway.isActive ? 'success' : 'secondary'}
                                  >
                                    {gateway.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge variant="outline">
                                    {gateway.type}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span>Priority: {gateway.priority}</span>
                                  <span>•</span>
                                  <span>
                                    Fee: ${gateway.fees?.transactionFee || 0} + {gateway.fees?.percentageFee || 0}%
                                  </span>
                                  <span>•</span>
                                  <div className="flex items-center gap-2">
                                    <span>Account:</span>
                                    <span className="font-mono">
                                      {visibleAccountNumbers[gateway.id]
                                        ? gateway.accountNumber || 'Not set'
                                        : maskAccountNumber(gateway.accountNumber)
                                      }
                                    </span>
                                    <button
                                      onClick={() => toggleAccountNumberVisibility(gateway.id)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <ApperIcon
                                        name={visibleAccountNumbers[gateway.id] ? 'EyeOff' : 'Eye'}
                                        size={14}
                                      />
                                    </button>
                                    {gateway.accountNumber && (
                                      <button
                                        onClick={() => copyAccountNumber(gateway.accountNumber)}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        <ApperIcon name="Copy" size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleToggleStatus(gateway)}
                                variant={gateway.isActive ? 'secondary' : 'primary'}
                                size="sm"
                              >
                                <ApperIcon
                                  name={gateway.isActive ? 'Pause' : 'Play'}
                                  size={14}
                                />
                                {gateway.isActive ? 'Deactivate' : 'Activate'}
                              </Button>

                              <Button
                                onClick={() => handleEdit(gateway)}
                                variant="ghost"
                                size="sm"
                              >
                                <ApperIcon name="Edit" size={14} />
                              </Button>

                              <Button
                                onClick={() => handleDelete(gateway)}
                                variant="ghost"
                                size="sm"
                                className="text-error hover:text-error hover:bg-error/10"
                              >
                                <ApperIcon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}

export default AdminPaymentGateways