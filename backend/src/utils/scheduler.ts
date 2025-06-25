import { checkAndUpdateBudgetStatuses } from "../services/transactionService";
import { createLogger } from "./logger";

const logger = createLogger("Scheduler");

/**
 * Khởi tạo scheduler để chạy các tác vụ định kỳ
 */
export const initScheduler = () => {
  // Lập lịch cập nhật trạng thái ngân sách mỗi ngày vào lúc 00:00
  setupDailyBudgetStatusCheck();

  logger.info("Scheduler initialized successfully");
};

/**
 * Thiết lập cập nhật trạng thái ngân sách hàng ngày
 */
const setupDailyBudgetStatusCheck = () => {
  const runBudgetStatusCheck = async () => {
    try {
      logger.info("Running daily budget status check...");
      const result = await checkAndUpdateBudgetStatuses();
      logger.info("Budget status check completed", result);
    } catch (error) {
      logger.error("Error running budget status check:", error);
    }
  };

  // Tính thời gian đến 00:00 ngày mai
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

  // Lập lịch chạy lần đầu vào 00:00 ngày mai
  setTimeout(() => {
    runBudgetStatusCheck();

    // Sau đó, lập lịch chạy mỗi 24 giờ
    setInterval(runBudgetStatusCheck, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);

  logger.info(
    `Budget status check scheduled to run in ${Math.floor(
      timeUntilMidnight / (60 * 1000)
    )} minutes`
  );
};

/**
 * Chạy kiểm tra trạng thái ngân sách ngay lập tức
 */
export const runBudgetStatusCheckNow = async () => {
  try {
    logger.info("Running immediate budget status check...");
    const result = await checkAndUpdateBudgetStatuses();
    logger.info("Immediate budget status check completed", result);
    return result;
  } catch (error) {
    logger.error("Error running immediate budget status check:", error);
    throw error;
  }
};
