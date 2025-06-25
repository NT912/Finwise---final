import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";
import { API_URL } from "../config/config";
import axios from "axios";

// Define interfaces
export interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isIncludedInTotal: boolean;
  isDefault: boolean;
  userId: string;
  note?: string;
}

export interface WalletInput {
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isIncludedInTotal: boolean;
  isDefault: boolean;
  note?: string;
}

/**
 * Processes BSON data from the API into a standardized wallet object
 */
const processBsonData = (wallet: any): Wallet => {
  console.log(`🔍 Processing wallet raw data:`, JSON.stringify(wallet));

  // Handle ID format
  let id = wallet._id;
  if (typeof id === "object" && id.$oid) {
    id = id.$oid;
    console.log(
      `🔑 Extracted ObjectId: ${id} from`,
      JSON.stringify(wallet._id)
    );
  }

  // Handle balance format
  let balance = wallet.balance;
  console.log(
    `💲 Original balance type: ${typeof balance}, value:`,
    JSON.stringify(balance)
  );

  if (typeof balance === "object") {
    if (balance.$numberInt) {
      balance = parseInt(balance.$numberInt, 10);
      console.log(`💲 Parsed $numberInt: ${balance}`);
    } else if (balance.$numberDouble) {
      balance = parseFloat(balance.$numberDouble);
      console.log(`💲 Parsed $numberDouble: ${balance}`);
    } else if (balance.$numberLong) {
      balance = parseInt(balance.$numberLong, 10);
      console.log(`💲 Parsed $numberLong: ${balance}`);
    } else {
      // Nếu là object nhưng không có các trường đặc biệt, thử chuyển đổi thành chuỗi rồi parse
      balance = parseInt(String(balance), 10);
      console.log(`💲 Parsed from general object: ${balance}`);
    }
  } else if (typeof balance === "string") {
    balance = parseFloat(balance);
    console.log(`💲 Parsed from string: ${balance}`);
  }

  // Ensure balance is a number, default to 0 if NaN
  if (isNaN(balance)) {
    console.log(`⚠️ Invalid balance value, defaulting to 0`);
    balance = 0;
  }

  // Handle boolean values
  let isIncludedInTotal = wallet.isIncludedInTotal;
  console.log(
    `🔘 Original isIncludedInTotal:`,
    JSON.stringify(isIncludedInTotal)
  );

  if (typeof isIncludedInTotal === "object") {
    if (isIncludedInTotal.$numberInt !== undefined) {
      isIncludedInTotal = Boolean(parseInt(isIncludedInTotal.$numberInt, 10));
      console.log(
        `🔘 Parsed isIncludedInTotal from $numberInt: ${isIncludedInTotal}`
      );
    } else if (isIncludedInTotal.$numberBoolean !== undefined) {
      isIncludedInTotal = Boolean(isIncludedInTotal.$numberBoolean);
      console.log(
        `🔘 Parsed isIncludedInTotal from $numberBoolean: ${isIncludedInTotal}`
      );
    }
  } else if (typeof isIncludedInTotal === "number") {
    isIncludedInTotal = Boolean(isIncludedInTotal);
    console.log(
      `🔘 Converted isIncludedInTotal from number: ${isIncludedInTotal}`
    );
  }

  let isDefault = wallet.isDefault;
  console.log(`🔘 Original isDefault:`, JSON.stringify(isDefault));

  if (typeof isDefault === "object") {
    if (isDefault.$numberInt !== undefined) {
      isDefault = Boolean(parseInt(isDefault.$numberInt, 10));
      console.log(`🔘 Parsed isDefault from $numberInt: ${isDefault}`);
    } else if (isDefault.$numberBoolean !== undefined) {
      isDefault = Boolean(isDefault.$numberBoolean);
      console.log(`🔘 Parsed isDefault from $numberBoolean: ${isDefault}`);
    }
  } else if (typeof isDefault === "number") {
    isDefault = Boolean(isDefault);
    console.log(`🔘 Converted isDefault from number: ${isDefault}`);
  }

  // Return normalized wallet object
  const processed = {
    _id: id,
    name: wallet.name || "Unnamed Wallet",
    balance: typeof balance === "number" ? balance : 0,
    currency: wallet.currency || "VND",
    icon: wallet.icon || "wallet-outline",
    color: wallet.color || "#4CAF50",
    isIncludedInTotal:
      typeof isIncludedInTotal === "boolean" ? isIncludedInTotal : true,
    isDefault: typeof isDefault === "boolean" ? isDefault : false,
    userId: wallet.userId || "",
    note: wallet.note || "",
  };

  console.log(`✅ Final processed wallet:`, JSON.stringify(processed));
  return processed;
};

/**
 * Fetches all wallets from the API
 */
