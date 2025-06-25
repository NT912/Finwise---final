import {
  createWallet,
  fetchWallets,
  updateWallet,
  deleteWallet,
} from "./services";

// Add the test function somewhere in the App component
const testWalletFunctions = async () => {
  console.log("🧪 Testing wallet functions");

  try {
    // Fetch wallets
    console.log("🧪 Fetching wallets...");
    const wallets = await fetchWallets();
    console.log("🧪 Current wallets:", wallets);

    // Create a wallet
    console.log("🧪 Creating test wallet...");
    const newWallet = await createWallet({
      name: "Test Wallet",
      balance: 1000,
      currency: "VND",
      icon: "wallet-outline",
      color: "#4CAF50",
      isIncludedInTotal: true,
      isDefault: false,
      note: "Test wallet created for testing",
    });
    console.log("🧪 New wallet created:", newWallet);

    // Fetch wallets again to verify creation
    console.log("🧪 Fetching wallets after creation...");
    const updatedWallets = await fetchWallets();
    console.log("🧪 Updated wallets:", updatedWallets);

    // Update the wallet
    if (newWallet && newWallet._id) {
      console.log(`🧪 Updating wallet ${newWallet._id}...`);
      const updatedWallet = await updateWallet(newWallet._id, {
        name: "Updated Test Wallet",
        balance: 2000,
      });
      console.log("🧪 Wallet updated:", updatedWallet);
    }

    // Fetch wallets again to verify update
    console.log("🧪 Fetching wallets after update...");
    const afterUpdateWallets = await fetchWallets();
    console.log("🧪 Wallets after update:", afterUpdateWallets);

    // Delete the wallet
    if (newWallet && newWallet._id) {
      console.log(`🧪 Deleting wallet ${newWallet._id}...`);
      await deleteWallet(newWallet._id);
      console.log("🧪 Wallet deleted");
    }

    // Fetch wallets again to verify deletion
    console.log("🧪 Fetching wallets after deletion...");
    const finalWallets = await fetchWallets();
    console.log("🧪 Final wallets:", finalWallets);

    console.log("🧪 Wallet tests completed successfully!");
  } catch (error) {
    console.error("🧪 Error during wallet tests:", error);
  }
};
