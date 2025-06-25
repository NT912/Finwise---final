import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors } from "../../theme";
import {
  updateWallet,
  Wallet,
  getWalletById,
} from "../../services/walletService";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
} from "../../utils/formatters";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Wallet icon options
const WALLET_ICONS = [
  "wallet-outline",
  "cash-outline",
  "card-outline",
  "home-outline",
  "briefcase-outline",
  "gift-outline",
  "cart-outline",
  "business-outline",
  "car-outline",
  "airplane-outline",
  "pricetag-outline",
  "restaurant-outline",
  "medical-outline",
  "school-outline",
];

// Wallet color options
const WALLET_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#F44336",
  "#FF9800",
  "#795548",
  "#607D8B",
  "#009688",
  "#E91E63",
  "#673AB7",
  "#3F51B5",
  "#00BCD4",
  "#CDDC39",
  "#FFC107",
];

// Define the type for the route params
type EditWalletScreenParams = {
  walletId: string;
};

type EditWalletScreenRouteProp = RouteProp<
  { EditWalletScreen: EditWalletScreenParams },
  "EditWalletScreen"
>;

const EditWalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditWalletScreenRouteProp>();
  const { walletId } = route.params;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [formattedBalance, setFormattedBalance] = useState("0");
  const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(WALLET_ICONS[0]);
  const [isIncludedInTotal, setIsIncludedInTotal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch wallet data
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const walletData = await getWalletById(walletId);
        setWallet(walletData);

        // Set initial values
        setName(walletData.name || "");
        setBalance((walletData.balance || 0).toString());
        setFormattedBalance(
          formatNumberWithCommas((walletData.balance || 0).toString())
        );
        setSelectedColor(walletData.color || WALLET_COLORS[0]);
        setSelectedIcon(walletData.icon || WALLET_ICONS[0]);
        setIsIncludedInTotal(walletData.isIncludedInTotal || false);
        setIsDefault(walletData.isDefault || false);
        setNote(walletData.note || "");
      } catch (error) {
        console.error("Error fetching wallet:", error);
        showErrorToast("Lỗi", "Không thể tải thông tin ví");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [walletId]);

  // Handle balance change with formatting
  const handleBalanceChange = (text: string) => {
    // Remove non-numeric characters for actual value
    const numericValue = text.replace(/[^0-9]/g, "");
    setBalance(numericValue);

    // Format with thousand separators
    if (numericValue) {
      setFormattedBalance(formatNumberWithCommas(numericValue));
    } else {
      setFormattedBalance("");
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!wallet) return;

    if (!name.trim()) {
      showErrorToast("Lỗi", "Vui lòng nhập tên ví");
      return;
    }

    try {
      setSaving(true);

      // Create updated wallet data
      const updatedWalletData = {
        name,
        balance: parseFloat(balance) || 0,
        color: selectedColor,
        icon: selectedIcon,
        isIncludedInTotal,
        isDefault,
        note: note.trim(),
      };

      await updateWallet(wallet._id, updatedWalletData);

      showSuccessToast("Thành công", "Đã cập nhật ví thành công");

      // Navigate back after update
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error("Error updating wallet:", error);
      showErrorToast("Lỗi", "Không thể cập nhật ví. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh Sửa Ví</Text>
          <View style={styles.saveButton} />
        </View>
        <View
          style={[
            styles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 16, color: "#666", marginTop: 16 }}>
            Đang tải...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if wallet not found
  if (!wallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh Sửa Ví</Text>
          <View style={styles.saveButton} />
        </View>
        <View
          style={[
            styles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>
            Không tìm thấy thông tin ví
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh Sửa Ví</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Wallet Information Form */}
        <View style={styles.formContainer}>
          {/* Wallet Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên Ví</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên ví"
              value={name}
              onChangeText={setName}
              maxLength={30}
            />
          </View>

          {/* Wallet Balance */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số Dư Hiện Tại</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formattedBalance}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
            />
          </View>

          {/* Wallet Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ghi Chú</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Thêm ghi chú về ví này (tùy chọn)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
          </View>

          {/* Wallet Color Selection */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Màu Ví</Text>
            <View style={styles.colorGrid}>
              {WALLET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorItem,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wallet Icon Selection */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Biểu Tượng Ví</Text>
            <View style={styles.iconGrid}>
              {WALLET_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconItem,
                    { backgroundColor: selectedColor },
                    selectedIcon === icon && styles.selectedIconItem,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons name={icon as any} size={24} color="#FFF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wallet Options */}
          <View style={styles.walletOptionsContainer}>
            <View style={styles.switchOption}>
              <Text style={styles.switchLabel}>Tính Vào Tổng Số Dư</Text>
              <Switch
                value={isIncludedInTotal}
                onValueChange={setIsIncludedInTotal}
                trackColor={{ false: "#D1D1D6", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.switchOption}>
              <Text style={styles.switchLabel}>Đặt Làm Ví Mặc Định</Text>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: "#D1D1D6", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
    marginBottom: -50,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionContainer: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: "#000000",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIconItem: {
    borderWidth: 2,
    borderColor: "#000000",
  },
  walletOptionsContainer: {
    marginTop: 10,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default EditWalletScreen;