export const fetchWallets = async (): Promise<Wallet[]> => {
  try {
    // Log thông tin token và user
    const token = await AsyncStorage.getItem("token");
    const userStr = await AsyncStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    console.log("\n🔍 DEBUG INFORMATION:");
    console.log("------------------------");
    console.log("1. Authentication:");
    console.log(
      "- Token:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );
    console.log("- User:", user ? `ID: ${user._id}` : "No user data");
    console.log("------------------------");

    console.log("2. Request Details:");
    console.log(`- Base URL: ${API_URL}`);
    console.log("- Endpoint: /api/wallets");
    console.log("- Method: GET");
    console.log("- Headers:", {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
    console.log("------------------------");

    // Gọi API
    const response = await apiClient.get("/api/wallets", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("3. Response Details:");
    console.log("- Status:", response.status);
    console.log("- Status Text:", response.statusText);
    console.log("- Headers:", response.headers);
    console.log("- Data:", JSON.stringify(response.data, null, 2));
    console.log("------------------------");

    // Xử lý response data
    const responseData = response.data;

    if (Array.isArray(responseData)) {
      console.log("4. Data Processing:");
      console.log(`- Array length: ${responseData.length}`);

      if (responseData.length === 0) {
        console.log("- No wallets found in response");
        return [];
      }

      // Xử lý từng ví
      const processedWallets = responseData.map((wallet, index) => {
        console.log(`\n- Processing wallet ${index + 1}:`);
        console.log("  Input:", JSON.stringify(wallet, null, 2));

        // Sử dụng processBsonData thay vì xử lý thủ công
        const processedWallet = processBsonData(wallet);

        console.log("  Output:", JSON.stringify(processedWallet, null, 2));
        return processedWallet;
      });

      console.log("\n5. Final Results:");
      console.log(`- Total wallets: ${processedWallets.length}`);
      console.log(
        `- Total balance: ${processedWallets.reduce(
          (sum, w) => sum + w.balance,
          0
        )}`
      );
      console.log(
        `- Included wallets: ${
          processedWallets.filter((w) => w.isIncludedInTotal).length
        }`
      );
      console.log(
        `- Default wallets: ${
          processedWallets.filter((w) => w.isDefault).length
        }`
      );
      console.log("------------------------\n");

      return processedWallets;
    }

    console.error("❌ Invalid response format:");
    console.error("- Expected: Array");
    console.error("- Received:", typeof responseData);
    console.error("- Data:", JSON.stringify(responseData, null, 2));
    return [];
  } catch (error: any) {
    console.error("\n❌ ERROR DETAILS:");
    console.error("------------------------");
    console.error("- Message:", error.message);
    console.error("- Status:", error.response?.status);
    console.error("- Response data:", error.response?.data);
    if (error.config) {
      console.error("- Request URL:", error.config.url);
      console.error("- Request method:", error.config.method);
      console.error("- Request headers:", error.config.headers);
    }
    console.error("------------------------\n");
    return [];
  }
};

/**
 * Fetches the total balance of all wallets
 */
export const fetchTotalBalance = async (): Promise<number> => {
  try {
    const response = await apiClient.get("/api/wallets/total-balance");

    // Process BSON data for total
    let total = response.data.total;
    if (typeof total === "object") {
      if (total.$numberInt) {
        total = parseInt(total.$numberInt, 10);
      } else if (total.$numberDouble) {
        total = parseFloat(total.$numberDouble);
      }
    }

    return typeof total === "number" ? total : 0;
  } catch (error) {
    console.error("❌ Error fetching total balance:", error);
    return 0;
  }
};

/**
 * Creates a new wallet
 */
export const createWallet = async (
  walletData: Omit<Wallet, "_id" | "userId">
): Promise<Wallet> => {
  try {
    console.log("🔄 Creating wallet with data:", JSON.stringify(walletData));

    // Kiểm tra dữ liệu đầu vào
    if (!walletData.name) {
      console.error("❌ Wallet name is required");
      throw new Error("Wallet name is required");
    }

    if (typeof walletData.balance !== "number") {
      console.warn(
        "⚠️ Balance is not a number, converting:",
        walletData.balance
      );
      walletData.balance = Number(walletData.balance) || 0;
    }

    console.log(
      "📤 Sending wallet creation request to API endpoint /api/wallets"
    );
    const response = await apiClient.post("/api/wallets", walletData);

    console.log("📥 Received response:", {
      status: response.status,
      statusText: response.statusText,
      data: typeof response.data,
    });

    console.log("📦 Raw response data:", JSON.stringify(response.data));

    // Process the response
    const newWallet = processBsonData(response.data);
    console.log("✅ Wallet created successfully:", JSON.stringify(newWallet));

    return newWallet;
  } catch (error: any) {
    console.error("❌ Error creating wallet:", error);

    // Log additional error details
    if (error.response) {
      console.error("❌ Response status:", error.response.status);
      console.error("❌ Response data:", JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error("❌ No response received from server");
    } else {
      console.error("❌ Error message:", error.message);
    }

    throw error;
  }
};

/**
 * Updates an existing wallet
 */
export const updateWallet = async (
  id: string,
  walletData: Partial<Wallet>
): Promise<Wallet> => {
  try {
    console.log(`🔄 Updating wallet ${id}:`, JSON.stringify(walletData));
    const response = await apiClient.put(`/api/wallets/${id}`, walletData);

    console.log("✅ Wallet updated successfully");
    return processBsonData(response.data);
  } catch (error) {
    console.error(`❌ Error updating wallet ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a wallet
 */
export const deleteWallet = async (id: string): Promise<void> => {
  try {
    console.log(`🔄 Deleting wallet ${id}`);
    await apiClient.delete(`/api/wallets/${id}`);
    console.log(`✅ Wallet ${id} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting wallet ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches a single wallet by ID
 */
export const getWalletById = async (id: string): Promise<Wallet> => {
  try {
    const token = await AsyncStorage.getItem("token");

    console.log(`🔍 Fetching wallet with ID: ${id}`);

    const response = await apiClient.get(`/api/wallets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "✅ Wallet fetched successfully:",
      JSON.stringify(response.data, null, 2)
    );

    return processBsonData(response.data);
  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    throw error;
  }
};
