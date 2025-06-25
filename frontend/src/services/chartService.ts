import api from "./apiService";

// Lấy dữ liệu biểu đồ thu nhập - chi tiêu
export const fetchChartData = async () => {
  try {
    const response = await api.get("/api/charts");
    return response.data;
  } catch (error) {
    throw error;
  }
};
