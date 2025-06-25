import mongoose, { Document } from "mongoose";

export interface IPasswordReset extends Document {
  email: string;
  resetCode: string;
  createdAt: Date;
}

const PasswordResetSchema = new mongoose.Schema<IPasswordReset>({
  email: { type: String, required: true },
  resetCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Hết hạn sau 1 giờ
});

const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema
);
export default PasswordReset;
