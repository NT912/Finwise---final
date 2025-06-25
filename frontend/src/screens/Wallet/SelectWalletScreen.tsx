import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
  ImageURISource,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../../utils/currency";
import { useWallet, Wallet } from "../../hooks/useWallet";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { colors } from "../../theme";

// Extend the Wallet interface to include color property
interface ExtendedWallet extends Wallet {
  color?: string;
}

type RouteParams = {
  SelectWallet: {
    selectedWalletId?: string;
    onSelectWallet?: (wallet: ExtendedWallet) => void;
  };
};

const SelectWalletScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "SelectWallet">>();
  const { selectedWalletId, onSelectWallet } = route.params || {};

  const { wallets, getWallets } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>(
    selectedWalletId
  );

  // Calculate total balance for all wallets
  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  // Special 'All Wallets' object
  const allWalletsObj: ExtendedWallet = {
    _id: "all",
    name: "Tất Cả Ví",
    balance: totalBalance,
    icon: "wallet-outline",
    color: colors.primary,
    isDefault: false,
    isIncludedInTotal: false,
  };

  useEffect(() => {
    getWallets();
  }, []);

  const handleWalletSelect = (wallet: ExtendedWallet) => {
    setSelectedWallet(wallet._id);

    // If callback exists, call it
    if (onSelectWallet) {
      onSelectWallet(wallet);
    }

    // Navigate back
    navigation.goBack();
  };

  // Hàm xử lý hiển thị icon ví
  const renderWalletIcon = (wallet: ExtendedWallet) => {
    // Nếu không có icon hoặc icon không phải là chuỗi
    if (!wallet.icon || typeof wallet.icon !== "string") {
      return <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />;
    }

    // Kiểm tra xem icon có phải là tên icon từ Ionicons không
    if (wallet.icon.includes("outline") || wallet.icon.includes("-")) {
      try {
        return <Ionicons name={wallet.icon as any} size={24} color="#FFFFFF" />;
      } catch (error) {
        return <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />;
      }
    }

    // Nếu là URI hình ảnh, thử hiển thị
    try {
      return (
        <Image
          source={{ uri: wallet.icon }}
          style={styles.walletIcon}
          defaultSource={
            {
              uri: "https://example.com/default-wallet-icon.png",
            } as ImageURISource
          }
          onError={() => console.log("Error loading wallet icon:", wallet.icon)}
        />
      );
    } catch (error) {
      console.log("Error rendering wallet icon:", error);
      return <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />;
    }
  };

  const renderWalletItem = ({ item }: { item: ExtendedWallet }) => {
    const isSelected = selectedWallet === item._id;

    return (
      <TouchableOpacity
        style={styles.walletItem}
        onPress={() => handleWalletSelect(item)}
      >
        <View style={styles.walletInfo}>
          <View
            style={[
              styles.walletIconContainer,
              { backgroundColor: item.color || "#FF9500" },
            ]}
          >
            {renderWalletIcon(item)}
          </View>
          <View style={styles.walletDetails}>
            <Text style={styles.walletName}>{item.name}</Text>
            <Text style={styles.walletBalance}>
              {formatCurrency(item.balance)} đ
            </Text>
          </View>
        </View>

        {isSelected && (
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View style={styles.divider} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Ví</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Wallet List */}
      <View style={styles.walletsContainer}>
        <FlatList
          data={[allWalletsObj, ...wallets]}
          renderItem={renderWalletItem}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safeAreaTop: {
    flex: 0,
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
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  walletsContainer: {
    flex: 1,
    marginTop: 0,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
    marginBottom: -50,
  },
  listContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 30,
  },
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF9500",
    marginRight: 12,
  },
  walletIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  walletDetails: {
    justifyContent: "center",
  },
  walletName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 15,
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 68,
  },
});

export default SelectWalletScreen;
