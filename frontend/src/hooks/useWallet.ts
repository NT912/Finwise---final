import { useState } from "react";
import apiClient from "../services/apiClient";

export interface Wallet {
  _id: string;
  name: string;
  balance: number;
  icon: string;
  color?: string;
  isDefault: boolean;
  isIncludedInTotal: boolean;
}

export const useWallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/wallets");
      setWallets(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to fetch wallets");
      console.error("Error fetching wallets:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    wallets,
    loading,
    error,
    getWallets,
  };
};
