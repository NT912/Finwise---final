export type IconName =
  | "home-outline"
  | "stats-chart-outline"
  | "card-outline"
  | "person-outline"
  | "settings-outline"
  | "wallet-outline"
  | "cash-outline"
  | "add-outline"
  | "remove-outline"
  | "restaurant-outline"
  | "bus-outline"
  | "medical-outline"
  | "basket-outline"
  | "gift-outline"
  | "ticket-outline"
  | "trophy-outline"
  | "trending-up-outline"
  | "analytics-outline"
  | "cart-outline"
  | "airplane-outline"
  | "bag-outline"
  | "barbell-outline"
  | "bed-outline"
  | "bonfire-outline"
  | "book-outline"
  | "briefcase-outline"
  | "build-outline"
  | "cafe-outline"
  | "car-outline"
  | "cut-outline"
  | "film-outline"
  | "fitness-outline"
  | "flash-outline"
  | "flower-outline"
  | "game-controller-outline"
  | "happy-outline"
  | "heart-outline"
  | "laptop-outline"
  | "list-outline"
  | "people-outline"
  | "pizza-outline"
  | "pricetag-outline"
  | "school-outline"
  | "fast-food-outline"
  | "desktop-outline"
  | "wifi-outline"
  | "musical-note-outline"
  | "globe-outline"
  | "pin-outline"
  | "subway-outline"
  | "bicycle-outline"
  | "color-palette-outline"
  | "hammer-outline"
  | "glasses-outline"
  | "umbrella-outline"
  | "alarm-outline"
  | "receipt-outline"
  | "cube-outline"
  | "document-outline"
  | "paw-outline"
  | "shirt-outline"
  | "phone-portrait-outline";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  totalBalance?: number;
  notifications?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  accountStatus?: "active" | "deactivated";
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id: string;
  title?: string;
  description: string;
  amount: number;
  date: string;
  type: "expense" | "income" | "transfer";
  category: {
    _id: string;
    name: string;
    icon: IconName;
    color: string;
    type?: "expense" | "income";
    userId?: string;
  };
  walletId: string;
  toWalletId?: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  note?: string;
  attachments?: string[];
  isRecurring?: boolean;
  recurringDetails?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
}
