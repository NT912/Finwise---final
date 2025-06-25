import React, { createContext, useContext } from "react";
import Toast from "react-native-toast-message";
import { toastConfigMap, showToast, ToastType } from "../utils/toast";

// Tạo context cho Toast
interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Hook để sử dụng Toast từ các components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

type ToastProviderProps = {
  children: React.ReactNode;
};

/**
 * Component cung cấp hệ thống Toast thông báo cho toàn bộ ứng dụng
 * Cần được đặt ở mức cao nhất của ứng dụng (thường là App.tsx)
 */
const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  // Hàm hiển thị Toast sử dụng hàm từ utils/toast.tsx
  const handleShowToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000
  ) => {
    showToast(type, message, undefined, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast: handleShowToast }}>
      {children}
      <Toast config={toastConfigMap} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
