/**
 * Utility functions for date handling
 */

/**
 * Format a date to a readable string (DD/MM/YYYY)
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

/**
 * Get the month name from a date
 * @param date The date to get the month from
 * @returns Month name
 */
export const getMonthName = (date: Date): string => {
  return date.toLocaleString("default", { month: "long" });
};

/**
 * Check if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Get the start and end of a month
 * @param date Date within the month
 * @returns Object with start and end dates
 */
export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  };
};

/**
 * Format a date as a relative time string (Today, Yesterday, etc)
 * @param date The date to format
 * @returns Relative date string
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();

  if (isSameDay(date, now)) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return formatDate(date);
};
