/**
 * Standard color palette for categories in the application
 */
export const CATEGORY_COLORS = {
  // Core colors
  primary: "#00D09E",
  secondary: "#63B0FF",
  accent: "#00D09E",

  // Category specific colors
  food: "#63B0FF",
  transport: "#63B0FF",
  shopping: "#63B0FF",
  entertainment: "#63B0FF",
  bills: "#63B0FF",
  health: "#63B0FF",
  education: "#63B0FF",
  travel: "#63B0FF",
  housing: "#63B0FF",
  personal: "#63B0FF",
  gifts: "#63B0FF",
  salary: "#63B0FF",

  // Status colors
  success: "#00D09E",
  warning: "#FFD700",
  error: "#FF6B6B",
};

/**
 * Get color for a specific category by name
 * @param categoryName - The name of the category
 * @returns The color associated with the category or default primary color
 */
export const getCategoryColor = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase();

  // Map category names to our color palette
  if (
    normalizedName.includes("food") ||
    normalizedName.includes("grocery") ||
    normalizedName.includes("restaurant")
  ) {
    return CATEGORY_COLORS.food;
  }

  if (
    normalizedName.includes("transport") ||
    normalizedName.includes("travel") ||
    normalizedName.includes("car") ||
    normalizedName.includes("gas")
  ) {
    return CATEGORY_COLORS.transport;
  }

  if (
    normalizedName.includes("shopping") ||
    normalizedName.includes("clothes")
  ) {
    return CATEGORY_COLORS.shopping;
  }

  if (
    normalizedName.includes("entertainment") ||
    normalizedName.includes("fun") ||
    normalizedName.includes("game")
  ) {
    return CATEGORY_COLORS.entertainment;
  }

  if (
    normalizedName.includes("bill") ||
    normalizedName.includes("utility") ||
    normalizedName.includes("subscription")
  ) {
    return CATEGORY_COLORS.bills;
  }

  if (
    normalizedName.includes("health") ||
    normalizedName.includes("medical") ||
    normalizedName.includes("doctor")
  ) {
    return CATEGORY_COLORS.health;
  }

  if (
    normalizedName.includes("education") ||
    normalizedName.includes("school") ||
    normalizedName.includes("tuition")
  ) {
    return CATEGORY_COLORS.education;
  }

  if (
    normalizedName.includes("housing") ||
    normalizedName.includes("rent") ||
    normalizedName.includes("mortgage")
  ) {
    return CATEGORY_COLORS.housing;
  }

  if (
    normalizedName.includes("salary") ||
    normalizedName.includes("income") ||
    normalizedName.includes("wage")
  ) {
    return CATEGORY_COLORS.salary;
  }

  // Default to primary color
  return CATEGORY_COLORS.primary;
};

/**
 * Get an appropriate icon background and text color based on a category's main color
 * @param mainColor - The main color of the category
 * @returns Object with background and text colors
 */
export const getCategoryColorScheme = (mainColor: string) => {
  return {
    backgroundColor: mainColor,
    iconBackgroundColor: "#00D09E",
    textColor: "#FFFFFF",
  };
};
