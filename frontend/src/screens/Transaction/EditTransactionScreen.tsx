import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  Image,
  Animated,
  ToastAndroid,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { useTransaction } from "../../hooks/useTransaction";
import { useWallet, Wallet } from "../../hooks/useWallet";
import { useCategory } from "../../hooks/useCategory";
import { formatDate } from "../../utils/dateUtils";
import { Category } from "../../types/category";
import { checkServerConnection } from "../../services/apiService";
import CustomAlert from "../../components/common/CustomAlert";
import {
  addListener,
  categorySelectEventKey,
} from "../Category/SelectCategoryScreen";
import DateTimePicker from "@react-native-community/datetimepicker";

type EditTransactionScreenRouteProp = RouteProp<
  {
    EditTransaction: {
      transactionId: string;
    };
  },
  "EditTransaction"
>;

const EditTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditTransactionScreenRouteProp>();
  const { transactionId } = route.params;

  // States
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalY = useRef(new Animated.Value(500)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Create a unique listener ID
  const categoryListenerIdRef = useRef(`edit_transaction_${Date.now()}`);

  // Hooks
  const { getTransactionById, updateTransaction, deleteTransaction } =
    useTransaction();
  const { wallets, getWallets } = useWallet();
  const { categories, getCategories } = useCategory();

  // Helper to normalize date to yyyy-mm-dd
  const normalizeDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  };

  // Helper to get current transaction data for comparison
  type TransactionCompare = {
    amount: number;
    description: string;
    type: "income" | "expense";
    category: string | undefined;
    walletId: string | undefined;
    date: string;
    note: string;
  };

  const getCurrentTransactionData = (): TransactionCompare => ({
    amount: parseFloat(amount.replace(/\./g, "")),
    description: (
      description || (selectedCategory ? selectedCategory.name : "")
    ).trim(),
    type: transactionType,
    category: selectedCategory?._id,
    walletId: selectedWallet?._id,
    date: normalizeDate(selectedDate),
    note: note ? note.trim() : "",
  });

  const [originalTransaction, setOriginalTransaction] =
    useState<TransactionCompare | null>(null);

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        const isConnected = await checkServerConnection();
        setConnectionError(!isConnected);

        if (isConnected) {
          const transaction = await getTransactionById(transactionId);
          if (transaction) {
            const [walletsResult, categoriesResult] = await Promise.all([
              getWallets(),
              getCategories(transaction.type || "expense"),
            ]);

            setOriginalTransaction({
              amount: Number(transaction.amount),
              description: (
                transaction.description ||
                transaction.category?.name ||
                ""
              ).trim(),
              type: transaction.type,
              category:
                typeof transaction.category === "string"
                  ? transaction.category
                  : transaction.category?._id,
              walletId:
                typeof transaction.walletId === "string"
                  ? transaction.walletId
                  : transaction.walletId?._id,
              date: normalizeDate(transaction.date),
              note: transaction.note ? transaction.note.trim() : "",
            });

            const formattedAmount = transaction.amount
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            setAmount(formattedAmount);
            setDescription(transaction.description || "");
            setTransactionType(transaction.type);
            if (transaction.category) {
              const category = categoriesResult.find(
                (c: Category) =>
                  c._id ===
                  (typeof transaction.category === "string"
                    ? transaction.category
                    : transaction.category._id)
              );
              if (category) {
                setSelectedCategory(category);
              }
            }
            if (transaction.walletId) {
              const wallet = walletsResult.find(
                (w: Wallet) =>
                  w._id ===
                  (typeof transaction.walletId === "string"
                    ? transaction.walletId
                    : transaction.walletId._id)
              );
              if (wallet) {
                setSelectedWallet(wallet);
              }
            }
            if (transaction.date) {
              setSelectedDate(new Date(transaction.date));
            }
            setNote(transaction.note || "");
          }
        }
      } catch (error) {
        console.error("Error loading transaction:", error);
        setConnectionError(true);
        ToastAndroid.show(
          "Không thể tải chi tiết giao dịch",
          ToastAndroid.SHORT
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Lắng nghe sự kiện chọn category
  useEffect(() => {
    const cleanup = addListener(
      `${categorySelectEventKey}_${categoryListenerIdRef.current}`,
      (category: Category) => {
        setSelectedCategory(category);
      }
    );
    return cleanup;
  }, []);

  const handleSave = async () => {
    if (!amount || !selectedCategory || !selectedWallet) {
      ToastAndroid.show(
        "Please fill in all required fields",
        ToastAndroid.SHORT
      );
      return;
    }

    // Check for changes (normalize all fields)
    const current = getCurrentTransactionData();
    if (originalTransaction) {
      const isUnchanged =
        current.amount === originalTransaction.amount &&
        current.description === originalTransaction.description &&
        current.type === originalTransaction.type &&
        current.category === originalTransaction.category &&
        current.walletId === originalTransaction.walletId &&
        current.date === originalTransaction.date &&
        current.note === originalTransaction.note;
      if (isUnchanged) {
        ToastAndroid.show("No changes to update", ToastAndroid.SHORT);
        return;
      }
    }

    try {
      setSaving(true);
      const isServerAvailable = await checkServerConnection();
      if (!isServerAvailable) {
        setConnectionError(true);
        setSaving(false);
        return;
      }
      const amountValue = parseFloat(amount.replace(/\./g, ""));
      const transactionData = {
        description: description || selectedCategory.name,
        amount: amountValue,
        type: transactionType,
        category: selectedCategory._id,
        walletId: selectedWallet._id,
        date: selectedDate,
        note: note,
      };
      console.log("Updating transaction:", transactionData);
      await updateTransaction(transactionId, transactionData);
      ToastAndroid.show("Transaction updated successfully", ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating transaction:", error);
      ToastAndroid.show("Failed to update transaction", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Format amount with dots after every 3 digits (VND format)
  const formatAmountWithDots = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    const rawValue = value.replace(/\./g, "");
    const formattedValue = formatAmountWithDots(rawValue);
    setAmount(formattedValue);
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "ios") {
      if (selectedDate) {
        setSelectedDate(selectedDate);
      }
    } else {
      if (event.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }

      if (selectedDate) {
        setSelectedDate(selectedDate);
        setShowDatePicker(false);
      }
    }
  };

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  // Navigation handlers
  const navigateToSelectCategory = () => {
    navigation.navigate("SelectCategory" as any, {
      selectedCategoryId: selectedCategory?._id,
      type: transactionType,
      listenerId: categoryListenerIdRef.current,
    });
  };

  const navigateToSelectWallet = () => {
    navigation.navigate("SelectWallet" as any, {
      selectedWalletId: selectedWallet?._id,
      onSelectWallet: (wallet: Wallet) => setSelectedWallet(wallet),
    });
  };

  const navigateToAddNote = () => {
    navigation.navigate("AddNote" as any, {
      note: note,
      onSaveNote: (newNote: string) => {
        setNote(newNote);
      },
    });
  };

  // Retry connection
  const retryConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await checkServerConnection();
      setConnectionError(!isConnected);

      if (isConnected) {
        const transaction = await getTransactionById(transactionId);
        if (transaction) {
          const [walletsResult, categoriesResult] = await Promise.all([
            getWallets(),
            getCategories(transaction.type || "expense"),
          ]);

          setOriginalTransaction({
            amount: Number(transaction.amount),
            description: (
              transaction.description ||
              transaction.category?.name ||
              ""
            ).trim(),
            type: transaction.type,
            category:
              typeof transaction.category === "string"
                ? transaction.category
                : transaction.category?._id,
            walletId:
              typeof transaction.walletId === "string"
                ? transaction.walletId
                : transaction.walletId?._id,
            date: normalizeDate(transaction.date),
            note: transaction.note ? transaction.note.trim() : "",
          });

          const formattedAmount = transaction.amount
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          setAmount(formattedAmount);
          setDescription(transaction.description || "");
          setTransactionType(transaction.type);
          if (transaction.category) {
            const category = categoriesResult.find(
              (c: Category) =>
                c._id ===
                (typeof transaction.category === "string"
                  ? transaction.category
                  : transaction.category._id)
            );
            if (category) {
              setSelectedCategory(category);
            }
          }
          if (transaction.walletId) {
            const wallet = walletsResult.find(
              (w: Wallet) =>
                w._id ===
                (typeof transaction.walletId === "string"
                  ? transaction.walletId
                  : transaction.walletId._id)
            );
            if (wallet) {
              setSelectedWallet(wallet);
            }
          }
          if (transaction.date) {
            setSelectedDate(new Date(transaction.date));
          }
          setNote(transaction.note || "");
        }
        ToastAndroid.show("Kết nối thành công với máy chủ", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("Không thể kết nối với máy chủ", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      ToastAndroid.show("Không thể kết nối với máy chủ", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh Sửa Giao Dịch</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {connectionError ? (
        <View style={styles.connectionErrorContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={60} color="#FF6B6B" />
            <Text style={styles.connectionErrorTitle}>Lỗi Kết Nối</Text>
            <Text style={styles.connectionErrorMessage}>
              Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và
              thử lại.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryConnection}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.retryButtonText}>Thử Lại Kết Nối</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.errorBackButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Quay Lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.mainContainer}>
              <View style={styles.transactionCard}>
                {/* Wallet Selector */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={navigateToSelectWallet}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.walletIcon,
                        { backgroundColor: selectedWallet?.color || "#FF9500" },
                      ]}
                    >
                      {selectedWallet?.icon ? (
                        selectedWallet.icon.includes("outline") ||
                        selectedWallet.icon.includes("-") ? (
                          <Ionicons
                            name={selectedWallet.icon as any}
                            size={20}
                            color="#FFFFFF"
                          />
                        ) : (
                          <Image
                            source={{ uri: selectedWallet.icon }}
                            style={{
                              width: 20,
                              height: 20,
                              tintColor: "#FFFFFF",
                            }}
                            defaultSource={{
                              uri: "https://example.com/default-wallet-icon.png",
                            }}
                            onError={() =>
                              console.log("Error loading wallet icon")
                            }
                          />
                        )
                      ) : (
                        <Ionicons
                          name="wallet-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text style={styles.itemText}>
                      {selectedWallet?.name || "Chọn ví"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
                <View style={styles.divider} />

                {/* Amount */}
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Số Tiền</Text>
                  <View style={styles.amountInputRow}>
                    <View style={styles.currencyContainer}>
                      <Text style={styles.currencyText}>VND</Text>
                    </View>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      placeholderTextColor="#000000"
                    />
                  </View>
                </View>
                <View style={styles.divider} />

                {/* Category */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={navigateToSelectCategory}
                >
                  <View style={styles.itemLeft}>
                    {selectedCategory ? (
                      <>
                        <View
                          style={[
                            styles.categoryIcon,
                            {
                              backgroundColor:
                                selectedCategory.color || "#CCCCCC",
                            },
                          ]}
                        >
                          <Ionicons
                            name={(selectedCategory.icon as any) || "list"}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.itemText}>
                          {selectedCategory.name}
                        </Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.emptyCategoryIcon} />
                        <Text style={styles.placeholderText}>
                          Chọn danh mục
                        </Text>
                      </>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
                <View style={styles.divider} />

                {/* Note */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={navigateToAddNote}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.noteIcon}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color="#333333"
                      />
                    </View>
                    <Text
                      style={note ? styles.itemText : styles.placeholderText}
                    >
                      {note || "Thêm ghi chú"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
                <View style={styles.divider} />

                {/* Date */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.dateIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#333333"
                      />
                    </View>
                    <Text style={styles.itemText}>
                      {formatDate(selectedDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  amount && selectedCategory && selectedWallet
                    ? styles.saveButtonActive
                    : null,
                ]}
                onPress={handleSave}
                disabled={
                  saving || !(amount && selectedCategory && selectedWallet)
                }
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Date Picker */}
      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Hủy</Text>
                  </TouchableOpacity>

                  <Text style={styles.datePickerTitle}>Chọn Ngày</Text>

                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Xong</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    style={styles.iosDatePicker}
                    themeVariant="light"
                    textColor="#000000"
                    accentColor={colors.primary}
                  />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            accentColor={colors.primary}
          />
        ))}

      {/* Popup xác nhận xoá */}
      <CustomAlert
        visible={showDeleteModal}
        type="warning"
        title="Xóa Giao Dịch"
        message="Bạn có chắc chắn muốn xóa giao dịch này?"
        onClose={() => setShowDeleteModal(false)}
        showConfirmButton={true}
        confirmText={deleting ? "Đang xóa..." : "Xóa"}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await deleteTransaction(transactionId);
            ToastAndroid.show(
              "Đã xóa giao dịch thành công",
              ToastAndroid.SHORT
            );
            setShowDeleteModal(false);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting transaction:", error);
            ToastAndroid.show("Không thể xóa giao dịch", ToastAndroid.SHORT);
          } finally {
            setDeleting(false);
          }
        }}
        showCancelButton={true}
        cancelText="Hủy"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emptyCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEEEE",
    marginRight: 12,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 17,
    color: "#000000",
  },
  placeholderText: {
    fontSize: 17,
    color: "#AAAAAA",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 64,
  },
  amountContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  amountLabel: {
    fontSize: 15,
    color: "#888888",
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyContainer: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 17,
    color: "#000000",
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#DDDDDD",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  datePickerModal: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  datePickerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  datePickerContainer: {
    padding: 0,
    backgroundColor: "white",
    alignItems: "center",
    height: 250,
    width: "100%",
  },
  iosDatePicker: {
    width: "100%",
    height: 220,
    backgroundColor: "white",
  },
  connectionErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  connectionErrorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  connectionErrorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#00D09E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default EditTransactionScreen;
