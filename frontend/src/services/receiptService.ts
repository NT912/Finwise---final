import api from "./apiService";

// Scan hoá đơn
export const scanReceipt = async (formData: FormData) => {
  try {
    const response = await api.post("/api/ocr/scan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
