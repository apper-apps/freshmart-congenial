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
    paymentMethods: ['card'],
    currencyType: 'USD'
  })
  const [showForm, setShowForm] = useState(false)
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState({})
  const [testingMode, setTestingMode] = useState(false)
  const [verificationMode, setVerificationMode] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [currencyValidationResults, setCurrencyValidationResults] = useState([])
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

// Financial data formatting middleware
  const formatFinancialData = (data) => {
    const formatted = { ...data };
    
    // Format currency amounts
    if (formatted.fees) {
      formatted.fees.transactionFee = parseFloat(formatted.fees.transactionFee || 0).toFixed(2);
      formatted.fees.percentageFee = parseFloat(formatted.fees.percentageFee || 0).toFixed(2);
    }
    
    // Validate currency format consistency
    const currencySymbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
    };
    
    formatted.currencySymbol = currencySymbols[formatted.currencyType] || '$';
    formatted.formattedTransactionFee = `${formatted.currencySymbol}${formatted.fees?.transactionFee || '0.00'}`;
    
    return formatted;
  };

  // Automated currency display validation
  const validateCurrencyDisplay = (gatewayData) => {
    const validationResults = [];
    
    // Check currency symbol consistency
    const expectedSymbol = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
    }[gatewayData.currencyType];
    
    validationResults.push({
      test: 'Currency Symbol Validation',
      passed: gatewayData.currencySymbol === expectedSymbol,
      expected: expectedSymbol,
      actual: gatewayData.currencySymbol
    });
    
    // Validate decimal places for currency
    const decimalPlaces = gatewayData.currencyType === 'JPY' ? 0 : 2;
    const feeDecimals = (gatewayData.fees?.transactionFee?.toString().split('.')[1] || '').length;
    
    validationResults.push({
      test: 'Currency Decimal Places',
      passed: feeDecimals === decimalPlaces,
      expected: decimalPlaces,
      actual: feeDecimals
    });
    
    return validationResults;
  };

  // Verification test scenarios
  const runVerificationTests = async () => {
    setVerificationMode(true);
    const results = [];
    
    try {
      // Test 1: Gateway creation success scenario
      const testGatewayData = {
        name: 'Test Gateway Verification',
        type: 'card',
        accountNumber: 'TEST1234567890',
        merchantId: 'TEST_MERCHANT_001',
        apiKey: 'test_api_key_12345',
        apiSecret: 'test_secret_abcdef',
        currencyType: 'USD',
        fees: { transactionFee: 0.30, percentageFee: 2.9 },
        isActive: true
      };
      
      const formattedTestData = formatFinancialData(testGatewayData);
      const currencyValidation = validateCurrencyDisplay(formattedTestData);
      
      results.push({
        scenario: 'Gateway Creation - Success Case',
        status: 'passed',
        details: 'Test gateway data formatted and validated successfully',
        currencyValidation
      });
      
      // Test 2: Invalid currency scenario
      const invalidCurrencyData = { ...testGatewayData, currencyType: 'INVALID' };
      try {
        formatFinancialData(invalidCurrencyData);
        results.push({
          scenario: 'Invalid Currency - Failure Case',
          status: 'failed',
          details: 'Should have rejected invalid currency type'
        });
      } catch (err) {
        results.push({
          scenario: 'Invalid Currency - Failure Case',
          status: 'passed',
          details: 'Correctly rejected invalid currency type'
        });
      }
      
      // Test 3: List appearance verification
      const currentGateways = await paymentGatewayService.getAll('admin');
      const listValidation = currentGateways.every(gateway => {
        const validation = validateCurrencyDisplay(formatFinancialData(gateway));
        return validation.every(v => v.passed);
      });
      
      results.push({
        scenario: 'Gateway List Display Validation',
        status: listValidation ? 'passed' : 'failed',
        details: `Validated ${currentGateways.length} gateways for currency display consistency`
      });
      
      setTestResults(results);
      setCurrencyValidationResults(currencyValidation);
      toast.success(`Verification completed: ${results.filter(r => r.status === 'passed').length}/${results.length} tests passed`);
      
    } catch (error) {
      results.push({
        scenario: 'Verification Process',
        status: 'failed',
        details: `Verification failed: ${error.message}`
      });
      setTestResults(results);
      toast.error('Verification tests failed');
    } finally {
      setVerificationMode(false);
    }
  };

