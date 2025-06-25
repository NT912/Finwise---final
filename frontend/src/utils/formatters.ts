/**
 * Format a number as Vietnamese Dong (VND) currency
 * @param amount - The amount to format
 * @returns Formatted string with VND currency symbol
 */
export const formatVND = (amount: number | null | undefined): string => {
  // Handle null, undefined, or NaN inputs
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a numeric string with thousand separators according to Vietnamese locale
 * @param value - The value to format
 * @returns Formatted string with thousand separators
 */
export const formatNumberWithCommas = (value: string): string => {
  // Remove non-numeric characters and parse to number
  const numericValue = value.replace(/[^0-9]/g, "");

  // Format with thousands separators
  if (numericValue) {
    return new Intl.NumberFormat("vi-VN").format(parseInt(numericValue));
  }
  return "";
};

/**
 * Parse a formatted number string back to number
 * @param formattedValue - The formatted value to parse
 * @returns The parsed number
 */
export const parseFormattedNumber = (formattedValue: string): number => {
  // Remove all non-numeric characters
  const numericValue = formattedValue.replace(/[^0-9]/g, "");
  return parseInt(numericValue || "0");
};

/**
 * Format a date to localized string
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format a percentage value
 * @param value - The decimal value to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, "");
  return parseInt(numericValue || "0");
};
