import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList, RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme";
import {
  fetchWallets,
  deleteWallet,
  Wallet,
} from "../../services/walletService";
import { formatVND } from "../../utils/formatters";
import LoadingIndicator from "../../components/LoadingIndicator";
import { Swipeable } from "react-native-gesture-handler";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Cập nhật kiểu dữ liệu của route params
type WalletScreenParams = {
  onSelectWallet?: (walletId: string) => void;
  selectedWalletId?: string | null;
  showAllWalletsOption?: boolean;
};

const WalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "WalletScreen">>();
  const { onSelectWallet, selectedWalletId, showAllWalletsOption } =
    route.params || ({} as WalletScreenParams);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  // Tham chiếu để theo dõi Swipeable hiện đang mở
  const swipeableRefs = useRef<Array<Swipeable | null>>([]);

  // Hàm để đóng tất cả các swipeable đang mở
  const closeAllOpenRows = (exceptIndex?: number) => {
    swipeableRefs.current.forEach((ref, i) => {
      if (ref && exceptIndex !== i) {
        ref.close();
      }
    });
  };

  const loadWallets = useCallback(async () => {
    try {
      console.log("\n🔄 WalletScreen - Starting loadWallets...");
      setLoading(true);
      const wallets = await fetchWallets();

      console.log(
        "📥 WalletScreen - Received wallets:",
        JSON.stringify(wallets, null, 2)
      );

      if (wallets && wallets.length > 0) {
        console.log(
          `✅ WalletScreen - Setting ${wallets.length} wallets to state`
        );
        setWallets(wallets);
        const total = wallets
          .filter((wallet) => wallet.isIncludedInTotal)
          .reduce((sum, wallet) => sum + wallet.balance, 0);
        console.log(`💰 WalletScreen - Calculated total balance: ${total}`);
        setTotalBalance(total);
      } else {
        console.log(
          "⚠️ WalletScreen - No wallets received, setting empty state"
        );
        setWallets([]);
        setTotalBalance(0);
      }
    } catch (error) {
      console.error("❌ WalletScreen - Error in loadWallets:", error);
      showErrorToast("Failed to load wallets", "Please try again later");
      setWallets([]);
      setTotalBalance(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Log when component mounts
  useEffect(() => {
    console.log("\n🔵 WalletScreen - Component mounted");
    loadWallets();
    return () => {
      console.log("🔴 WalletScreen - Component will unmount");
    };
  }, [loadWallets]);

  // Log when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("\n👀 WalletScreen - Screen focused, reloading wallets...");
      loadWallets();
    });
    return unsubscribe;
  }, [navigation, loadWallets]);

  const handleAddWallet = () => {
    navigation.navigate("CreateWalletScreen");
  };

  const handleDeleteWallet = (walletId: string) => {
    Alert.alert(
      "Xóa Ví",
      "Bạn có chắc chắn muốn xóa ví này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              closeAllOpenRows(); // Đóng tất cả các hàng đang được vuốt mở
              await deleteWallet(walletId);
              loadWallets();
              showSuccessToast("Đã Xóa Ví", "Ví đã được xóa thành công");
            } catch (error) {
              console.error("Error deleting wallet:", error);
              showErrorToast("Lỗi", "Không thể xóa ví. Vui lòng thử lại sau.");
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    // Sử dụng goBack thay vì navigate để giữ hiệu ứng chuyển cảnh từ phải sang trái
    navigation.goBack();
  };

  // Handle the hardware back button
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        const onBackPress = () => {
          handleClose();
          return true; // Prevent default behavior
        };

        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

        return () => subscription.remove();
      }
      return undefined;
    }, [navigation])
  );

  const handleWalletSelect = (wallet: Wallet | { _id: string }) => {
    if (onSelectWallet) {
      onSelectWallet(wallet._id);
      navigation.goBack();
    }
  };

  const handleSelectAllWallets = () => {
    if (onSelectWallet) {
      onSelectWallet("all");
      navigation.goBack();
    }
  };

  // Hàm xử lý khi nhấn nút Edit
  const handleEditWallet = (wallet: Wallet) => {
    closeAllOpenRows();
    navigation.navigate("EditWalletScreen", { walletId: wallet._id });
  };

  // Render các nút hành động bên phải khi vuốt
  const renderRightActions = (wallet: Wallet, index: number) => {
    return (
      <View style={styles.swipeActionContainer}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => {
            closeAllOpenRows();
            setTimeout(() => {
              handleEditWallet(wallet);
            }, 200); // Thêm độ trễ nhỏ để hiệu ứng đóng hoàn thành trước khi chuyển màn hình
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="create-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => {
            closeAllOpenRows();
            setTimeout(() => {
              handleDeleteWallet(wallet._id);
            }, 200); // Thêm độ trễ nhỏ để hiệu ứng đóng hoàn thành trước khi hiển thị alert
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Component hiển thị ví có thể vuốt
  const SwipeableWalletItem = (
    wallet: Wallet,
    index: number,
    section: "included" | "excluded"
  ) => {
    return (
      <Swipeable
        ref={(ref) => {
          const actualIndex =
            section === "included"
              ? index
              : wallets.filter((w) => w.isIncludedInTotal).length + index;
          swipeableRefs.current[actualIndex] = ref;
        }}
        renderRightActions={() => renderRightActions(wallet, index)}
        onSwipeableOpen={() => closeAllOpenRows(index)}
        overshootRight={false}
        rightThreshold={40}
        friction={1}
        containerStyle={styles.swipeableContainer}
        childrenContainerStyle={styles.swipeableChildrenContainer}
        key={wallet._id}
      >
        <TouchableOpacity
          style={[
            styles.walletCard,
            selectedWalletId === wallet._id && styles.selectedWalletCard,
          ]}
          onPress={() => handleWalletSelect(wallet)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.walletIconContainer,
              { backgroundColor: wallet.color },
            ]}
          >
            <Ionicons name={wallet.icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletName}>{wallet.name}</Text>
            <Text style={styles.walletBalance}>
              {formatVND(wallet.balance)}
            </Text>
            {wallet.note && (
              <View style={styles.noteContainer}>
                <Ionicons name="document-text-outline" size={14} color="#777" />
                <Text style={styles.noteText}>{wallet.note}</Text>
              </View>
            )}
          </View>
          {selectedWalletId === wallet._id && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví Của Tôi</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddWallet}>
          <Ionicons name="add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadWallets} />
        }
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Total Balance - chỉ hiển thị khi không có tùy chọn "Tất Cả Ví" */}
        {!showAllWalletsOption && (
          <View style={styles.totalCard}>
            <View style={styles.totalIconContainer}>
              <Ionicons name="wallet-outline" size={24} color="#000" />
            </View>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Tổng Số Dư</Text>
              <Text style={styles.totalAmount}>{formatVND(totalBalance)}</Text>
            </View>
          </View>
        )}

        {/* Tùy chọn "All Wallets" nếu showAllWalletsOption = true */}
        {showAllWalletsOption && (
          <TouchableOpacity
            style={[
              styles.walletCard,
              selectedWalletId === "all" && styles.selectedWalletCard,
              {
                marginTop: 16,
                marginBottom: 8,
                backgroundColor: "#F0F7FF",
                borderWidth: selectedWalletId === "all" ? 2 : 0,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleSelectAllWallets}
          >
            <View
              style={[
                styles.walletIconContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="wallet-outline" size={24} color="#fff" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={[styles.walletName, { fontWeight: "700" }]}>
                Tất Cả Ví
              </Text>
              <Text style={styles.walletBalance}>
                {formatVND(totalBalance)}
              </Text>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                Hiển thị giao dịch từ tất cả ví
              </Text>
            </View>
            {selectedWalletId === "all" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        )}

        {/* Included in Total Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ĐƯỢC TÍNH VÀO TỔNG</Text>
          {wallets
            .filter((wallet) => wallet.isIncludedInTotal)
            .map((wallet, index) =>
              SwipeableWalletItem(wallet, index, "included")
            )}
        </View>

        {/* Not Included in Total Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KHÔNG TÍNH VÀO TỔNG</Text>
          {wallets
            .filter((wallet) => !wallet.isIncludedInTotal)
            .map((wallet, index) =>
              SwipeableWalletItem(wallet, index, "excluded")
            )}
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
  actionButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 50,
    marginBottom: -50,
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  totalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  totalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: "#8E8E93",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 16,
    marginBottom: 8,
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  walletInfo: {
    flex: 1,
    marginLeft: 12,
  },
  walletName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000",
  },
  walletBalance: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 4,
  },
  selectedWalletCard: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: `${colors.primary}10`,
  },

  // Styles cải thiện cho swipeable actions
  swipeActionContainer: {
    flexDirection: "row",
    width: 120,
    height: "100%",
    marginRight: 10,
  },
  swipeAction: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    marginHorizontal: 5,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  editAction: {
    backgroundColor: "#007AFF", // iOS blue
  },
  deleteAction: {
    backgroundColor: "#FF3B30", // iOS red
  },
  swipeableContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  swipeableChildrenContainer: {
    borderRadius: 12,
    marginHorizontal: 0,
    overflow: "hidden",
  },
});

export default WalletScreen;
