/**
 * Tạm thời sử dụng console.log thay vì winston
 * @param moduleName Tên module để hiển thị trong logs
 * @returns Logger object
 */
export const createLogger = (moduleName: string) => {
  return {
    info: (...args: any[]) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${moduleName}] INFO:`, ...args);
    },
    error: (...args: any[]) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] [${moduleName}] ERROR:`, ...args);
    },
    warn: (...args: any[]) => {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] [${moduleName}] WARN:`, ...args);
    },
    debug: (...args: any[]) => {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] [${moduleName}] DEBUG:`, ...args);
    },
  };
};
