import mongoose from "mongoose";
import { createLogger } from "./logger";

const logger = createLogger("IdUtils");

/**
 * Chuyển đổi ID sang đối tượng ObjectId, nếu không phải thì trả về null
 * @param id - ID cần kiểm tra và chuyển đổi
 * @returns ObjectId hoặc null nếu ID không hợp lệ
 */
export const toObjectId = (id: any): mongoose.Types.ObjectId | null => {
  if (!id) return null;

  // Nếu đã là ObjectId
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  // Nếu là string hoặc có thể chuyển đổi thành string
  const idStr = String(id);

  // Kiểm tra định dạng hợp lệ
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return new mongoose.Types.ObjectId(idStr);
  }

  logger.warn(`Invalid ObjectId format: ${idStr}`);
  return null;
};

/**
 * Chuyển đổi ID sang chuỗi string, xử lý các trường hợp ID là ObjectId hoặc các định dạng khác
 * @param id - ID cần chuyển đổi
 * @returns Chuỗi string biểu diễn ID hoặc chuỗi rỗng nếu ID không hợp lệ
 */
export const toIdString = (id: any): string => {
  if (!id) return "";

  // Nếu là ObjectId
  if (id instanceof mongoose.Types.ObjectId) {
    return id.toString();
  }

  // Nếu là string, trả về trực tiếp
  if (typeof id === "string") {
    return id;
  }

  // Trường hợp còn lại, chuyển đổi sang string
  return String(id);
};

/**
 * So sánh hai ID xem có bằng nhau không, bất kể định dạng
 * @param id1 - ID thứ nhất
 * @param id2 - ID thứ hai
 * @returns true nếu hai ID biểu diễn cùng một giá trị
 */
export const compareIds = (id1: any, id2: any): boolean => {
  if (!id1 || !id2) return false;

  const id1Str = toIdString(id1);
  const id2Str = toIdString(id2);

  return id1Str === id2Str;
};

/**
 * Kiểm tra một ID có trong mảng các ID hay không
 * @param needle - ID cần tìm
 * @param haystack - Mảng ID để kiểm tra
 * @returns true nếu tìm thấy ID trong mảng
 */
export const idInArray = (needle: any, haystack: any[]): boolean => {
  if (!needle || !haystack || !Array.isArray(haystack)) return false;

  const needleStr = toIdString(needle);

  return haystack.some((item) => toIdString(item) === needleStr);
};

/**
 * Chuẩn hóa một mảng các ID, loại bỏ các ID không hợp lệ và trả về mảng các ObjectId
 * @param ids - Mảng ID cần chuẩn hóa
 * @returns Mảng các ObjectId hợp lệ
 */
export const normalizeIdArray = (ids: any[]): mongoose.Types.ObjectId[] => {
  if (!ids || !Array.isArray(ids)) return [];

  return ids
    .map((id) => toObjectId(id))
    .filter((id): id is mongoose.Types.ObjectId => id !== null);
};
