import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../theme";
import {
  addListener,
  categorySelectEventKey,
} from "../Category/SelectCategoryScreen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import apiClient from "../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../../config/config";
import { parseCurrency } from "../../utils/formatters";
import * as categoryService from "../../services/categoryService";
import { Category } from "../../types/category";
import * as walletService from "../../services/walletService";
import CustomAlert from "../../components/common/CustomAlert";

// Định nghĩa params chỉ nhận budgetId
type EditBudgetRouteParams = { budgetId: string };
type EditBudgetScreenRouteProp = RouteProp<
  { EditBudget: EditBudgetRouteParams },
  "EditBudget"
>;
type EditBudgetScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const EditBudgetScreen = () => {
  const navigation = useNavigation<EditBudgetScreenNavigationProp>();
  const route = useRoute<EditBudgetScreenRouteProp>();
  const { budgetId } = route.params;
  // Create a unique listener ID
  const categoryListenerIdRef = useRef(`edit_budget_${Date.now()}`);

  // State khởi tạo rỗng, set sau khi fetch thành công
  const [budget, setBudget] = useState<any>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<{
    _id: string;
    color: string;
    icon: string;
    name: string;
  } | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedType, setSelectedType] = useState("Total");
  const [repeatBudget, setRepeatBudget] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<"start" | "end">(
    "start"
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState<
    Record<string, Category>
  >({});
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [tempSelectedWallet, setTempSelectedWallet] = useState<any | null>(
    null
  );
  const [originalBudget, setOriginalBudget] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch budget data on mount
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem(config.auth.tokenKey);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get(`/api/budgets/${budgetId}`, {
          headers,
        });
        if (response.status === 200) {
          const budgetData = response.data;
          setBudget(budgetData);
          setOriginalBudget(budgetData);
          setName(budgetData.name);
          setAmount(budgetData.amount.toString());
          setStartDate(new Date(budgetData.startDate));
          setEndDate(new Date(budgetData.endDate));
          const filteredCategories = (budgetData.categories || []).filter(
            (id: any) => typeof id === "string" && id && id !== "undefined"
          );
          setSelectedCategories(filteredCategories);
          // Fetch wallet details
          const walletResponse = await apiClient.get(
            `/api/wallets/${budgetData.walletId}`,
            { headers }
          );
          if (walletResponse.status === 200) {
            const walletData = walletResponse.data;
            setSelectedWallet({
              _id: walletData.walletId,
              color: walletData.color,
              icon: walletData.icon,
              name: walletData.name,
            });
          } else {
            setSelectedWallet({
              _id: budgetData.walletId,
              color: "#F0F0F0",
              icon: "wallet-outline",
              name: "Unknown Wallet",
            });
          }
          setRepeatBudget(budgetData.isRecurring || false);
          const formattedStart = new Date(
            budgetData.startDate
          ).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
          const formattedEnd = new Date(budgetData.endDate).toLocaleDateString(
            "en-GB",
            { day: "2-digit", month: "2-digit" }
          );
          setSelectedPeriod(`${formattedStart} - ${formattedEnd}`);
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu ngân sách.");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [budgetId]);

  // Add useEffect to fetch category details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      const details: Record<string, Category> = {};
      for (const id of selectedCategories) {
        try {
          const category = await categoryService.getCategoryById(id);
          details[id] = category;
        } catch (error) {
          console.error(`Error fetching category ${id}:`, error);
        }
      }
      setCategoryDetails(details);
    };

    if (selectedCategories.length > 0) {
      fetchCategoryDetails();
    }
  }, [selectedCategories]);

  // Set up category selection listener
  useEffect(() => {
    const cleanup = addListener(
      `${categorySelectEventKey}_${categoryListenerIdRef.current}`,
      (category: Category) => handleSelectCategory(category)
    );
    return cleanup;
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

  // Handle category selection
  const handleSelectCategory = (category: Category) => {
    setSelectedCategories(
      [category._id].filter(
        (id) => typeof id === "string" && id && id !== "undefined"
      )
    );
  };

  // Navigate to select category screen
  const navigateToSelectCategory = () => {
    // Navigate to category selection screen
    navigation.navigate("SelectCategory" as any, {
      type: "expense", // Default to expense type for budgets
      listenerId: categoryListenerIdRef.current,
      onSelect: (category: Category) => {
        handleSelectCategory(category);
        navigation.goBack(); // Navigate back after selection
      },
    });
  };

  // Handle date picker actions
  const handleDatePickerPress = (type: "start" | "end") => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (datePickerType === "start") {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setShowDatePicker(false);

      // Update period display
      const formattedStart = selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      const formattedEnd = endDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      setSelectedPeriod(`${formattedStart} - ${formattedEnd}`);
    }
  };

  // Handle period selection
  const navigateToSelectPeriod = () => {
    // Show date picker menu with options
    Alert.alert("Chọn Khoảng Thời Gian", "Chọn khoảng thời gian ngân sách", [
      {
        text: "Tháng này",
        onPress: () => {
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
          setSelectedPeriod("Tháng này (01/05 - 31/05)");
        },
      },
      {
        text: "Tháng tới",
        onPress: () => {
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
          setSelectedPeriod("Tháng tới");
        },
      },
      {
        text: "Ngày bắt đầu tùy chỉnh",
        onPress: () => handleDatePickerPress("start"),
      },
      {
        text: "Ngày kết thúc tùy chỉnh",
        onPress: () => handleDatePickerPress("end"),
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  // Handle type selection
  const navigateToSelectType = () => {
    // Navigate to type selection screen
    Alert.alert("Loại Ngân Sách", "Chọn loại ngân sách", [
      {
        text: "Tổng Ngân Sách",
        onPress: () => setSelectedType("Total"),
      },
      {
        text: "Ngân Sách Danh Mục",
        onPress: () => setSelectedType("Category"),
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  // Toggle repeat budget
  const toggleRepeatBudget = () => {
    setRepeatBudget(!repeatBudget);
  };

  // Helper to get current budget data in the same structure as originalBudget
  const getCurrentBudgetData = () => ({
    name,
    amount: parseCurrency(amount),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    categories: [...selectedCategories].sort(),
    walletId: selectedWallet?._id || originalBudget.walletId,
  });

  const handleUpdateBudget = async () => {
    const current = getCurrentBudgetData();
    const original = {
      name: originalBudget.name,
      amount: originalBudget.amount,
      startDate: new Date(originalBudget.startDate).toISOString(),
      endDate: new Date(originalBudget.endDate).toISOString(),
      categories: [...(originalBudget.categories || [])].sort(),
      walletId: originalBudget.walletId,
    };
    const isUnchanged =
      current.name === original.name &&
      current.amount === original.amount &&
      current.startDate === original.startDate &&
      current.endDate === original.endDate &&
      JSON.stringify(current.categories) ===
        JSON.stringify(original.categories) &&
      current.walletId === original.walletId;
    if (isUnchanged) {
      ToastAndroid.show(
        "Không có thay đổi, Không có gì để cập nhật",
        ToastAndroid.SHORT
      );

      setSaving(false);
      return;
    }

    try {
      if (
        !name ||
        !amount ||
        !startDate ||
        !endDate ||
        selectedCategories.length === 0
      ) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }

      if (startDate > endDate) {
        Alert.alert("Lỗi", "Ngày bắt đầu không thể sau ngày kết thúc");
        return;
      }

      setSaving(true);
      const token = await AsyncStorage.getItem(config.auth.tokenKey);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await apiClient.put(
        `/api/budgets/${budgetId}`,
        {
          name,
          amount: parseCurrency(amount),
          startDate,
          endDate,
          categories: selectedCategories,
          walletId: selectedWallet?._id || "",
        },
        { headers }
      );

      if (response.status === 200) {
        ToastAndroid.show("Cập nhật ngân sách thành công", ToastAndroid.SHORT);

        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Lỗi", "Không thể cập nhật ngân sách. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Update the wallet selection logic
  const handleSelectWallet = (wallet: {
    _id: string;
    color: string;
    icon: string;
    name: string;
  }) => {
    setSelectedWallet(wallet);
  };

  // Fetch wallets when modal opens
  useEffect(() => {
    if (showWalletModal) {
      setLoadingWallets(true);
      walletService
        .fetchWallets()
        .then((fetchedWallets) => {
          setWallets(fetchedWallets);
          // Set temp to current selected
          setTempSelectedWallet(selectedWallet);
        })
        .catch((e) => setWallets([]))
        .finally(() => setLoadingWallets(false));
    }
  }, [showWalletModal]);

  // Update handleDelete to show the custom modal
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
        translucent
      />

      <SafeAreaView style={{ flex: 0, backgroundColor: colors.primary }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh Sửa Ngân Sách</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
              <View style={styles.mainContainer}>
                <View style={styles.budgetCard}>
                  {/* Budget Name */}
                  <View style={styles.cardRow}>
                    <View
                      style={[styles.cardIcon, { backgroundColor: "#F5F5F7" }]}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={22}
                        color="#636e72"
                      />
                    </View>
                    <View style={styles.nameInputGroup}>
                      <Text style={styles.nameInputLabel}>Tên Ngân Sách</Text>
                      <View style={styles.nameInputBox}>
                        <TextInput
                          style={styles.nameInput}
                          value={name}
                          onChangeText={setName}
                          placeholder="Nhập tên ngân sách"
                          placeholderTextColor="#BDBDBD"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Category Selection */}
                  <TouchableOpacity
                    style={styles.cardRow}
                    onPress={navigateToSelectCategory}
                  >
                    <View
                      style={[
                        styles.cardIcon,
                        categoryDetails[selectedCategories[0]]?.color
                          ? {
                              backgroundColor:
                                categoryDetails[selectedCategories[0]].color,
                            }
                          : null,
                      ]}
                    >
                      <Ionicons
                        name={
                          (categoryDetails[selectedCategories[0]]
                            ?.icon as any) || "grid-outline"
                        }
                        size={24}
                        color={
                          selectedCategories.length > 0 ? "#FFFFFF" : "#BDBDBD"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.cardText,
                        selectedCategories.length === 0 && { color: "#BDBDBD" },
                      ]}
                    >
                      {selectedCategories.length > 0
                        ? categoryDetails[selectedCategories[0]]?.name
                        : "Chọn danh mục"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#BDBDBD"
                    />
                  </TouchableOpacity>

                  {/* Amount Input */}
                  <View style={styles.cardRow}>
                    <View
                      style={[styles.cardIcon, { backgroundColor: "#E8F8F3" }]}
                    >
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
                    <View
                      style={[styles.cardIcon, { backgroundColor: "#F5F5F5" }]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#0984E3"
                      />
                    </View>
                    <Text style={styles.cardText}>{selectedPeriod}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#BDBDBD"
                    />
                  </TouchableOpacity>

                  {/* Wallet Selection */}
                  <TouchableOpacity
                    style={styles.cardRow}
                    onPress={() =>
                      navigation.navigate("SelectWallet", {
                        selectedWalletId: selectedWallet?._id,
                        onSelectWallet: (wallet: any) => {
                          setSelectedWallet(wallet);
                        },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.cardIcon,
                        selectedWallet
                          ? { backgroundColor: selectedWallet.color }
                          : { backgroundColor: "#F0F0F0" },
                      ]}
                    >
                      <Ionicons
                        name={
                          selectedWallet
                            ? (selectedWallet.icon as any)
                            : "wallet-outline"
                        }
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
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#BDBDBD"
                    />
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.bottomContainer}>
                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      amount && parseInt(amount, 10) > 0 && !saving
                        ? styles.saveButtonActive
                        : styles.saveButtonInactive,
                    ]}
                    onPress={handleUpdateBudget}
                    disabled={!amount || parseInt(amount, 10) <= 0 || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Cập Nhật</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>

        {/* Date Picker for iOS */}
        {showDatePicker && Platform.OS === "ios" && (
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
                <DateTimePicker
                  value={datePickerType === "start" ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={datePickerType === "start" ? startDate : endDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showPeriodModal && (
          <Modal
            visible={showPeriodModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPeriodModal(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowPeriodModal(false)}>
              <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerHeader}>
                      <Text style={styles.datePickerTitle}>
                        Chọn Khoảng Thời Gian
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowPeriodModal(false)}
                        style={styles.datePickerButton}
                      >
                        <Ionicons name="close" size={24} color="#333333" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={{ padding: 16 }}>
                      {/* This Month */}
                      <TouchableOpacity
                        style={styles.selectButton}
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
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Tháng này</Text>
                        {selectedPeriod.includes("Tháng này") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Next Month */}
                      <TouchableOpacity
                        style={styles.selectButton}
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
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Tháng tới</Text>
                        {selectedPeriod.includes("Tháng tới") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Quarter */}
                      <TouchableOpacity
                        style={styles.selectButton}
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
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Quý</Text>
                        {selectedPeriod.includes("Quý") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Half year */}
                      <TouchableOpacity
                        style={styles.selectButton}
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
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Nửa năm</Text>
                        {selectedPeriod.includes("Nửa năm") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Year */}
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => {
                          const today = new Date();
                          const startOfYear = new Date(
                            today.getFullYear(),
                            0,
                            1
                          );
                          const endOfYear = new Date(
                            today.getFullYear(),
                            11,
                            31
                          );
                          setStartDate(startOfYear);
                          setEndDate(endOfYear);
                          setSelectedPeriod(
                            `Năm (${startOfYear.getDate()}/${
                              startOfYear.getMonth() + 1
                            } - ${endOfYear.getDate()}/${
                              endOfYear.getMonth() + 1
                            })`
                          );
                          setShowPeriodModal(false);
                        }}
                      >
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Năm</Text>
                        {selectedPeriod.includes("Năm") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                      {/* Custom */}
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => {
                          setShowCustomDateModal(true);
                          setShowPeriodModal(false);
                        }}
                      >
                        <View style={styles.periodIcon}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#666"
                          />
                        </View>
                        <Text style={styles.selectButtonText}>Tùy chỉnh</Text>
                        {selectedPeriod.includes("Tùy chỉnh") && (
                          <View style={styles.periodItemCheck}>
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {showCustomDateModal && (
          <Modal
            visible={showCustomDateModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCustomDateModal(false)}
          >
            <View style={styles.modalBackdrop}>
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
            </View>
          </Modal>
        )}

        <CustomAlert
          visible={showDeleteModal}
          type="warning"
          title="Delete Budget"
          message="Are you sure you want to delete this budget?"
          onClose={() => setShowDeleteModal(false)}
          showConfirmButton={true}
          confirmText="Delete"
          onConfirm={async () => {
            setShowDeleteModal(false);
            try {
              setDeleting(true);
              const token = await AsyncStorage.getItem(config.auth.tokenKey);
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const response = await apiClient.delete(
                `/api/budgets/${budgetId}`,
                { headers }
              );
              if (response.status === 200) {
                ToastAndroid.show(
                  "Budget deleted successfully",
                  ToastAndroid.SHORT
                );

                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting budget:", error);
              ToastAndroid.show(
                "Failed to delete budget. Please try again.",
                ToastAndroid.SHORT
              );
            } finally {
              setDeleting(false);
            }
          }}
          showCancelButton={true}
          cancelText="Cancel"
        />
      </SafeAreaView>
    </>
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
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 40,
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: "98%",
    alignSelf: "center",
    marginTop: 8,
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
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 0,
    marginTop: "auto",
    marginBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    paddingHorizontal: 24,
    marginLeft: 32,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  saveButtonInactive: {
    backgroundColor: "#CCCCCC",
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  datePickerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  datePicker: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
  selectButtonText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
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
  periodInfo: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  nameInputGroup: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 8,
    marginBottom: 24,
  },
  nameInputLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
    fontWeight: "500",
  },
  nameInputBox: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nameInput: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  periodItemCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default EditBudgetScreen;
