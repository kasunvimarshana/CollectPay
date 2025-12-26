/**
 * Utility functions for formatting data in the TrackVault application
 */

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Dec 25, 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format a number as currency amount
 * @param amount - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted amount string (e.g., "5460.00")
 */
export const formatAmount = (amount: number, decimals: number = 2): string => {
  return amount.toFixed(decimals);
};

/**
 * Format a number as currency with symbol
 * @param amount - Number to format
 * @param currency - Currency symbol (default: "Rs.")
 * @returns Formatted currency string (e.g., "Rs. 5460.00")
 */
export const formatCurrency = (amount: number, currency: string = 'Rs.'): string => {
  return `${currency} ${formatAmount(amount)}`;
};

/**
 * Format a Date object to YYYY-MM-DD string
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "2025-12-26")
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