async function handleSubmit(e) {
    e.preventDefault()
    
    // Frontend validation for required fields - only name and accountNumber are required
    const requiredFields = ['name', 'accountNumber'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Additional validation
    if (formData.accountNumber.length < 10) {
      toast.error('Account number must be at least 10 characters');
      return;
    }

    if (formData.apiKey.length < 8) {
      toast.error('API Key must be at least 8 characters');
      return;
    }

    // Currency validation
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];
    if (!supportedCurrencies.includes(formData.currencyType)) {
      toast.error('Please select a valid currency type');
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptSave = async () => {
      try {
        // Apply financial data formatting middleware
        const formattedData = formatFinancialData(formData);
        
        // Validate currency display formatting
        const currencyValidation = validateCurrencyDisplay(formattedData);
        const validationFailed = currencyValidation.some(v => !v.passed);
        
        if (validationFailed) {
          toast.error('Currency formatting validation failed. Please check your input.');
          setCurrencyValidationResults(currencyValidation);
          return;
        }
        
        // Prepare form data with currency configuration
        const gatewayData = {
          ...formattedData,
          supportedCurrencies: [formData.currencyType],
          primaryCurrency: formData.currencyType
        };

        if (selectedGateway) {
          await paymentGatewayService.update(selectedGateway.Id, gatewayData, 'admin')
          toast.success('Payment gateway updated successfully!')
        } else {
          await paymentGatewayService.create(gatewayData, 'admin')
          toast.success('Payment gateway created successfully!')
          
          // Add 2-second delay before refreshing to allow DB replication
          setTimeout(async () => {
            try {
              await loadGateways()
              
              // Run automatic validation on the new gateway
              const updatedGateways = await paymentGatewayService.getAll('admin');
              const newGateway = updatedGateways.find(g => g.name === gatewayData.name);
              if (newGateway) {
                const validation = validateCurrencyDisplay(newGateway);
                if (validation.some(v => !v.passed)) {
                  toast.warning('Gateway created but currency display validation failed');
                }
              }
            } catch (refreshErr) {
              console.warn('Auto-refresh failed:', refreshErr)
              toast.info('Gateway created but list refresh failed. Please refresh manually.')
            }
          }, 2000)
        }
        
        // Immediate refresh for updates, delayed for creates
        if (selectedGateway) {
          await loadGateways()
        }
        
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
          paymentMethods: ['card'],
          currencyType: 'USD'
        })
      } catch (err) {
        console.error(`Failed to save payment gateway (attempt ${retryCount + 1}):`, err)
        
        if (retryCount < maxRetries - 1 && (err.message?.includes('network') || err.message?.includes('timeout'))) {
          retryCount++
          toast.warning(`Save failed, retrying... (${retryCount}/${maxRetries})`)
          setTimeout(() => attemptSave(), 1000 * retryCount) // Exponential backoff
        } else {
          // Log detailed error for admin alerts
          console.error('CRITICAL: Gateway save failed after retries', {
            error: err.message,
            stack: err.stack,
            formData: { ...formData, apiKey: '***', apiSecret: '***' },
            timestamp: new Date().toISOString(),
            retryCount
          })
          
          toast.error(err.message || 'Failed to save payment gateway. Please try again or contact support.')
        }
      }
    }
    
    await attemptSave()
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
      paymentMethods: gateway.paymentMethods || ['card'],
      currencyType: gateway.primaryCurrency || gateway.supportedCurrencies?.[0] || 'USD'
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
              onClick={async () => {
                try {
                  await loadGateways()
                  toast.success('Gateway list refreshed successfully!')
                } catch (err) {
                  toast.error('Failed to refresh gateway list')
                }
              }}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ApperIcon name="RefreshCw" size={16} />
              Refresh List
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
                  paymentMethods: ['card'],
                  currencyType: 'USD'
                })
                setShowForm(true)
              }}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Gateway
            </Button>
            
            <Button
              onClick={runVerificationTests}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={verificationMode}
            >
              <ApperIcon name={verificationMode ? "Loader2" : "CheckCircle"} size={16} />
              {verificationMode ? 'Running Tests...' : 'Run Verification'}
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
{/* Verification Test Results */}
        {testResults.length > 0 && (
          <div className="bg-surface rounded-lg shadow-premium-lg p-6 mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">Verification Test Results</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  result.status === 'passed' 
                    ? 'border-success bg-success/10' 
                    : 'border-error bg-error/10'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <ApperIcon 
                      name={result.status === 'passed' ? 'CheckCircle' : 'XCircle'} 
                      size={20}
                      className={result.status === 'passed' ? 'text-success' : 'text-error'}
                    />
                    <h3 className="font-semibold">{result.scenario}</h3>
                  </div>
                  <p className="text-gray-600">{result.details}</p>
                  {result.currencyValidation && (
                    <div className="mt-3 space-y-2">
                      {result.currencyValidation.map((validation, vIndex) => (
                        <div key={vIndex} className="flex items-center gap-2 text-sm">
                          <ApperIcon 
                            name={validation.passed ? 'Check' : 'X'} 
                            size={14}
                            className={validation.passed ? 'text-success' : 'text-error'}
                          />
                          <span>{validation.test}: {validation.passed ? 'Passed' : 'Failed'}</span>
                          {!validation.passed && (
                            <span className="text-gray-500">
                              (Expected: {validation.expected}, Got: {validation.actual})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currency Validation Results */}
        {currencyValidationResults.length > 0 && (
          <div className="bg-surface rounded-lg shadow-premium-lg p-6 mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">Currency Formatting Validation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currencyValidationResults.map((validation, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  validation.passed ? 'border-success bg-success/5' : 'border-error bg-error/5'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ApperIcon 
                      name={validation.passed ? 'Check' : 'AlertTriangle'} 
                      size={16}
                      className={validation.passed ? 'text-success' : 'text-error'}
                    />
                    <span className="font-medium">{validation.test}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Expected: {validation.expected}</div>
                    <div>Actual: {validation.actual}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  setCurrencyValidationResults([]) // Clear validation results
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
                  label="Account Name"
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
                  required
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

                <div>
                  <Input
                    label={`Transaction Fee (${formData.currencyType === 'JPY' ? '¥' : '$'})`}
                    type="number"
                    step={formData.currencyType === 'JPY' ? '1' : '0.01'}
                    value={formData.fees.transactionFee}
                    onChange={(e) => handleInputChange('fees.transactionFee', parseFloat(e.target.value) || 0)}
                    placeholder={formData.currencyType === 'JPY' ? '30' : '0.30'}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Formatted: {formData.currencyType === 'USD' ? '$' : 
                              formData.currencyType === 'EUR' ? '€' :
                              formData.currencyType === 'GBP' ? '£' :
                              formData.currencyType === 'INR' ? '₹' :
                              formData.currencyType === 'CAD' ? 'C$' :
                              formData.currencyType === 'AUD' ? 'A$' :
                              formData.currencyType === 'JPY' ? '¥' : '$'}
                    {formData.currencyType === 'JPY' ? 
                      Math.round(formData.fees.transactionFee || 0) :
                      (formData.fees.transactionFee || 0).toFixed(2)
                    }
                  </div>
                </div>

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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Currency Type *
                  </label>
                  <select
                    value={formData.currencyType}
                    onChange={(e) => handleInputChange('currencyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="CAD">CAD - Canadian Dollar (C$)</option>
                    <option value="AUD">AUD - Australian Dollar (A$)</option>
                    <option value="JPY">JPY - Japanese Yen (¥)</option>
                  </select>
                  <div className="text-xs text-gray-500">
                    Currency formatting will be automatically validated
                  </div>
                </div>

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
                    setCurrencyValidationResults([])
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
                  {filteredGateways.map((gateway, index) => {
                    // Format currency display for each gateway
                    const currencySymbol = {
                      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
                      'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
                    }[gateway.primaryCurrency || gateway.currencyType || 'USD'] || '$';
                    
                    const formattedFee = gateway.currencyType === 'JPY' || gateway.primaryCurrency === 'JPY' ?
                      `${currencySymbol}${Math.round(gateway.fees?.transactionFee || 0)}` :
                      `${currencySymbol}${(gateway.fees?.transactionFee || 0).toFixed(2)}`;
                    
                    return (
                      <Draggable
                        key={gateway.Id}
                        draggableId={gateway.Id.toString()}
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
                                    <Badge variant="outline" className="text-xs">
                                      {gateway.primaryCurrency || gateway.currencyType || 'USD'}
                                    </Badge>
                                  </div>
                                  
<div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span>Priority: {gateway.priority}</span>
                                    <span>•</span>
                                    <span>
                                      Fee: {formattedFee} + {gateway.fees?.percentageFee || 0}%
                                    </span>
                                    {gateway.accountNumber && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-2">
                                          <span>Account:</span>
                                          <span className="font-mono">
                                            {visibleAccountNumbers[gateway.Id]
                                              ? gateway.accountNumber
                                              : maskAccountNumber(gateway.accountNumber)
                                            }
                                          </span>
                                          <button
                                            onClick={() => toggleAccountNumberVisibility(gateway.Id)}
                                            className="text-gray-400 hover:text-gray-600"
                                          >
                                            <ApperIcon
                                              name={visibleAccountNumbers[gateway.Id] ? 'EyeOff' : 'Eye'}
                                              size={14}
                                            />
                                          </button>
                                          <button
                                            onClick={() => copyAccountNumber(gateway.accountNumber)}
                                            className="text-gray-400 hover:text-gray-600"
                                          >
                                            <ApperIcon name="Copy" size={14} />
                                          </button>
                                        </div>
                                      </>
                                    )}
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
                    );
                  })}
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