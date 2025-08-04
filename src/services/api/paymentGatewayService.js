import paymentGatewaysData from "@/services/mockData/paymentGateways.json";
import CryptoJS from "crypto-js";
import React from "react";
import Error from "@/components/ui/Error";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Encryption utilities
const ENCRYPTION_KEY = "FreshMart-Gateway-Secret-Key-2024";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};
// Audit logging
const auditLog = [];

// Testing mode state
let isTestingMode = false;
const testGateways = [];

const logAuditEvent = (action, gatewayId, gatewayName, userId = 'admin', details = {}) => {
  const logEntry = {
    id: auditLog.length + 1,
    timestamp: new Date().toISOString(),
    userId,
    action,
    gatewayId,
    gatewayName,
    details,
    ipAddress: '127.0.0.1' // Simulated
  };
  auditLog.push(logEntry);
  console.log('Audit Log:', logEntry);
};

// Role validation
const validateAdminRole = (userRole) => {
  if (!userRole || userRole !== 'admin') {
    throw new Error("Access denied. Admin privileges required.");
  }
};

export const paymentGatewayService = {
async getAll(userRole = null) {
    validateAdminRole(userRole);
    await delay(300);
    
    const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
    const gateways = [...sourceData].map(gateway => ({
      ...gateway,
      accountNumber: gateway.encryptedAccountNumber ? 
        decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
        gateway.accountNumber
    }));
    
    logAuditEvent('VIEW_ALL', null, 'All Gateways', 'admin');
    return gateways.sort((a, b) => (a.position || 0) - (b.position || 0));
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
    await delay(500);
    
    const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
    
    // Generate new ID
    const maxId = Math.max(...sourceData.map(g => g.Id), 0);
    
    // Encrypt account number
    const encryptedAccountNumber = encryptData(gatewayData.accountNumber);
    
    const newGateway = {
...gatewayData,
      Id: maxId + 1,
      encryptedAccountNumber,
      accountNumber: undefined, // Remove plain text
      position: sourceData.length,
      isActive: gatewayData.isActive !== undefined ? gatewayData.isActive : true,
      transactionFee: gatewayData.transactionFee || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    paymentGatewaysData.push(newGateway);
    
    logAuditEvent('CREATE', newGateway.Id, gatewayData.name, 'admin', {
      gatewayType: gatewayData.gatewayType,
      accountHolderName: gatewayData.accountHolderName
    });
    
    // Return with decrypted account number for display
    return { 
      ...newGateway, 
      accountNumber: gatewayData.accountNumber,
      encryptedAccountNumber: undefined 
    };
  },

async update(id, gatewayData, userRole = null) {
    validateAdminRole(userRole);
    await delay(300);
    
    const sourceData = isTestingMode ? testGateways : paymentGatewaysData;
    const index = sourceData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    const oldGateway = { ...sourceData[index] };
    
    // Encrypt account number if provided
const updateData = { ...gatewayData };
    if (gatewayData.accountNumber) {
      updateData.encryptedAccountNumber = encryptData(gatewayData.accountNumber);
      updateData.accountNumber = undefined; // Remove plain text
    }
    if (gatewayData.transactionFee !== undefined) {
      updateData.transactionFee = gatewayData.transactionFee;
    }
    
    sourceData[index] = {
      ...sourceData[index],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    logAuditEvent('UPDATE', parseInt(id), gatewayData.name || oldGateway.name, 'admin', {
      changes: Object.keys(gatewayData),
      oldValues: { name: oldGateway.name, isActive: oldGateway.isActive }
    });
    
    // Return with decrypted account number for display
    const updatedGateway = { ...sourceData[index] };
    if (updatedGateway.encryptedAccountNumber) {
      updatedGateway.accountNumber = decryptData(updatedGateway.encryptedAccountNumber);
      updatedGateway.encryptedAccountNumber = undefined;
    }
    
    return updatedGateway;
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
    await delay(300);
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    // Check if gateway has active transactions (simulated check)
    const gateway = paymentGatewaysData[index];
    if (gateway.hasActiveTransactions) {
      throw new Error("Cannot delete gateway with active transactions");
    }
    
    const deleted = paymentGatewaysData.splice(index, 1)[0];
    
    logAuditEvent('DELETE', parseInt(id), deleted.name, 'admin', {
      gatewayType: deleted.gatewayType,
      wasActive: deleted.isActive
    });
    
    // Return with decrypted account number if needed
    const decryptedDeleted = { ...deleted };
    if (deleted.encryptedAccountNumber) {
      decryptedDeleted.accountNumber = decryptData(deleted.encryptedAccountNumber);
      decryptedDeleted.encryptedAccountNumber = undefined;
    }
    
    return decryptedDeleted;
  },

async toggleStatus(id, userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    const oldStatus = paymentGatewaysData[index].isActive;
    paymentGatewaysData[index].isActive = !paymentGatewaysData[index].isActive;
    paymentGatewaysData[index].updatedAt = new Date().toISOString();
    
    logAuditEvent('TOGGLE_STATUS', parseInt(id), paymentGatewaysData[index].name, 'admin', {
      oldStatus,
      newStatus: paymentGatewaysData[index].isActive
    });
    
    // Return with decrypted account number for display
    const updatedGateway = { ...paymentGatewaysData[index] };
    if (updatedGateway.encryptedAccountNumber) {
      updatedGateway.accountNumber = decryptData(updatedGateway.encryptedAccountNumber);
      updatedGateway.encryptedAccountNumber = undefined;
    }
    
    return updatedGateway;
  },
// Testing mode management
  async enableTestingMode(userRole = null) {
    validateAdminRole(userRole);
    isTestingMode = true;
    testGateways.splice(0, testGateways.length, ...paymentGatewaysData.map(g => ({ ...g })));
    logAuditEvent('ENABLE_TESTING', null, 'Testing Mode', 'admin');
    return true;
  },

  async disableTestingMode(userRole = null) {
    validateAdminRole(userRole);
    isTestingMode = false;
    testGateways.splice(0, testGateways.length);
    logAuditEvent('DISABLE_TESTING', null, 'Testing Mode', 'admin');
    return true;
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
    const difference = Math.abs(paid - expected);
    const tolerance = 1.0; // Allow 1 unit tolerance
    
    const isExactMatch = difference === 0;
    const isWithinTolerance = difference <= tolerance;
    const isValid = isWithinTolerance;
    
    return {
      status: isValid ? 'valid' : 'invalid',
      message: isValid ? 
        (isExactMatch ? 'Amount matches exactly' : 'Amount within acceptable tolerance') :
        'Amount mismatch detected',
      details: {
        paidAmount: paid,
        expectedAmount: expected,
        difference: difference,
        tolerance: tolerance,
        isExactMatch,
        isWithinTolerance,
        percentageDifference: expected > 0 ? ((difference / expected) * 100).toFixed(2) : 0
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
      // Initialize test data
testGateways.push(
        {
          Id: 1,
          name: "Test Gateway",
          accountHolderName: "Test Account",
          accountNumber: "TEST123456789",
          gatewayType: "Test Bank",
          logoUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
          isActive: true,
          position: 0,
          transactionFee: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    }
    
    logAuditEvent('TESTING_MODE', null, 'System', 'admin', {
      enabled,
      timestamp: new Date().toISOString()
    });
    
    return isTestingMode;
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
  }
};