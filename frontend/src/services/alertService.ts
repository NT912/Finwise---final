import { Platform } from "react-native";

// Custom EventEmitter implementation for React Native
class EventEmitter {
  private events: Record<string, Array<Function>> = {};
  private maxListeners: number = 10;

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(...args));
  }

  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }
}

// Định nghĩa các kiểu dữ liệu
export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  showConfirmButton?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
}

// Tạo EventEmitter để quản lý sự kiện hiển thị/ẩn alert
const alertEventEmitter = new EventEmitter();

// Đặt giới hạn lớn hơn cho số lượng listeners
alertEventEmitter.setMaxListeners(20);

// Định nghĩa các sự kiện
const ALERT_EVENTS = {
  SHOW: "SHOW_ALERT",
  HIDE: "HIDE_ALERT",
};

// Service để hiển thị và ẩn alert
const alertService = {
  // Hiển thị thông báo
  show: (config: AlertConfig) => {
    alertEventEmitter.emit(ALERT_EVENTS.SHOW, config);
  },

  // Ẩn thông báo hiện tại
  hide: () => {
    alertEventEmitter.emit(ALERT_EVENTS.HIDE);
  },

  // Đăng ký listener cho sự kiện hiển thị
  onShow: (callback: (config: AlertConfig) => void) => {
    alertEventEmitter.on(ALERT_EVENTS.SHOW, callback);
    return () => alertEventEmitter.off(ALERT_EVENTS.SHOW, callback);
  },

  // Đăng ký listener cho sự kiện ẩn
  onHide: (callback: () => void) => {
    alertEventEmitter.on(ALERT_EVENTS.HIDE, callback);
    return () => alertEventEmitter.off(ALERT_EVENTS.HIDE, callback);
  },
};

// Các hàm tiện ích để hiển thị các loại thông báo cụ thể
export const showSuccess = (
  title: string,
  message: string,
  config: Partial<AlertConfig> = {}
) => {
  alertService.show({
    type: "success",
    title,
    message,
    ...config,
  });
};

export const showError = (
  title: string,
  message: string,
  config: Partial<AlertConfig> = {}
) => {
  alertService.show({
    type: "error",
    title,
    message,
    ...config,
  });
};

export const showWarning = (
  title: string,
  message: string,
  config: Partial<AlertConfig> = {}
) => {
  alertService.show({
    type: "warning",
    title,
    message,
    ...config,
  });
};

export const showInfo = (
  title: string,
  message: string,
  config: Partial<AlertConfig> = {}
) => {
  alertService.show({
    type: "info",
    title,
    message,
    ...config,
  });
};

export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  config: Partial<AlertConfig> = {}
) => {
  alertService.show({
    type: "info",
    title,
    message,
    showConfirmButton: true,
    showCancelButton: true,
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm,
    ...config,
  });
};

export default alertService;
