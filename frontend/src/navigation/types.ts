import { NavigatorScreenParams } from "@react-navigation/native";
import Wallet from "../screens/Wallet/WalletScreen";
import { User } from "../types";
import { Budget } from "../services/budgetService";
import { BudgetWithCategories } from "../screens/Budget/BudgetScreen";

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TransactionTab: NavigatorScreenParams<TransactionStackParamList>;
  BudgetTab: NavigatorScreenParams<BudgetStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type BudgetStackParamList = {
  BudgetMain: undefined;
  CreateBudget: undefined;
  EditBudget: {
    budgetId: string;
    budget?: BudgetWithCategories;
  };
  SelectCategory: {
    selectedCategoryId?: string;
    type: "income" | "expense";
    onSelectCategory?: (category: any) => void;
  };
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: any) => void;
  };
};

export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
  SecurityPin: { email: string };
  ResetPassword: { email: string; resetCode: string };
  TabNavigator: NavigatorScreenParams<TabParamList>;
  Categories: undefined;
  Security: undefined;
  ChangePin: undefined;
  TermsAndConditions: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  WalletScreen: {
    onSelectWallet?: (walletId: string) => void;
    selectedWalletId?: string;
    showAllWalletsOption?: boolean;
  };
  CreateWalletScreen: undefined;
  EditWalletScreen: { walletId: string };
  IncomeExpenseReportScreen: undefined;
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: any) => void;
  };
  SelectCategory: {
    selectedCategoryId?: string;
    type: "income" | "expense";
    onSelectCategory?: (category: any) => void;
  };
  CreateCategory: undefined;
  AddNote: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  AddTransaction: {
    preSelectedWalletId?: string;
  };
  WalletScreen: {
    onSelectWallet?: (walletId: string) => void;
    selectedWalletId?: string;
    showAllWalletsOption?: boolean;
  };
  CreateWalletScreen: undefined;
  EditWalletScreen: { walletId: string };
};

export type TransactionStackParamList = {
  Transaction: undefined;
  AddTransaction: {
    preSelectedWalletId?: string;
  };
  EditTransaction: {
    transactionId: string;
  };
  ReportPeriod: {
    report: any;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Security: undefined;
  Help: undefined;
  Terms: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  Logout: undefined;
};

export type SavingStackParamList = {
  Saving: undefined;
};

export type WalletStackParamList = {
  SelectWalletScreen: {
    onSelectWallet: (wallet: Wallet) => void;
    includeAddWallet?: boolean;
    walletIdsToExclude?: string[];
  };
  CreateWalletScreen: {
    onCreateWallet?: (wallet: Wallet) => void;
  };
  EditWalletScreen: {
    walletId: string;
  };
  ListWalletScreen: undefined;
};

export interface Wallet {
  _id: string;
  name: string;
  balance: number;
  icon: string;
  color?: string;
  isDefault: boolean;
  isIncludedInTotal: boolean;
}
