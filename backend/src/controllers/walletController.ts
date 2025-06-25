import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import { validateObjectId } from "../utils/validators";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import Transaction from "../models/new-models/Transaction";

// Xóa chức năng tạo ví mẫu vì không dùng nữa
// export const createSampleWallet = async (userId: string) => {
//   try {
//     const sampleWallet = new Wallet({
//       name: "Cash",
//       balance: 0,
//       currency: "VND",
//       icon: "cash-outline",
//       color: "#4CAF50",
//       isIncludedInTotal: true,
//       isDefault: true,
//       userId: new mongoose.Types.ObjectId(userId),
//       note: "Default wallet",
//     });

//     await sampleWallet.save();
//     console.log("✅ Sample wallet created successfully");
//     return sampleWallet;
//   } catch (error) {
//     console.error("❌ Error creating sample wallet:", error);
//     throw error;
//   }
// };

// Get all wallets for a user
export const getWallets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Chỉ giữ lại log quan trọng và gộp nhóm chúng
    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const wallets = await Wallet.find({ userId });
    // Chỉ log khi debug
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ [walletController] Found ${wallets.length} wallets for user ${userId}`
      );
    }

    res.json(wallets);
  } catch (error) {
    console.error("❌ [walletController] Error fetching wallets:", error);
    res.status(500).json({ message: "Error fetching wallets" });
  }
};

// Get a single wallet
export const getWallet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid wallet ID format" });
    }

    const wallet = await Wallet.findOne({ _id: id, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({
      message: "Error fetching wallet",
      error: error.message,
    });
  }
};

// Create a new wallet
export const createWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const {
      name,
      balance,
      currency,
      icon,
      color,
      isIncludedInTotal,
      isDefault,
      note,
    } = req.body;

    // Validate required fields
    if (!name || !icon || !color) {
      return res.status(400).json({
        message: "Name, icon, and color are required fields",
      });
    }

    // If this is the first wallet or isDefault is true, set it as default
    const existingWallets = await Wallet.countDocuments({ userId });
    const shouldBeDefault = existingWallets === 0 || isDefault;

    // If setting as default, unset other default wallets
    if (shouldBeDefault) {
      await Wallet.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const wallet = new Wallet({
      name,
      balance: balance || 0,
      currency: currency || "VND",
      icon,
      color,
      isIncludedInTotal:
        isIncludedInTotal !== undefined ? isIncludedInTotal : true,
      isDefault: shouldBeDefault,
      userId,
      note: note || "",
    });

    await wallet.save();
    res.status(201).json(wallet);
  } catch (error: any) {
    console.error("Error creating wallet:", error);
    res.status(500).json({
      message: "Error creating wallet",
      error: error.message,
    });
  }
};

// Update a wallet
export const updateWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("🔍 [walletController] updateWallet called");
    console.log("🔍 [walletController] req.user:", req.user);

    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid wallet ID format" });
    }

    const {
      name,
      balance,
      currency,
      icon,
      color,
      isIncludedInTotal,
      isDefault,
      note,
    } = req.body;

    // Validate required fields if they are being updated
    if (
      (name !== undefined && !name) ||
      (icon !== undefined && !icon) ||
      (color !== undefined && !color)
    ) {
      return res.status(400).json({
        message: "Name, icon, and color cannot be empty if provided",
      });
    }

    // Nếu đang cập nhật note và chỉ có note, thì chỉ cập nhật note
    if (Object.keys(req.body).length === 1 && note !== undefined) {
      const updatedWallet = await Wallet.findOneAndUpdate(
        { _id: id, userId },
        { note: note },
        { new: true }
      );

      if (!updatedWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      return res.json(updatedWallet);
    }

    // If setting as default, unset other default wallets
    if (isDefault) {
      await Wallet.updateMany(
        {
          userId,
          isDefault: true,
          _id: { $ne: id },
        },
        { isDefault: false }
      );
    }

    // Create update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (balance !== undefined) updateData.balance = balance;
    if (currency !== undefined) updateData.currency = currency;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isIncludedInTotal !== undefined)
      updateData.isIncludedInTotal = isIncludedInTotal;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (note !== undefined) updateData.note = note;

    // Set updated timestamp
    updateData.updatedAt = new Date();

    const wallet = await Wallet.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (error: any) {
    console.error("Error updating wallet:", error);
    res.status(500).json({
      message: "Error updating wallet",
      error: error.message,
    });
  }
};

// Delete a wallet
export const deleteWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("🔍 [walletController] deleteWallet called");
    console.log("🔍 [walletController] req.user:", req.user);

    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid wallet ID format" });
    }

    // Check if wallet exists
    const wallet = await Wallet.findOne({ _id: id, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Check if it's the default wallet
    if (wallet.isDefault) {
      // Find another wallet to set as default
      const anotherWallet = await Wallet.findOne({
        userId,
        _id: { $ne: id },
      });

      if (anotherWallet) {
        anotherWallet.isDefault = true;
        await anotherWallet.save();
      }
    }

    await Wallet.deleteOne({ _id: id, userId });
    console.log(`✅ [walletController] Wallet deleted: ${id}`);
    res.json({ message: "Wallet deleted successfully" });
  } catch (error: any) {
    console.error("❌ [walletController] Error deleting wallet:", error);
    res.status(500).json({
      message: "Error deleting wallet",
      error: error.message,
    });
  }
};

// Get total balance from all included wallets
export const getTotalBalance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("🔍 [walletController] getTotalBalance called");
    console.log("🔍 [walletController] req.user:", req.user);

    const userId = req.user?.userId;
    if (!userId) {
      console.log("❌ [walletController] User ID not found");
      res.status(401).json({ message: "User ID not found" });
      return;
    }

    const wallets = await Wallet.find({
      userId,
      isIncludedInTotal: true,
    });

    console.log(
      `✅ [walletController] Found ${wallets.length} wallets for total balance`
    );

    if (wallets.length === 0) {
      // Không tạo ví mẫu nữa, chỉ trả về tổng bằng 0
      return res.json({ totalBalance: 0 });
    }

    // Sum up the balances
    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.balance),
      0
    );

    console.log(`✅ [walletController] Total balance: ${totalBalance}`);
    res.json({ totalBalance });
  } catch (error: any) {
    console.error("❌ [walletController] Error getting total balance:", error);
    res.status(500).json({
      message: "Error getting total balance",
      error: error.message,
    });
  }
};
