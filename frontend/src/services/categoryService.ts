import axios from "axios";
import { Category } from "../types/category";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";
import apiClient from "./apiClient";

// Fetch all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get("/api/categories");

    if (Array.isArray(response.data)) {
      console.log("Categories fetched successfully:", response.data.length);
      // Debug: Check if parent field exists in the first few items
      if (response.data.length > 0) {
        console.log(
          "Sample category data:",
          response.data.slice(0, 3).map((cat) => ({
            _id: cat._id,
            name: cat.name,
            parent: cat.parent,
          }))
        );
      }
      return response.data;
    }

    return response.data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Fetch categories by type (income/expense)
export const getCategoriesByType = async (
  type: string
): Promise<Category[]> => {
  try {
    const response = await apiClient.get(`/api/categories?type=${type}`);

    if (Array.isArray(response.data)) {
      console.log(`${type} categories fetched:`, response.data.length);

      // Thêm log chi tiết từng danh mục để debug
      console.log(
        "ALL CATEGORIES DATA:",
        JSON.stringify(response.data.slice(0, 10), null, 2)
      );

      // Log parent-child relationships for debugging
      const parents = response.data.filter((cat) => !cat.parent);
      const children = response.data.filter((cat) => cat.parent);

      console.log(
        `Categories breakdown - Parents: ${parents.length}, Children: ${children.length}`
      );

      // Kiểm tra kết nối giữa parent và children bằng cả ID và name
      const parentMap = new Map();
      parents.forEach((parent) => {
        parentMap.set(parent._id, parent.name);
      });

      // Kiểm tra từng child có liên kết đúng không
      children.forEach((child) => {
        const parentById = parents.find((p) => p._id === child.parent);
        const parentByName = parents.find((p) => p.name === child.parent);
        console.log(`Child: ${child.name}, Parent ID: ${child.parent}`);
        console.log(
          `  Found parent by ID: ${parentById ? parentById.name : "NOT FOUND"}`
        );
        console.log(
          `  Found parent by Name: ${
            parentByName ? parentByName.name : "NOT FOUND"
          }`
        );
      });

      // Log a sample of parents and their children for debugging
      if (parents.length > 0 && children.length > 0) {
        const sampleParent = parents[0];
        console.log(
          `Sample parent: ${sampleParent.name} (ID: ${sampleParent._id})`
        );

        const sampleParentChildren = children.filter(
          (child) => child.parent === sampleParent._id
        );
        console.log(
          `Children of ${sampleParent.name}: ${sampleParentChildren.length}`
        );

        if (sampleParentChildren.length > 0) {
          console.log(
            "Sample children:",
            sampleParentChildren
              .map((c) => `${c.name} (Parent ID: ${c.parent})`)
              .join(", ")
          );
        }

        // Thử kiểm tra child bằng tên parent
        const sampleParentChildrenByName = children.filter(
          (child) => child.parent === sampleParent.name
        );
        console.log(
          `Children of ${sampleParent.name} (by name): ${sampleParentChildrenByName.length}`
        );

        if (sampleParentChildrenByName.length > 0) {
          console.log(
            "Sample children by name:",
            sampleParentChildrenByName
              .map((c) => `${c.name} (Parent Name: ${c.parent})`)
              .join(", ")
          );
        }
      }

      return response.data;
    }

    return response.data.categories || [];
  } catch (error) {
    console.error(`Error fetching ${type} categories:`, error);
    return [];
  }
};

// Create a new category
export const createCategory = async (category: {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "debt_loan";
  parent?: string | null;
}): Promise<Category> => {
  try {
    // Chuyển đổi giá trị parent từ null sang undefined nếu cần
    const categoryToSend = {
      ...category,
      parent: category.parent || undefined,
    };

    console.log("Sending category to API:", categoryToSend);
    const response = await apiClient.post("/api/categories", categoryToSend);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (
  id: string,
  category: {
    name?: string;
    icon?: string;
    color?: string;
    budget?: number;
    rules?: { keyword: string; isEnabled: boolean }[];
  }
): Promise<Category> => {
  try {
    const response = await apiClient.put(`/api/categories/${id}`, category);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/categories/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Lấy thông tin danh mục theo ID
export const getCategoryById = async (
  categoryId: string
): Promise<Category> => {
  try {
    const response = await apiClient.get(`/api/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
};

export default {
  getAllCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
