import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  ToastAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../theme";
import { formatVND } from "../../utils/formatters";
import { BudgetStackParamList, TabParamList } from "../../navigation/types";
import apiClient from "../../services/apiClient";
import * as walletService from "../../services/walletService";
import { Category } from "../../types/category";
import { config } from "../../config/config";

type CreateBudgetScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<BudgetStackParamList, "CreateBudget">,
  BottomTabNavigationProp<TabParamList>
>;

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isIncludedInTotal?: boolean;
}

const CreateBudgetScreen = () => {
  const navigation = useNavigation<CreateBudgetScreenNavigationProp>();
  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    "This month (01/05 - 31/05)"
  );
  const [repeatBudget, setRepeatBudget] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [notes, setNotes] = useState("");
  const [notificationThreshold, setNotificationThreshold] = useState(80);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // UI state
  const [loading, setLoading] = useState(false);

  // Add temp state for custom date selection
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Fetch wallets on mount
  useEffect(() => {
    const fetchWallets = async () => {
      setLoadingWallets(true);
      try {
        const fetchedWallets = await walletService.fetchWallets();
        setWallets(fetchedWallets);

        // Set default wallet if available
        const defaultWallet = fetchedWallets.find((w) => w.isDefault);
        if (defaultWallet) {
          setSelectedWallet(defaultWallet);
        } else if (fetchedWallets.length > 0) {
          setSelectedWallet(fetchedWallets[0]);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
      } finally {
        setLoadingWallets(false);
      }
    };

    fetchWallets();
  }, []);

  // Format amount with dots separator
  const formatAmountWithDots = (value: string): string => {
    if (!value) return "";
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/\./g, "");
    setAmount(cleanValue);
  };

  // Navigate to select category screen
  const navigateToSelectCategories = () => {
    navigation.navigate("SelectCategory", {
      type: "expense",
      selectedCategoryId: selectedCategories[0],
      onSelectCategory: (category: Category) => {
        setSelectedCategories([category._id]);
        setSelectedCategory(category);
      },
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (!amount || parseInt(amount) <= 0) {
        ToastAndroid.show("Vui lòng nhập số tiền hợp lệ", ToastAndroid.SHORT);

        return;
      }

      if (selectedCategories.length === 0) {
        ToastAndroid.show(
          "Vui lòng chọn ít nhất một danh mục",
          ToastAndroid.SHORT
        );

        return;
      }

      if (!selectedWallet) {
        ToastAndroid.show("Vui lòng chọn ví", ToastAndroid.SHORT);

        return;
      }

      setSaving(true);

      const cleanedCategories = selectedCategories.filter(
        (id: any) => typeof id === "string" && id && id !== "undefined"
      );
      const budgetData = {
        name:
          name ||
          (selectedCategory
            ? `Ngân sách cho ${selectedCategory.name}`
            : `Ngân sách cho ${cleanedCategories.length} danh mục`),
        amount: parseInt(amount),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        categories: cleanedCategories,
        walletId: selectedWallet._id,
        isRecurring: repeatBudget,
        recurringFrequency,
        notificationThreshold,
        notes,
      };

      const token = await AsyncStorage.getItem(config.auth.tokenKey);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await apiClient.post("/api/budgets", budgetData, {
        headers,
      });

      if (response.status === 201) {
        ToastAndroid.show("Tạo ngân sách thành công", ToastAndroid.SHORT);
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      ToastAndroid.show("Không thể tạo ngân sách", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header with curved bottom corners */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Ngân Sách</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
        >
          <View style={styles.budgetCard}>
            {/* Category Selection */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={navigateToSelectCategories}
            >
              <View
                style={[
                  styles.cardIcon,
                  selectedCategory?.color
                    ? { backgroundColor: selectedCategory.color }
                    : null,
                ]}
              >
                <Ionicons
                  name={(selectedCategory?.icon as any) || "grid-outline"}
                  size={24}
                  color={selectedCategory ? "#FFFFFF" : "#BDBDBD"}
                />
              </View>
              <Text
                style={[
                  styles.cardText,
                  !selectedCategory && { color: "#BDBDBD" },
                ]}
              >
                {selectedCategory ? selectedCategory.name : "Chọn danh mục"}
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
            </TouchableOpacity>

            {/* Amount Input */}
            <View style={styles.cardRow}>
              <View style={[styles.cardIcon, { backgroundColor: "#E8F8F3" }]}>
                <Ionicons name="cash-outline" size={24} color="#00B894" />
              </View>
              <View style={styles.amountInputGroup}>
                <Text style={styles.amountInputLabel}>Số Tiền</Text>
                <View style={styles.amountInputBox}>
                  <Text style={styles.currencyText}>VND</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={formatAmountWithDots(amount)}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#BDBDBD"
                  />
                </View>
              </View>
            </View>

            {/* Period Selection */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => setShowPeriodModal(true)}
            >
              <View style={[styles.cardIcon, { backgroundColor: "#F5F5F5" }]}>
                <Ionicons name="calendar-outline" size={24} color="#0984E3" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardText}>Khoảng Thời Gian</Text>
                <Text style={styles.periodInfo}>{selectedPeriod}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
            </TouchableOpacity>

            {/* Wallet Selection */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() =>
                navigation.navigate("SelectWallet", {
                  selectedWalletId: selectedWallet?._id,
                  onSelectWallet: (wallet: Wallet) => {
                    setSelectedWallet(wallet);
                  },
                })
              }
            >
              <View
                style={[
                  styles.cardIcon,
                  selectedWallet?.color
                    ? { backgroundColor: selectedWallet.color }
                    : { backgroundColor: "#F0F0F0" },
                ]}
              >
                <Ionicons
                  name={(selectedWallet?.icon as any) || "wallet-outline"}
                  size={24}
                  color={selectedWallet ? "#FFFFFF" : "#BDBDBD"}
                />
              </View>
              <Text
                style={[
                  styles.cardText,
                  !selectedWallet && { color: "#BDBDBD" },
                ]}
              >
                {selectedWallet ? selectedWallet.name : "Chọn ví"}
              </Text>
              <Ionicons name="chevron-forward" size={22} color="#BDBDBD" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button at Bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              (!amount || !selectedWallet || !selectedCategories.length) &&
                styles.saveButtonDisabled,
            ]}
            disabled={!amount || !selectedWallet || !selectedCategories.length}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPeriodModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn Khoảng Thời Gian</Text>
                  <TouchableOpacity
                    onPress={() => setShowPeriodModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#333333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.periodList}>
                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      const today = new Date();
                      const startOfMonth = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      );
                      const endOfMonth = new Date(
                        today.getFullYear(),
                        today.getMonth() + 1,
                        0
                      );
                      setStartDate(startOfMonth);
                      setEndDate(endOfMonth);
                      setSelectedPeriod(
                        `Tháng này (${startOfMonth.getDate()}/${
                          startOfMonth.getMonth() + 1
                        } - ${endOfMonth.getDate()}/${
                          endOfMonth.getMonth() + 1
                        })`
                      );
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Tháng này</Text>
                    {selectedPeriod.includes("Tháng này") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      const today = new Date();
                      const startOfNextMonth = new Date(
                        today.getFullYear(),
                        today.getMonth() + 1,
                        1
                      );
                      const endOfNextMonth = new Date(
                        today.getFullYear(),
                        today.getMonth() + 2,
                        0
                      );
                      setStartDate(startOfNextMonth);
                      setEndDate(endOfNextMonth);
                      setSelectedPeriod(
                        `Tháng tới (${startOfNextMonth.getDate()}/${
                          startOfNextMonth.getMonth() + 1
                        } - ${endOfNextMonth.getDate()}/${
                          endOfNextMonth.getMonth() + 1
                        })`
                      );
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Tháng tới</Text>
                    {selectedPeriod.includes("Tháng tới") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      const today = new Date();
                      const startOfQuarter = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      );
                      const endOfQuarter = new Date(
                        today.getFullYear(),
                        today.getMonth() + 3,
                        0
                      );
                      setStartDate(startOfQuarter);
                      setEndDate(endOfQuarter);
                      setSelectedPeriod(
                        `Quý (${startOfQuarter.getDate()}/${
                          startOfQuarter.getMonth() + 1
                        } - ${endOfQuarter.getDate()}/${
                          endOfQuarter.getMonth() + 1
                        })`
                      );
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Quý</Text>
                    {selectedPeriod.includes("Quý") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      const today = new Date();
                      const startOfHalfYear = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      );
                      const endOfHalfYear = new Date(
                        today.getFullYear(),
                        today.getMonth() + 6,
                        0
                      );
                      setStartDate(startOfHalfYear);
                      setEndDate(endOfHalfYear);
                      setSelectedPeriod(
                        `Nửa năm (${startOfHalfYear.getDate()}/${
                          startOfHalfYear.getMonth() + 1
                        } - ${endOfHalfYear.getDate()}/${
                          endOfHalfYear.getMonth() + 1
                        })`
                      );
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Nửa năm</Text>
                    {selectedPeriod.includes("Nửa năm") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      const today = new Date();
                      const startOfYear = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      );
                      const endOfYear = new Date(
                        today.getFullYear(),
                        today.getMonth() + 12,
                        0
                      );
                      setStartDate(startOfYear);
                      setEndDate(endOfYear);
                      setSelectedPeriod(
                        `Năm (${startOfYear.getDate()}/${
                          startOfYear.getMonth() + 1
                        } - ${endOfYear.getDate()}/${endOfYear.getMonth() + 1})`
                      );
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Năm</Text>
                    {selectedPeriod.includes("Năm") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.periodItem}
                    onPress={() => {
                      setTempStartDate(startDate);
                      setTempEndDate(endDate);
                      setShowCustomDateModal(true);
                      setShowPeriodModal(false);
                    }}
                  >
                    <View style={styles.periodItemIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#666"
                      />
                    </View>
                    <Text style={styles.periodItemText}>Tùy chỉnh</Text>
                    {selectedPeriod.includes("Tùy chỉnh") && (
                      <View style={styles.periodItemCheck}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom Date Modal */}
      {showCustomDateModal && (
        <Modal
          visible={showCustomDateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomDateModal(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setShowCustomDateModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() => setShowCustomDateModal(false)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>
                      Khoảng Thời Gian Tùy Chỉnh
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (tempStartDate && tempEndDate) {
                          setStartDate(tempStartDate);
                          setEndDate(tempEndDate);
                          setSelectedPeriod(
                            `Tùy chỉnh (${tempStartDate.getDate()}/${
                              tempStartDate.getMonth() + 1
                            } - ${tempEndDate.getDate()}/${
                              tempEndDate.getMonth() + 1
                            })`
                          );
                        }
                        setShowCustomDateModal(false);
                      }}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerButtonText}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 16,
                    }}
                  >
                    {/* Start Date */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F7F7F7",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        marginRight: 8,
                      }}
                      onPress={() => setDatePickerType("start")}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#0984E3"
                        style={{ marginRight: 8 }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 2,
                          }}
                        >
                          Start Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#222",
                            fontWeight: "500",
                          }}
                        >
                          {tempStartDate
                            ? tempStartDate.toLocaleDateString()
                            : "Select"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {/* End Date */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F7F7F7",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        marginLeft: 8,
                      }}
                      onPress={() => setDatePickerType("end")}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#0984E3"
                        style={{ marginRight: 8 }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 2,
                          }}
                        >
                          End Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#222",
                            fontWeight: "500",
                          }}
                        >
                          {tempEndDate
                            ? tempEndDate.toLocaleDateString()
                            : "Select"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {/* DateTimePicker for iOS/Android */}
                  {(datePickerType === "start" || datePickerType === "end") && (
                    <DateTimePicker
                      value={
                        datePickerType === "start"
                          ? tempStartDate || new Date()
                          : tempEndDate || new Date()
                      }
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          if (datePickerType === "start") {
                            setTempStartDate(selectedDate);
                          } else {
                            setTempEndDate(selectedDate);
                          }
                        }
                      }}
                      minimumDate={
                        datePickerType === "end" && tempStartDate
                          ? tempStartDate
                          : undefined
                      }
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  periodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  periodInfo: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  amountInputGroup: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 8,
  },
  amountInputLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
    fontWeight: "500",
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: "#222",
    fontWeight: "bold",
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  currencyText: {
    fontSize: 16,
    color: "#00B894",
    fontWeight: "600",
    marginRight: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 4,
  },
  periodList: {
    padding: 16,
  },
  periodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  periodItemText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  periodItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  periodItemCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerModal: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  datePickerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#666666",
  },
  doneButtonText: {
    color: colors.primary,
  },
  datePickerContent: {
    padding: 16,
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  dateInputValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  dateInputTouchable: {
    flex: 1,
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
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: "92%",
    alignSelf: "center",
    marginTop: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
});

export default CreateBudgetScreen;
