import paymentGatewaysData from "@/services/mockData/paymentGateways.json";
import CryptoJS from "crypto-js";

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
    
    const gateways = [...paymentGatewaysData].map(gateway => ({
      ...gateway,
      accountNumber: gateway.encryptedAccountNumber ? 
        decryptData(gateway.encryptedAccountNumber) || gateway.accountNumber :
        gateway.accountNumber
    }));
    
    logAuditEvent('VIEW_ALL', null, 'All Gateways', 'admin');
    return gateways.sort((a, b) => a.name.localeCompare(b.name));
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
    
    // Generate new ID
    const maxId = Math.max(...paymentGatewaysData.map(g => g.Id), 0);
    
    // Encrypt account number
    const encryptedAccountNumber = encryptData(gatewayData.accountNumber);
    
    const newGateway = {
      ...gatewayData,
      Id: maxId + 1,
      encryptedAccountNumber,
      accountNumber: undefined, // Remove plain text
      isActive: gatewayData.isActive !== undefined ? gatewayData.isActive : true,
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
    const index = paymentGatewaysData.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Payment gateway not found");
    }
    
    const oldGateway = { ...paymentGatewaysData[index] };
    
    // Encrypt account number if provided
    const updateData = { ...gatewayData };
    if (gatewayData.accountNumber) {
      updateData.encryptedAccountNumber = encryptData(gatewayData.accountNumber);
      updateData.accountNumber = undefined; // Remove plain text
    }
    
    paymentGatewaysData[index] = {
      ...paymentGatewaysData[index],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    logAuditEvent('UPDATE', parseInt(id), gatewayData.name || oldGateway.name, 'admin', {
      changes: Object.keys(gatewayData),
      oldValues: { name: oldGateway.name, isActive: oldGateway.isActive }
    });
    
    // Return with decrypted account number for display
    const updatedGateway = { ...paymentGatewaysData[index] };
    if (updatedGateway.encryptedAccountNumber) {
      updatedGateway.accountNumber = decryptData(updatedGateway.encryptedAccountNumber);
      updatedGateway.encryptedAccountNumber = undefined;
    }
    
    return updatedGateway;
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

  // Get audit logs (admin only)
  async getAuditLogs(userRole = null) {
    validateAdminRole(userRole);
    await delay(200);
    return [...auditLog].reverse(); // Most recent first
  }
};