export interface Budget {
  _id: string;
  name: string;
  amount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  categories: string[];
  userId: string;
  walletId: string;
  isRecurring: boolean;
  status: "active" | "expired" | "completed" | "overbudget";
  notificationThreshold: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
