import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import User, { IUser } from "../models/User"; // ✅ Import đúng kiểu IUser
import PasswordReset from "../models/PasswordReset";
import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { env_dev } from "../config/configApp";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 📌 Cấu hình email sender
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "tt912002@gmail.com",
    pass: process.env.EMAIL_APP_PASSWORD || "nyor pwpw hkxn wlxa",
  },
  debug: true,
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// 📌 Tạo JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, env_dev.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// 📌 Đăng ký người dùng
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists!");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hashedPassword });

  await newUser.save();
  return generateToken(newUser._id.toHexString());
};

// 📌 Đăng nhập người dùng
export const loginUser = async (email: string, password: string) => {
  console.log("🔍 [authService] Attempting login for email:", email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ [authService] User not found for email:", email);
    throw new Error("Email does not exist!");
  }

  if (!user.password) {
    console.log("❌ [authService] No password set for user:", email);
    throw new Error("This account was created using Google/Facebook login.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ [authService] Password mismatch for user:", email);
    throw new Error("Incorrect password!");
  }

  console.log("✅ [authService] Login successful for user:", email);
  return generateToken(user._id.toString());
};

// 📌 Đăng nhập bằng Google
export const loginWithGoogle = async (idToken: string) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Invalid Google token");

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        email: payload.email,
        fullName: payload.name,
        googleId: payload.sub, // ✅ Đảm bảo User Model có `googleId`
        avatar: payload.picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    return generateToken(user._id.toString()); // ✅ Ép kiểu _id thành string
  } catch (error) {
    throw new Error("Google authentication failed");
  }
};

// 📌 Đăng nhập bằng Facebook
export const loginWithFacebook = async (accessToken: string) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = response.data;
    if (!email) throw new Error("Facebook did not provide an email");

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        fullName: name,
        facebookId: id, // ✅ Đảm bảo User Model có `facebookId`
        avatar: picture?.data?.url,
      });
      await user.save();
    } else if (!user.facebookId) {
      user.facebookId = id;
      await user.save();
    }

    return generateToken(user._id.toString()); // ✅ Ép kiểu _id thành string
  } catch (error) {
    throw new Error("Facebook authentication failed");
  }
};

// 📌 Tạo mã xác nhận ngẫu nhiên (6 chữ số)
export const generateResetToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 📌 Gửi email đặt lại mật khẩu
export const sendResetPasswordEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "Invalid reset code" };
    }

    const resetCode = generateResetToken();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expirationTime;
    await user.save();

    const mailOptions = {
      from: {
        name: "FinWise Support",
        address: process.env.EMAIL_USER as string,
      },
      to: email,
      subject: "Reset Your Password - FinWise",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00875F;">Reset Your Password</h1>
          <p>Hello,</p>
          <p>You have requested to reset your password for your FinWise account.</p>
          <p>Your password reset code is: <strong style="font-size: 24px; color: #00875F;">${resetCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email and ensure your account is secure.</p>
          <p>Best regards,<br>The FinWise Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reset code sent successfully!" };
  } catch {
    return { success: false, message: "Invalid reset code" };
  }
};

// 📌 Đặt lại mật khẩu
export const resetUserPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "Invalid reset code" };
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== resetCode) {
      return { success: false, message: "Invalid reset code" };
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return { success: false, message: "Invalid reset code" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully!" };
  } catch {
    return { success: false, message: "Invalid reset code" };
  }
};
