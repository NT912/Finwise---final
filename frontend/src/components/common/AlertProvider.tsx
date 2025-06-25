import React, { useState, useEffect } from "react";
import alertService, { AlertConfig } from "../../services/alertService";
import CustomAlert from "./CustomAlert";

interface AlertState extends AlertConfig {
  visible: boolean;
}

const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    // Đăng ký các listeners khi component được mount
    const removeShowListener = alertService.onShow((config: AlertConfig) => {
      setAlert({
        ...config,
        visible: true,
      });
    });

    const removeHideListener = alertService.onHide(() => {
      setAlert((prevAlert) =>
        prevAlert ? { ...prevAlert, visible: false } : null
      );
    });

    // Hủy đăng ký các listeners khi component unmount
    return () => {
      removeShowListener();
      removeHideListener();
    };
  }, []);

  const handleClose = () => {
    setAlert((prevAlert) =>
      prevAlert ? { ...prevAlert, visible: false } : null
    );
  };

  return (
    <>
      {children}

      {alert && (
        <CustomAlert
          visible={alert.visible}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={handleClose}
          duration={alert.duration}
          showConfirmButton={alert.showConfirmButton}
          confirmText={alert.confirmText}
          onConfirm={alert.onConfirm}
          showCancelButton={alert.showCancelButton}
          cancelText={alert.cancelText}
        />
      )}
    </>
  );
};

export default AlertProvider;
