import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Switch,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import { createWallet } from "../../services/walletService";
import { colors } from "../../theme";
import {
  formatNumberWithCommas,
  parseFormattedNumber,
} from "../../utils/formatters";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Danh sách màu có thể chọn cho ví
const WALLET_COLORS = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#F44336", // Red
  "#FF9800", // Orange
  "#607D8B", // Blue Grey
  "#795548", // Brown
  "#009688", // Teal
];

// Danh sách biểu tượng có thể chọn cho ví
const WALLET_ICONS = [
  "wallet-outline",
  "cash-outline",
  "card-outline",
  "business-outline",
  "briefcase-outline",
  "basket-outline",
  "home-outline",
  "airplane-outline",
  "car-outline",
] as const;

type WalletIconType = (typeof WALLET_ICONS)[number];

const CreateWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [formattedBalance, setFormattedBalance] = useState("");
  const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<WalletIconType>(
    WALLET_ICONS[0]
  );
  const [isIncludedInTotal, setIsIncludedInTotal] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Xử lý lưu ví mới
  const handleSave = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!name.trim()) {
      showErrorToast("Lỗi", "Vui lòng nhập tên ví");
      return;
    }

    if (!balance.trim() || isNaN(Number(balance))) {
      showErrorToast("Lỗi", "Vui lòng nhập số dư hợp lệ");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Creating new wallet...");

      // Tạo đối tượng dữ liệu ví mới
      const walletData = {
        name: name.trim(),
        balance: Number(balance),
        currency: "VND", // Mặc định là VND
        icon: selectedIcon,
        color: selectedColor,
        isIncludedInTotal,
        isDefault,
        note: "", // Thêm note trống
      };

      console.log("📝 Wallet data to create:", JSON.stringify(walletData));

      // Gọi API để tạo ví mới
      const newWallet = await createWallet(walletData);

      console.log("✅ Wallet created successfully:", JSON.stringify(newWallet));

      showSuccessToast("Thành công", "Đã tạo ví mới");

      // Navigate back to remove this screen from the stack
      navigation.goBack();

      // Wait a bit then navigate to TabNavigator to ensure consistent behavior
      setTimeout(() => {
        // @ts-ignore: Force navigation to TabNavigator to reset stack
        navigation.navigate("TabNavigator" as any);

        // Then immediately navigate to WalletScreen
        setTimeout(() => {
          navigation.navigate("WalletScreen" as any);
        }, 50);
      }, 50);
    } catch (error) {
      console.error("❌ Error creating wallet:", error);
      showErrorToast("Lỗi", "Không thể tạo ví. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Handle the hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

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
        <Text style={styles.headerTitle}>Tạo Ví Mới</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        >
          {loading ? (
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
            <Text style={styles.inputLabel}>Số Dư Ban Đầu</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formattedBalance}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
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
                  <Ionicons name={icon} size={24} color="#FFF" />
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
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingBottom: 50,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: "#000",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIconItem: {
    borderWidth: 2,
    borderColor: "#000",
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

export default CreateWalletScreen;
