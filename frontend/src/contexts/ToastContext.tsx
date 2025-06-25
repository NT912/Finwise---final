import React, { createContext, useContext, useState, useCallback } from "react";
import CustomToast from "../components/common/CustomToast";

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    visible: boolean;
  }>({
    message: "",
    type: "info",
    visible: false,
  });

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      setToast({ message, type, visible: true });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
