import { useState } from "react";
import apiClient from "../services/apiClient";

export interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  parentId?: string;
  userId?: string;
}

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCategories = async (type?: "income" | "expense") => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/categories", {
        params: { type },
      });
      setCategories(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: string) => {
    try {
      const response = await apiClient.get(`/api/categories/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching category:", err);
      throw err;
    }
  };

  const createCategory = async (data: {
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
    parentId?: string;
  }) => {
    try {
      const response = await apiClient.post("/api/categories", data);
      return response.data;
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    data: {
      name?: string;
      type?: "income" | "expense";
      icon?: string;
      color?: string;
      parentId?: string;
    }
  ) => {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, data);
      return response.data;
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
