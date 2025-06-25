import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Thư mục uploads
const uploadsDir = path.join(__dirname, "../../uploads");
const avatarsDir = path.join(uploadsDir, "avatars");

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ [s3Service] Đã tạo thư mục uploads");
}

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log("✅ [s3Service] Đã tạo thư mục avatars");
}

// Upload file vào thư mục cục bộ thay vì S3
export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    console.log(`🔍 [s3Service] Đang lưu file ${fileName} vào thư mục local`);

    // Tạo tên file duy nhất
    const uniqueFileName = `${Date.now()}-${uuidv4()}-${fileName}`;
    const filePath = path.join(
      contentType.includes("image") ? avatarsDir : uploadsDir,
      uniqueFileName
    );

    // Ghi file
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`✅ [s3Service] Lưu file thành công: ${filePath}`);

    // Trả về đường dẫn tương đối để dùng làm key
    return `uploads/${
      contentType.includes("image") ? "avatars/" : ""
    }${uniqueFileName}`;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi lưu file:", error);
    throw new Error("Không thể lưu file");
  }
};

// Lấy URL đơn giản thay vì signed URL
export const getSignedFileUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    console.log(`🔍 [s3Service] Tạo URL cho file: ${key}`);

    // Trả về URL tương đối
    return `/uploads/${key.replace("uploads/", "")}`;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi tạo URL:", error);
    throw new Error("Không thể tạo URL truy cập file");
  }
};

// Xóa file từ thư mục cục bộ
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    console.log(`🔍 [s3Service] Xóa file: ${key}`);

    const filePath = path.join(__dirname, "../../", key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ [s3Service] Xóa file thành công: ${filePath}`);
    } else {
      console.log(`⚠️ [s3Service] File không tồn tại: ${filePath}`);
    }
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi xóa file:", error);
    throw new Error("Không thể xóa file");
  }
};

// Upload file từ đường dẫn local
export const uploadLocalFileToS3 = async (
  filePath: string,
  contentType: string
): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return await uploadFileToS3(fileContent, fileName, contentType);
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi upload file local:", error);
    throw new Error("Không thể upload file từ local");
  }
};

// Liệt kê các file trong thư mục
export const listFilesInFolder = async (prefix: string): Promise<string[]> => {
  try {
    console.log(`🔍 [s3Service] Liệt kê files trong thư mục: ${prefix}`);

    const dirPath = path.join(uploadsDir, prefix);

    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = fs
      .readdirSync(dirPath)
      .map((file) => `uploads/${prefix}/${file}`);

    return files;
  } catch (error) {
    console.error("❌ [s3Service] Lỗi khi liệt kê files:", error);
    throw new Error("Không thể liệt kê files");
  }
};

// Mock function cho initializeS3Bucket
export const initializeS3Bucket = async () => {
  console.log(
    "✅ [s3Service] Không cần khởi tạo S3 bucket - sử dụng local storage"
  );
  return true;
};
