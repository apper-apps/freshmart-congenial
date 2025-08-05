/**
 * Currency formatting service for Pakistani Rupees
 * Provides consistent currency display across the application
 */

export function formatPrice(amount) {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

export default {
  formatPrice
};