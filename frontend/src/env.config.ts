// Cấu hình IP tĩnh - đây là file phải thay đổi khi muốn thay đổi địa chỉ API
export const API_CONFIG = {
  SERVER_IP: "192.168.2.15",
  API_PORT: 3002,
  get API_URL() {
    return `http://${this.SERVER_IP}:${this.API_PORT}`;
  },
};

// Log để debug
console.log("🔧 ENV CONFIG: API URL được thiết lập tĩnh:", API_CONFIG.API_URL);
