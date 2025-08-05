import CryptoJS from "crypto-js";
import React from "react";
import paymentGatewaysData from "@/services/mockData/paymentGateways.json";
import Error from "@/components/ui/Error";
// Field validation utilities
// Financial data formatting middleware
const formatFinancialData = (data) => {
  const formatted = { ...data };
  
  // Format currency amounts based on currency type
  if (formatted.fees) {
    const decimalPlaces = formatted.currencyType === 'JPY' ? 0 : 2;
    formatted.fees.transactionFee = parseFloat(formatted.fees.transactionFee || 0).toFixed(decimalPlaces);
    formatted.fees.percentageFee = parseFloat(formatted.fees.percentageFee || 0).toFixed(2);
  }
  
  // Add currency symbol for consistent display
  const currencySymbols = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
    'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
  };
  
  formatted.currencySymbol = currencySymbols[formatted.currencyType] || '$';
  
  return formatted;
};

// Currency display validation middleware
const validateCurrencyFormatting = (data) => {
  const errors = [];
  
  // Validate currency symbol consistency
  const expectedSymbol = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
    'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
  }[data.currencyType];
  
  if (data.currencySymbol && data.currencySymbol !== expectedSymbol) {
    errors.push(`Currency symbol mismatch: expected ${expectedSymbol}, got ${data.currencySymbol}`);
  }
  
  // Validate decimal places for currency amounts
  if (data.fees && data.fees.transactionFee) {
    const decimalPlaces = (data.fees.transactionFee.toString().split('.')[1] || '').length;
    const expectedDecimals = data.currencyType === 'JPY' ? 0 : 2;
    
    if (decimalPlaces !== expectedDecimals) {
      errors.push(`Transaction fee decimal places: expected ${expectedDecimals}, got ${decimalPlaces}`);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Currency formatting validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

const validateUniqueConstraints = (data, existingData, field) => {
  const duplicate = existingData.find(item => 
    item[field] && data[field] && 
    item[field].toLowerCase() === data[field].toLowerCase()
  );
  if (duplicate) {
    throw new Error(`${field} '${data[field]}' already exists`);
  }
};
// Enhanced delay with connection failure simulation
const delay = (ms) => new Promise((resolve, reject) => {
  // Simulate occasional connection failures (1% chance)
  if (Math.random() < 0.01) {
    setTimeout(() => reject(new Error('Database connection timeout')), ms);
  } else {
    setTimeout(resolve, ms);
  }
});

// Enhanced encryption utilities with error handling
const ENCRYPTION_KEY = "FreshMart-Gateway-Secret-Key-2024";

const encryptData = (data) => {
  try {
    if (!data) return null;
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedString ? JSON.parse(decryptedString) : null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
// Enhanced audit logging with transaction tracking
const auditLog = [];
const transactionLogs = [];

// Database indexing simulation
const gatewayIndexes = {
  byName: new Map(),
  byMerchantId: new Map(),
  byAccountNumber: new Map()
};

// Testing mode state
let isTestingMode = false;
const testGateways = [];
const verificationResults = [];
// Enhanced audit logging with detailed tracking
const logAuditEvent = (action, gatewayId, gatewayName, userId = 'admin', details = {}) => {
  const logEntry = {
    id: auditLog.length + 1,
    timestamp: new Date().toISOString(),
    userId,
    action,
    gatewayId,
    gatewayName,
    details: {
      ...details,
      userAgent: navigator?.userAgent || 'Unknown',
      sessionId: `session_${Date.now()}`
    },
    ipAddress: '127.0.0.1', // Simulated
    success: true
  };
  auditLog.push(logEntry);
  console.log('Audit Log:', logEntry);
  
  // Log transaction attempts for gateway operations
  if (['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
    logTransactionAttempt(action, gatewayId, gatewayName, true);
  }
};

// Transaction logging for database operations
const logTransactionAttempt = (operation, gatewayId, gatewayName, success, error = null) => {
  const transactionEntry = {
    id: transactionLogs.length + 1,
    timestamp: new Date().toISOString(),
    operation,
    gatewayId,
    gatewayName,
    success,
    error: error?.message || null,
    duration: Math.random() * 500 + 100, // Simulated operation time
    retryCount: 0,
    currencyFormatting: success ? 'valid' : 'validation_failed'
  };
  transactionLogs.push(transactionEntry);
  
  if (!success) {
    console.error('Transaction Failed:', transactionEntry);
    // Trigger admin alert for critical failures
    triggerAdminAlert('TRANSACTION_FAILED', transactionEntry);
  }
};

// Automated currency display tests
const runCurrencyDisplayTests = (gatewayData) => {
  const testResults = [];
  
  try {
    // Test 1: Currency symbol validation
    const expectedSymbol = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
    }[gatewayData.currencyType];
    
    testResults.push({
      test: 'Currency Symbol Validation',
      passed: gatewayData.currencySymbol === expectedSymbol,
      expected: expectedSymbol,
      actual: gatewayData.currencySymbol
    });
    
    // Test 2: Decimal formatting validation
    const expectedDecimals = gatewayData.currencyType === 'JPY' ? 0 : 2;
    const actualDecimals = gatewayData.fees?.transactionFee ? 
      (gatewayData.fees.transactionFee.toString().split('.')[1] || '').length : 0;
    
    testResults.push({
      test: 'Decimal Places Validation',
      passed: actualDecimals === expectedDecimals,
      expected: expectedDecimals,
      actual: actualDecimals
    });
    
    // Test 3: Fee formatting consistency
    const formattedFee = `${gatewayData.currencySymbol}${gatewayData.fees?.transactionFee || '0.00'}`;
    const isValidFormat = /^[€$£₹¥C\$A\$]\d+(\.\d{2})?$/.test(formattedFee.replace('C$', 'C').replace('A$', 'A'));
    
    testResults.push({
      test: 'Fee Format Consistency',
      passed: isValidFormat,
      expected: 'Valid currency format',
      actual: formattedFee
    });
    
  } catch (error) {
    testResults.push({
      test: 'Currency Display Tests',
      passed: false,
      expected: 'All tests to pass',
      actual: error.message
    });
  }
  
  verificationResults.push({
    gatewayId: gatewayData.Id,
    timestamp: new Date().toISOString(),
    tests: testResults,
    overallStatus: testResults.every(t => t.passed) ? 'PASSED' : 'FAILED'
  });
  
  return testResults;
};

// Admin alert system for critical failures
const triggerAdminAlert = (alertType, details) => {
  const alert = {
    id: `alert_${Date.now()}`,
    type: alertType,
    severity: 'HIGH',
    timestamp: new Date().toISOString(),
    details,
    acknowledged: false
  };
  
  console.warn('ADMIN ALERT:', alert);
  // In a real system, this would send notifications to admin dashboard
};

// Role validation with enhanced security
const validateAdminRole = (userRole) => {
  if (!userRole || userRole !== 'admin') {
    logAuditEvent('ACCESS_DENIED', null, 'Unknown', userRole || 'anonymous', {
      attemptedAction: 'admin_operation',
      reason: 'insufficient_privileges'
    });
    throw new Error("Access denied. Admin privileges required.");
  }
};

// Update indexes for database optimization simulation
const updateIndexes = (gateway, operation = 'CREATE') => {
  if (operation === 'CREATE' || operation === 'UPDATE') {
    gatewayIndexes.byName.set(gateway.name.toLowerCase(), gateway.Id);
    gatewayIndexes.byMerchantId.set(gateway.merchantId, gateway.Id);
    if (gateway.accountNumber) {
      gatewayIndexes.byAccountNumber.set(gateway.accountNumber, gateway.Id);
    }
  } else if (operation === 'DELETE') {
    gatewayIndexes.byName.delete(gateway.name.toLowerCase());
    gatewayIndexes.byMerchantId.delete(gateway.merchantId);
    if (gateway.accountNumber) {
      gatewayIndexes.byAccountNumber.delete(gateway.accountNumber);
    }
  }
};
export const paymentGatewayService = {
async getAll(userRole = null) {
    validateAdminRole(userRole);
    
    try {
      await delay(300);
      
      const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
      const gateways = [...sourceData].map(gateway => {
        const decryptedGateway = {
          ...gateway,
          accountNumber: gateway.encryptedAccountNumber ? 
            decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
            gateway.accountNumber
        };
        
        // Apply financial data formatting middleware
        const formattedGateway = formatFinancialData(decryptedGateway);
        
        // Run automated currency display validation
        if (formattedGateway.currencyType) {
          try {
            validateCurrencyFormatting(formattedGateway);
            runCurrencyDisplayTests(formattedGateway);
          } catch (validationError) {
            console.warn(`Currency validation failed for gateway ${formattedGateway.Id}:`, validationError.message);
          }
        }
        
        return formattedGateway;
      });
    
      logAuditEvent('VIEW_ALL', null, 'All Gateways', 'admin');
      return gateways.sort((a, b) => (a.position || 0) - (b.position || 0));
    } catch (error) {
      logTransactionAttempt('VIEW_ALL_FAILED', null, 'All Gateways', false, error);
      throw error;
    }
  },
  async getAllActive() {
    await delay(200);
    
    const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
    const activeGateways = sourceData
      .filter(gateway => gateway.isActive)
      .map(gateway => ({
        ...gateway,
        accountNumber: gateway.encryptedAccountNumber ? 
          decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
          gateway.accountNumber
      }));
    
    return activeGateways.sort((a, b) => (a.position || 0) - (b.position || 0));
  },

async getActive(userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    
    const activeGateways = paymentGatewaysData.filter(gateway => gateway.isActive).map(gateway => ({
      ...gateway,
      accountNumber: gateway.encryptedAccountNumber ? 
        decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
        gateway.accountNumber
    }));
    
    logAuditEvent('VIEW_ACTIVE', null, 'Active Gateways', 'admin');
    return activeGateways;
  },

async getById(id, userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    const gateway = paymentGatewaysData.find(g => g.Id === parseInt(id));
    if (!gateway) {
      throw new Error("Payment gateway not found");
    }
    
    const decryptedGateway = {
      ...gateway,
      accountNumber: gateway.encryptedAccountNumber ? 
        decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
        gateway.accountNumber
    };
    
    logAuditEvent('VIEW', id, gateway.name, 'admin');
    return decryptedGateway;
  },

async create(gatewayData, userRole = null) {
    validateAdminRole(userRole);
    
    try {
      // Simulate atomic transaction start
      const transactionId = `tx_${Date.now()}`;
      logTransactionAttempt('CREATE_START', null, gatewayData.name, true);
      
      await delay(500);
      
      const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
      
      // Apply financial data formatting middleware
      const formattedGatewayData = formatFinancialData(gatewayData);
      
      // Validate currency formatting before processing
      try {
        validateCurrencyFormatting(formattedGatewayData);
      } catch (currencyError) {
        logTransactionAttempt('CREATE_FAILED', null, gatewayData.name, false, currencyError);
        throw currencyError;
      }
      
      // Enhanced validation for required fields
      const requiredFields = ['name', 'accountNumber', 'merchantId', 'apiKey', 'apiSecret'];
      validateRequiredFields(formattedGatewayData, requiredFields);
      
      // Check unique constraints to prevent duplicates
      validateUniqueConstraints(formattedGatewayData, sourceData, 'name');
      validateUniqueConstraints(formattedGatewayData, sourceData, 'merchantId');
      validateUniqueConstraints(formattedGatewayData, sourceData, 'accountNumber');
      
      // Additional business validation
      if (formattedGatewayData.accountNumber.length < 10) {
        throw new Error('Account number must be at least 10 characters');
      }
      
      if (formattedGatewayData.apiKey.length < 8) {
        throw new Error('API Key must be at least 8 characters');
      }

      // Currency validation
      const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];
      if (formattedGatewayData.currencyType && !supportedCurrencies.includes(formattedGatewayData.currencyType)) {
        throw new Error('Invalid currency type selected');
      }
      
      // Generate new ID with collision protection
      const maxId = Math.max(...sourceData.map(g => g.Id), 0);
      const newId = maxId + 1;
      
      // Store plain text values for return object
      const plainAccountNumber = formattedGatewayData.accountNumber;
      const plainApiKey = formattedGatewayData.apiKey;
      const plainApiSecret = formattedGatewayData.apiSecret;
      
      // Encrypt sensitive data
      const encryptedAccountNumber = encryptData(formattedGatewayData.accountNumber);
      const encryptedApiKey = encryptData(formattedGatewayData.apiKey);
      const encryptedApiSecret = encryptData(formattedGatewayData.apiSecret);
      
      const newGateway = {
        ...formattedGatewayData,
        Id: newId,
        encryptedAccountNumber,
        encryptedApiKey,
        encryptedApiSecret,
        accountNumber: undefined, // Remove plain text from stored data
        apiKey: undefined,
        apiSecret: undefined,
        position: sourceData.length,
        isActive: formattedGatewayData.isActive !== undefined ? formattedGatewayData.isActive : true,
        transactionFee: formattedGatewayData.transactionFee || 0,
        primaryCurrency: formattedGatewayData.currencyType || 'USD',
        supportedCurrencies: formattedGatewayData.supportedCurrencies || [formattedGatewayData.currencyType || 'USD'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transactionId // For atomic operation tracking
      };
      
      // Run automated currency display tests
      const currencyTests = runCurrencyDisplayTests({
        ...newGateway,
        accountNumber: plainAccountNumber,
        apiKey: plainApiKey,
        apiSecret: plainApiSecret
      });
      
      // Simulate atomic write operation
      sourceData.push(newGateway);
      updateIndexes(newGateway, 'CREATE');
      
      logAuditEvent('CREATE', newGateway.Id, formattedGatewayData.name, 'admin', {
        gatewayType: formattedGatewayData.gatewayType || 'Unknown',
        accountHolderName: formattedGatewayData.accountHolderName || 'Not specified',
        currencyType: formattedGatewayData.currencyType || 'USD',
        currencyFormatting: currencyTests.every(t => t.passed) ? 'valid' : 'failed',
        transactionId,
        fieldsValidated: requiredFields.length,
        encryptionApplied: true
      });
      
      logTransactionAttempt('CREATE_COMPLETE', newId, formattedGatewayData.name, true);
      
      // Return with original plain text data for UI display
      return { 
        ...newGateway, 
        accountNumber: plainAccountNumber,
        apiKey: plainApiKey,
        apiSecret: plainApiSecret,
        encryptedAccountNumber: undefined,
        encryptedApiKey: undefined,
        encryptedApiSecret: undefined
      };
    } catch (error) {
      logTransactionAttempt('CREATE_FAILED', null, gatewayData.name, false, error);
      throw error;
    }
  },

async update(id, gatewayData, userRole = null) {
    validateAdminRole(userRole);
    
    try {
      const transactionId = `tx_${Date.now()}`;
      logTransactionAttempt('UPDATE_START', parseInt(id), gatewayData.name, true);
      
      await delay(300);
      
      const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
      const index = sourceData.findIndex(g => g.Id === parseInt(id));
      if (index === -1) {
        throw new Error("Payment gateway not found");
      }
      
      const oldGateway = { ...sourceData[index] };
      
      // Apply financial data formatting middleware
      const formattedGatewayData = formatFinancialData(gatewayData);
      
      // Validate currency formatting if currency data is being updated
      if (formattedGatewayData.currencyType || formattedGatewayData.fees) {
        try {
          validateCurrencyFormatting(formattedGatewayData);
        } catch (currencyError) {
          logTransactionAttempt('UPDATE_FAILED', parseInt(id), gatewayData.name, false, currencyError);
          throw currencyError;
        }
      }
      
      // Validate unique constraints for updates (excluding current record)
      if (formattedGatewayData.name && formattedGatewayData.name !== oldGateway.name) {
        const duplicateName = sourceData.find(g => 
          g.Id !== parseInt(id) && 
          g.name.toLowerCase() === formattedGatewayData.name.toLowerCase()
        );
        if (duplicateName) {
          throw new Error(`Gateway name '${formattedGatewayData.name}' already exists`);
        }
      }

      // Currency validation
      const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];
      if (formattedGatewayData.currencyType && !supportedCurrencies.includes(formattedGatewayData.currencyType)) {
        throw new Error('Invalid currency type selected');
      }
      
      // Store plain text values for return object
      const plainAccountNumber = formattedGatewayData.accountNumber;
      const plainApiKey = formattedGatewayData.apiKey;
      const plainApiSecret = formattedGatewayData.apiSecret;
      
      // Encrypt sensitive data if provided
      const updateData = { ...formattedGatewayData };
      if (formattedGatewayData.accountNumber) {
        updateData.encryptedAccountNumber = encryptData(formattedGatewayData.accountNumber);
        updateData.accountNumber = undefined; // Remove plain text from stored data
      }
      if (formattedGatewayData.apiKey) {
        updateData.encryptedApiKey = encryptData(formattedGatewayData.apiKey);
        updateData.apiKey = undefined;
      }
      if (formattedGatewayData.apiSecret) {
        updateData.encryptedApiSecret = encryptData(formattedGatewayData.apiSecret);
        updateData.apiSecret = undefined;
      }
      if (formattedGatewayData.transactionFee !== undefined) {
        updateData.transactionFee = formattedGatewayData.transactionFee;
      }
      if (formattedGatewayData.currencyType) {
        updateData.primaryCurrency = formattedGatewayData.currencyType;
        updateData.supportedCurrencies = [formattedGatewayData.currencyType];
      }
      
      // Atomic update operation
      sourceData[index] = {
        ...sourceData[index],
        ...updateData,
        Id: parseInt(id), // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
        transactionId
      };
      
      updateIndexes(sourceData[index], 'UPDATE');
      
      // Run automated currency display tests on updated gateway
      const updatedGatewayForTesting = {
        ...sourceData[index],
        accountNumber: plainAccountNumber,
        apiKey: plainApiKey,
        apiSecret: plainApiSecret
      };
      const currencyTests = runCurrencyDisplayTests(updatedGatewayForTesting);
      
      logAuditEvent('UPDATE', parseInt(id), formattedGatewayData.name || oldGateway.name, 'admin', {
        changes: Object.keys(formattedGatewayData),
        oldValues: { 
          name: oldGateway.name, 
          isActive: oldGateway.isActive,
          merchantId: oldGateway.merchantId,
          primaryCurrency: oldGateway.primaryCurrency
        },
        currencyFormatting: currencyTests.every(t => t.passed) ? 'valid' : 'failed',
        transactionId
      });
      
      logTransactionAttempt('UPDATE_COMPLETE', parseInt(id), formattedGatewayData.name || oldGateway.name, true);
      
      // Return with decrypted data for display
      const updatedGateway = { ...sourceData[index] };
      if (updatedGateway.encryptedAccountNumber && plainAccountNumber) {
        updatedGateway.accountNumber = plainAccountNumber;
        updatedGateway.encryptedAccountNumber = undefined;
      } else if (updatedGateway.encryptedAccountNumber) {
        updatedGateway.accountNumber = decryptData(updatedGateway.encryptedAccountNumber);
        updatedGateway.encryptedAccountNumber = undefined;
      }
      if (updatedGateway.encryptedApiKey && plainApiKey) {
        updatedGateway.apiKey = plainApiKey;
        updatedGateway.encryptedApiKey = undefined;
      } else if (updatedGateway.encryptedApiKey) {
        updatedGateway.apiKey = decryptData(updatedGateway.encryptedApiKey);
        updatedGateway.encryptedApiKey = undefined;
      }
      if (updatedGateway.encryptedApiSecret && plainApiSecret) {
        updatedGateway.apiSecret = plainApiSecret;
        updatedGateway.encryptedApiSecret = undefined;
      } else if (updatedGateway.encryptedApiSecret) {
        updatedGateway.apiSecret = decryptData(updatedGateway.encryptedApiSecret);
        updatedGateway.encryptedApiSecret = undefined;
      }
      
      return updatedGateway;
    } catch (error) {
      logTransactionAttempt('UPDATE_FAILED', parseInt(id), gatewayData.name, false, error);
      throw error;
    }
  },

  async updateOrder(orderedIds, userRole = null) {
    validateAdminRole(userRole);
    await delay(300);
    
    const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
    
    orderedIds.forEach((id, index) => {
      const gateway = sourceData.find(g => g.Id === id);
      if (gateway) {
        gateway.position = index;
        gateway.updatedAt = new Date().toISOString();
      }
    });
    
    logAuditEvent('REORDER', null, 'Gateway Order', 'admin', {
      newOrder: orderedIds
    });
    
    return true;
  },

async delete(id, userRole = null) {
    validateAdminRole(userRole);
    
    try {
      const transactionId = `tx_${Date.now()}`;
      logTransactionAttempt('DELETE_START', parseInt(id), 'Unknown', true);
      
      await delay(300);
      const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
      const index = sourceData.findIndex(g => g.Id === parseInt(id));
      if (index === -1) {
        throw new Error("Payment gateway not found");
      }
      
      // Enhanced pre-deletion checks
      const gateway = sourceData[index];
      if (gateway.hasActiveTransactions) {
        throw new Error("Cannot delete gateway with active transactions");
      }
      
      // Check for dependent configurations
      if (gateway.isActive && sourceData.filter(g => g.isActive).length === 1) {
        throw new Error("Cannot delete the last active payment gateway");
      }
      
      // Atomic delete operation
      const deleted = sourceData.splice(index, 1)[0];
      updateIndexes(deleted, 'DELETE');
      
      logAuditEvent('DELETE', parseInt(id), deleted.name, 'admin', {
        gatewayType: deleted.gatewayType,
        wasActive: deleted.isActive,
        hadActiveTransactions: deleted.hasActiveTransactions,
        transactionId
      });
      
      logTransactionAttempt('DELETE_COMPLETE', parseInt(id), deleted.name, true);
      
      // Return with decrypted data if needed
      const decryptedDeleted = { ...deleted };
      if (deleted.encryptedAccountNumber) {
        decryptedDeleted.accountNumber = decryptData(deleted.encryptedAccountNumber);
        decryptedDeleted.encryptedAccountNumber = undefined;
      }
      if (deleted.encryptedApiKey) {
        decryptedDeleted.apiKey = decryptData(deleted.encryptedApiKey);
        decryptedDeleted.encryptedApiKey = undefined;
      }
      if (deleted.encryptedApiSecret) {
        decryptedDeleted.apiSecret = decryptData(deleted.encryptedApiSecret);
        decryptedDeleted.encryptedApiSecret = undefined;
      }
      
      return decryptedDeleted;
    } catch (error) {
      logTransactionAttempt('DELETE_FAILED', parseInt(id), 'Unknown', false, error);
      throw error;
    }
  },

async toggleStatus(id, userRole = null) {
    validateAdminRole(userRole);
    
    try {
      const transactionId = `tx_${Date.now()}`;
      logTransactionAttempt('TOGGLE_STATUS_START', parseInt(id), 'Unknown', true);
      
      await delay(200);
      const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
      const index = sourceData.findIndex(g => g.Id === parseInt(id));
      if (index === -1) {
        throw new Error("Payment gateway not found");
      }
      
      const gateway = sourceData[index];
      const oldStatus = gateway.isActive;
      
      // Business logic check: prevent disabling last active gateway
      if (oldStatus && sourceData.filter(g => g.isActive).length === 1) {
        throw new Error("Cannot disable the last active payment gateway");
      }
      
      // Atomic status update
      sourceData[index].isActive = !oldStatus;
      sourceData[index].updatedAt = new Date().toISOString();
      sourceData[index].transactionId = transactionId;
      
      updateIndexes(sourceData[index], 'UPDATE');
      
      logAuditEvent('TOGGLE_STATUS', parseInt(id), gateway.name, 'admin', {
        oldStatus,
        newStatus: sourceData[index].isActive,
        transactionId,
        businessRuleValidated: true
      });
      
      logTransactionAttempt('TOGGLE_STATUS_COMPLETE', parseInt(id), gateway.name, true);
      
      // Return with decrypted data for display
      const updatedGateway = { ...sourceData[index] };
      if (updatedGateway.encryptedAccountNumber) {
        updatedGateway.accountNumber = decryptData(updatedGateway.encryptedAccountNumber);
        updatedGateway.encryptedAccountNumber = undefined;
      }
      if (updatedGateway.encryptedApiKey) {
        updatedGateway.apiKey = decryptData(updatedGateway.encryptedApiKey);
        updatedGateway.encryptedApiKey = undefined;
      }
      if (updatedGateway.encryptedApiSecret) {
        updatedGateway.apiSecret = decryptData(updatedGateway.encryptedApiSecret);
        updatedGateway.encryptedApiSecret = undefined;
      }
      
      return updatedGateway;
    } catch (error) {
      logTransactionAttempt('TOGGLE_STATUS_FAILED', parseInt(id), 'Unknown', false, error);
      throw error;
    }
  },
// Enhanced testing mode management with error handling
  async enableTestingMode(userRole = null) {
    validateAdminRole(userRole);
    
    try {
      isTestingMode = true;
      testGateways.splice(0, testGateways.length, ...paymentGatewaysData.map(g => ({ ...g })));
      logAuditEvent('ENABLE_TESTING', null, 'Testing Mode', 'admin', {
        gatewayCopied: paymentGatewaysData.length,
        previousMode: 'PRODUCTION'
      });
      return true;
    } catch (error) {
      logTransactionAttempt('ENABLE_TESTING_FAILED', null, 'Testing Mode', false, error);
      throw new Error('Failed to enable testing mode: ' + error.message);
    }
  },
async disableTestingMode(userRole = null) {
    validateAdminRole(userRole);
    
    try {
      const testGatewayCount = testGateways.length;
      isTestingMode = false;
      testGateways.splice(0, testGateways.length);
      logAuditEvent('DISABLE_TESTING', null, 'Testing Mode', 'admin', {
        testGatewaysCleared: testGatewayCount,
        newMode: 'PRODUCTION'
      });
      return true;
    } catch (error) {
      logTransactionAttempt('DISABLE_TESTING_FAILED', null, 'Testing Mode', false, error);
      throw new Error('Failed to disable testing mode: ' + error.message);
    }
  },

  // Transaction Validation Suite
  async validateTransaction(transactionData, userRole = null) {
    validateAdminRole(userRole);
    await delay(800);
    
    const validation = {
      transactionId: transactionData.transactionId || `TXN${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'validating',
      results: {
        bankReference: null,
        timestamp: null,
        amount: null,
        thirdParty: null
      },
      overallStatus: 'pending',
      gatewayId: transactionData.gatewayId,
      orderId: transactionData.orderId
    };

    try {
      // Validate bank reference number
      const bankRefResult = await this.validateBankReference(
        transactionData.bankReference, 
        transactionData.gatewayId
      );
      validation.results.bankReference = bankRefResult;

      // Validate payment timestamp
      const timestampResult = await this.validateTimestamp(
        transactionData.paymentTimestamp,
        transactionData.orderTimestamp
      );
      validation.results.timestamp = timestampResult;

      // Validate amount matching
      const amountResult = await this.validateAmount(
        transactionData.paidAmount,
        transactionData.expectedAmount
      );
      validation.results.amount = amountResult;

      // Third-party processor validation
      const thirdPartyResult = await this.processThirdPartyValidation(
        transactionData.gatewayId,
        transactionData.transactionId,
        transactionData.bankReference
      );
      validation.results.thirdParty = thirdPartyResult;

      // Determine overall status
      const allPassed = Object.values(validation.results).every(result => 
        result && result.status === 'valid'
      );
      
      validation.overallStatus = allPassed ? 'valid' : 'invalid';
      validation.status = 'completed';

      logAuditEvent('VALIDATE_TRANSACTION', transactionData.gatewayId, 'Transaction Validation', 'admin', {
        transactionId: validation.transactionId,
        orderId: transactionData.orderId,
        overallStatus: validation.overallStatus,
        results: validation.results
      });

      return validation;

    } catch (error) {
      validation.status = 'error';
      validation.overallStatus = 'error';
      validation.error = error.message;
      
      logAuditEvent('VALIDATE_TRANSACTION_ERROR', transactionData.gatewayId, 'Transaction Validation', 'admin', {
        error: error.message,
        transactionId: validation.transactionId
      });
      
      return validation;
    }
  },

  async validateBankReference(bankReference, gatewayId) {
    await delay(300);
    
    const gateway = paymentGatewaysData.find(g => g.Id === parseInt(gatewayId));
    if (!gateway) {
      return {
        status: 'error',
        message: 'Gateway not found',
        details: null
      };
    }

    // Mock bank reference validation logic
    const referencePattern = gateway.gatewayType === 'Bank Account' ? 
      /^[A-Z]{2}\d{12}$/ : /^[A-Z0-9]{8,16}$/;
    
    const isFormatValid = referencePattern.test(bankReference);
    
    // Simulate random validation failure for demonstration
    const isVerified = isFormatValid && Math.random() > 0.2;
    
    return {
      status: isVerified ? 'valid' : 'invalid',
      message: isVerified ? 
        'Bank reference verified successfully' : 
        'Bank reference could not be verified',
      details: {
        reference: bankReference,
        gateway: gateway.name,
        formatValid: isFormatValid,
        verified: isVerified,
        verificationTime: new Date().toISOString()
      }
    };
  },

  async validateTimestamp(paymentTimestamp, orderTimestamp) {
    await delay(200);
    
    const paymentTime = new Date(paymentTimestamp);
    const orderTime = new Date(orderTimestamp);
    const timeDifferenceMs = paymentTime.getTime() - orderTime.getTime();
    const timeDifferenceMinutes = Math.abs(timeDifferenceMs) / (1000 * 60);
    
    // Payment should be within 24 hours of order creation
    const maxAllowedMinutes = 24 * 60;
    const isValidTiming = timeDifferenceMinutes <= maxAllowedMinutes;
    
    // Check if payment is after order (not before)
    const isLogicalOrder = timeDifferenceMs >= 0;
    
    const isValid = isValidTiming && isLogicalOrder;
    
    return {
      status: isValid ? 'valid' : 'invalid',
      message: isValid ? 
        'Payment timestamp is valid' : 
        'Payment timestamp validation failed',
      details: {
        paymentTime: paymentTimestamp,
        orderTime: orderTimestamp,
        timeDifferenceMinutes: Math.round(timeDifferenceMinutes),
        isValidTiming,
        isLogicalOrder,
        maxAllowedHours: 24
      }
    };
  },
async validateAmount(paidAmount, expectedAmount) {
await delay(150);
    
    const paid = parseFloat(paidAmount);
    const expected = parseFloat(expectedAmount);
    const difference = parseFloat(Math.abs(paid - expected).toFixed(2));
    const tolerance = 1.00; // Allow 1.00 PKR tolerance
    
    const isExactMatch = difference === 0;
    const isWithinTolerance = difference <= tolerance;
    const isValid = isWithinTolerance;
    
    // Currency verification for amount validation
    const currencyValidation = {
      decimalPlaces: paid.toString().includes('.') ? (paid.toString().split('.')[1] || '').length : 0,
      expectedDecimals: 2,
      formatValid: /^\d+(\.\d{2})?$/.test(paid.toString()) && /^\d+(\.\d{2})?$/.test(expected.toString())
    };
    
    return {
      status: isValid ? 'valid' : 'invalid',
      message: isValid ? 
        (isExactMatch ? 'Amount matches exactly' : 'Amount within acceptable tolerance') :
        'Amount mismatch detected',
      details: {
        paidAmount: parseFloat(paid.toFixed(2)),
        expectedAmount: parseFloat(expected.toFixed(2)),
        difference: difference,
        tolerance: tolerance,
        isExactMatch,
        isWithinTolerance,
        percentageDifference: expected > 0 ? parseFloat(((difference / expected) * 100).toFixed(2)) : 0,
        currencyValidation
      }
    };
  },

  async processThirdPartyValidation(gatewayId, transactionId, bankReference) {
    await delay(600);
    
    const gateway = paymentGatewaysData.find(g => g.Id === parseInt(gatewayId));
    if (!gateway) {
      return {
        status: 'error',
        message: 'Gateway not found for third-party validation',
        details: null
      };
    }

    // Mock third-party API integration
    const apiEndpoints = {
      'Bank Account': 'https://api.bankingsystem.pk/validate',
      'Mobile Wallet': 'https://api.mobilewallet.pk/verify',
      'Digital Wallet': 'https://api.digitalwallet.pk/check'
    };
    
    const endpoint = apiEndpoints[gateway.gatewayType] || 'https://api.generic.pk/validate';
    
    // Simulate API call success/failure
    const apiSuccess = Math.random() > 0.15; // 85% success rate
    const validationPassed = apiSuccess && Math.random() > 0.1; // 90% validation pass rate if API succeeds
    
    if (!apiSuccess) {
      return {
        status: 'error',
        message: 'Third-party API validation failed',
        details: {
          endpoint,
          transactionId,
          bankReference,
          errorCode: 'API_TIMEOUT',
          retryable: true
        }
      };
    }
    
    return {
      status: validationPassed ? 'valid' : 'invalid',
      message: validationPassed ? 
        'Third-party validation successful' : 
        'Third-party validation rejected transaction',
      details: {
        endpoint,
        transactionId,
        bankReference,
        gatewayType: gateway.gatewayType,
        validationId: `VAL${Date.now()}`,
        responseTime: Math.floor(Math.random() * 500) + 100,
        apiVersion: '2.1',
        validatedAt: new Date().toISOString()
      }
    };
  },

  // Get validation history
  async getValidationHistory(orderId = null, userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    
    // Filter audit log for validation events
    const validationEvents = auditLog.filter(log => 
      log.action === 'VALIDATE_TRANSACTION' && 
      (!orderId || log.details.orderId === orderId)
    );
    
    return validationEvents.map(event => ({
      id: event.id,
      orderId: event.details.orderId,
      transactionId: event.details.transactionId,
      timestamp: event.timestamp,
      status: event.details.overallStatus,
      results: event.details.results,
      userId: event.userId
    }));
  },

  // Get validation statistics
  async getValidationStatistics(userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    
    const validationEvents = auditLog.filter(log => log.action === 'VALIDATE_TRANSACTION');
    const total = validationEvents.length;
    const valid = validationEvents.filter(event => event.details.overallStatus === 'valid').length;
    const invalid = validationEvents.filter(event => event.details.overallStatus === 'invalid').length;
    const errors = validationEvents.filter(event => event.details.overallStatus === 'error').length;
    
    return {
      total,
      valid,
      invalid,
      errors,
      validPercentage: total > 0 ? ((valid / total) * 100).toFixed(1) : 0,
      invalidPercentage: total > 0 ? ((invalid / total) * 100).toFixed(1) : 0,
      errorPercentage: total > 0 ? ((errors / total) * 100).toFixed(1) : 0,
lastValidation: validationEvents.length > 0 ? 
        validationEvents[validationEvents.length - 1].timestamp : null
    };
  },

async toggleTestingMode(enabled, userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    
    isTestingMode = enabled;
    
    if (enabled && testGateways.length === 0) {
      // Initialize test data with comprehensive currency scenarios
      const testScenarios = [
        {
          Id: 1,
          name: "Test Gateway USD",
          accountHolderName: "Test Account USD",
          accountNumber: "TEST123456789",
          merchantId: "TEST_MERCHANT_001",
          apiKey: "test_api_key_12345",
          apiSecret: "test_secret_abcdef",
          currencyType: "USD",
          primaryCurrency: "USD",
          supportedCurrencies: ["USD"],
          fees: { transactionFee: 0.30, percentageFee: 2.9 },
          currencySymbol: "$"
        },
        {
          Id: 2,
          name: "Test Gateway EUR",
          accountHolderName: "Test Account EUR",
          accountNumber: "TEST123456790",
          merchantId: "TEST_MERCHANT_002",
          apiKey: "test_api_key_67890",
          apiSecret: "test_secret_ghijkl",
          currencyType: "EUR",
          primaryCurrency: "EUR",
          supportedCurrencies: ["EUR"],
          fees: { transactionFee: 0.25, percentageFee: 2.5 },
          currencySymbol: "€"
        },
        {
          Id: 3,
          name: "Test Gateway JPY",
          accountHolderName: "Test Account JPY",
          accountNumber: "TEST123456791",
          merchantId: "TEST_MERCHANT_003",
          apiKey: "test_api_key_11111",
          apiSecret: "test_secret_mnopqr",
          currencyType: "JPY",
          primaryCurrency: "JPY",
          supportedCurrencies: ["JPY"],
          fees: { transactionFee: 30, percentageFee: 3.0 }, // No decimals for JPY
          currencySymbol: "¥"
        }
      ];
      
      testScenarios.forEach(scenario => {
        const formattedScenario = formatFinancialData(scenario);
        const testGateway = {
          ...formattedScenario,
          encryptedAccountNumber: encryptData(scenario.accountNumber),
          encryptedApiKey: encryptData(scenario.apiKey),
          encryptedApiSecret: encryptData(scenario.apiSecret),
          gatewayType: "Test Bank",
          logoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
          isActive: true,
          position: scenario.Id - 1,
          transactionFee: scenario.fees.transactionFee,
          hasActiveTransactions: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        testGateways.push(testGateway);
        updateIndexes(testGateway, 'CREATE');
        
        // Run verification tests on each test gateway
        runCurrencyDisplayTests(testGateway);
      });
    }
    
    logAuditEvent('TESTING_MODE', null, 'System', 'admin', {
      enabled,
      testGatewaysCount: testGateways.length,
      verificationResults: verificationResults.length,
      timestamp: new Date().toISOString()
    });
    
    return isTestingMode;
  },

  // Get verification results for admin review
  async getVerificationResults(userRole = null) {
    validateAdminRole(userRole);
    await delay(100);
    
    return {
      results: verificationResults,
      summary: {
        totalTests: verificationResults.length,
        passedTests: verificationResults.filter(r => r.overallStatus === 'PASSED').length,
        failedTests: verificationResults.filter(r => r.overallStatus === 'FAILED').length,
        lastTestRun: verificationResults.length > 0 ? 
          verificationResults[verificationResults.length - 1].timestamp : null
      }
    };
  },

  // Clear verification results
  async clearVerificationResults(userRole = null) {
    validateAdminRole(userRole);
    await delay(50);
    
    verificationResults.length = 0;
    
    logAuditEvent('CLEAR_VERIFICATION', null, 'System', 'admin', {
      timestamp: new Date().toISOString()
    });
    
    return { cleared: true, timestamp: new Date().toISOString() };
  },

  async getTestingMode() {
    await delay(100);
    return isTestingMode;
  },

  // Get audit logs (admin only)
  async getAuditLogs(userRole = null) {
    validateAdminRole(userRole);
await delay(200);
    return [...auditLog].reverse(); // Most recent first
  },

  // Alias methods for backward compatibility
  async getAllGateways(userRole = null) {
    return this.getAll(userRole);
  },

  async createGateway(gatewayData, userRole = null) {
    return this.create(gatewayData, userRole);
  },

  async updateGateway(id, gatewayData, userRole = null) {
    return this.update(id, gatewayData, userRole);
  },

  async deleteGateway(id, userRole = null) {
    return this.delete(id, userRole);
  },

  async reorderGateways(orderedItems, userRole = null) {
    const orderedIds = orderedItems.map(item => item.id || item.Id);
    return this.updateOrder(orderedIds, userRole);
  },

  async setTestingMode(enabled, userRole = null) {
    return this.toggleTestingMode(enabled, userRole);
  }
};