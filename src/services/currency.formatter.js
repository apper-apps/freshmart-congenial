/**
 * Currency formatting service for Pakistani Rupees
 * Provides consistent currency display across the application
 */

export function formatPrice(amount) {
  const numAmount = parseFloat(amount) || 0;
  return `Rs ${numAmount.toLocaleString('en-PK', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export default {
  formatPrice
};