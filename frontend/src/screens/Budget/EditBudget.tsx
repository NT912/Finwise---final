import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  Animated,
  ToastAndroid,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import * as budgetService from "../../services/budgetService";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "../../hooks/useWallet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatVND } from "../../utils/formatters";
import apiClient from "../../services/apiClient";
import Toast from "react-native-toast-message";

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

const EditBudget = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { budget } = route.params as { budget: any };
  const { wallets, getWallets } = useWallet();
  const [name, setName] = useState(budget.name);
  const [amount, setAmount] = useState(budget.amount.toString());
  const [startDate, setStartDate] = useState(new Date(budget.startDate));
  const [endDate, setEndDate] = useState(new Date(budget.endDate));
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedWallet, setSelectedWallet] = useState(budget.walletId);
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add states for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add animation values for delete modal
  const deleteModalScale = useRef(new Animated.Value(0.85)).current;
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Add new state for period selection
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Custom Date");

  // Fetch categories data when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!budget.categories || budget.categories.length === 0) return;

        // Debug: log giá trị thực tế của budget.categories
        console.log("DEBUG budget.categories:", budget.categories);

        // Lọc bỏ các categoryId không hợp lệ (object thì lấy _id, string thì giữ nguyên)
        const validCategoryIds = budget.categories
          .map((cat: any) => (typeof cat === "string" ? cat : cat?._id))
          .filter((id: any) => typeof id === "string" && id.trim() !== "");
        console.log("DEBUG validCategoryIds:", validCategoryIds);
        const categoryPromises = validCategoryIds.map(
          async (categoryId: string) => {
            const response = await apiClient.get(
              `/api/categories/${categoryId}`
            );
            return response.data;
          }
        );

        const categoriesData = await Promise.all(categoryPromises);
        setSelectedCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        ToastAndroid.show("Failed to load categories", ToastAndroid.SHORT)
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    getWallets();
  }, []);

  // Handle opening delete modal with animation
  const openDeleteConfirmation = () => {
    setShowDeleteModal(true);
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(deleteModalScale, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle closing delete modal with animation
  const closeDeleteConfirmation = () => {
    Animated.parallel([
      Animated.timing(deleteModalBackdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalScale, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteModal(false);
    });
  };

  // Function to execute delete
  const executeDelete = async () => {
    try {
      setDeleteLoading(true);

      // Thêm rung nhẹ cho hiệu ứng xóa
      Animated.sequence([
        Animated.timing(deleteModalScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await budgetService.deleteBudget(budget._id);
      await AsyncStorage.setItem("budgetNeedsRefresh", "true");

      setDeleteLoading(false);
      closeDeleteConfirmation();

      // Hiển thị thông báo thành công sau khi đóng modal
      setTimeout(() => {
        ToastAndroid.show("Budget deleted successfully", ToastAndroid.SHORT)
        navigation.goBack();
      }, 300);
    } catch (error: any) {
      ToastAndroid.show("Error deleting budget:", ToastAndroid.SHORT)
      setDeleteLoading(false);
      closeDeleteConfirmation();

      // Hiển thị thông báo lỗi sau khi đóng modal
      setTimeout(() => {
        ToastAndroid.show("Cannot delete budget. Please try again.", ToastAndroid.SHORT)

      }, 300);
    }
  };

  const handleUpdateBudget = async () => {
    try {
      // Validate inputs
      if (!name.trim()) {
         ToastAndroid.show("Please enter a budget name", ToastAndroid.SHORT)
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        ToastAndroid.show("Please enter a valid amount", ToastAndroid.SHORT)
        return;
      }

      if (startDate >= endDate) {
        ToastAndroid.show("End date must be after start date", ToastAndroid.SHORT)
        return;
      }

      // Kiểm tra xem có thay đổi gì không
      const hasChanges =
        name.trim() !== budget.name ||
        parseFloat(amount) !== budget.amount ||
        new Date(startDate).getTime() !==
        new Date(budget.startDate).getTime() ||
        new Date(endDate).getTime() !== new Date(budget.endDate).getTime() ||
        JSON.stringify(selectedCategories) !==
        JSON.stringify(budget.categories) ||
        selectedWallet !== budget.walletId;

      if (!hasChanges) {
        ToastAndroid.show("No changes to update", ToastAndroid.SHORT)
        return;
      }

      setLoading(true);
      setError(null);

      const updatedBudget = {
        name: name.trim(),
        amount: amountNum,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        categories: selectedCategories.map((c) => c._id),
        walletId: selectedWallet,
      };

      await budgetService.updateBudget(budget._id, updatedBudget);
      await AsyncStorage.setItem("budgetNeedsRefresh", "true");
      ToastAndroid.show("Budget updated successfully", ToastAndroid.SHORT)
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error("Error updating budget:", error);
      ToastAndroid.show("Failed to update budget", ToastAndroid.SHORT)
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Add function to handle period selection
  const handlePeriodSelection = (period: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
      case "This Month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "Next Month":
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        break;
      case "Quarter":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
        break;
      case "Half Year":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 6, 0);
        break;
      case "Year":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear() + 1, now.getMonth(), 0);
        break;
      case "Custom Start Date":
        setShowStartDatePicker(true);
        break;
      case "Custom End Date":
        setShowEndDatePicker(true);
        break;
      default:
        return;
    }

    if (period !== "Custom Start Date" && period !== "Custom End Date") {
      setStartDate(start);
      setEndDate(end);
      setSelectedPeriod(period);
    }
    setShowPeriodModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Please wait...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Budget</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={openDeleteConfirmation}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContainer}>
          <View style={styles.budgetCard}>
            {/* Category Section First */}
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => {
                navigation.navigate("SelectCategory" as any, {
                  type: "expense",
                  listenerId: `edit_budget_${budget._id}`,
                  selectedCategories: selectedCategories.map((c) => c._id),
                });
              }}
            >
              <View style={styles.itemLeft}>
                {selectedCategories && selectedCategories.length > 0 ? (
                  <>
                    <View style={styles.categoriesContainer}>
                      {selectedCategories.map(
                        (category: Category, index: number) => (
                          <View key={category._id} style={styles.categoryItem}>
                            <View
                              style={[
                                styles.categoryIcon,
                                {
                                  backgroundColor: category.color || "#CCCCCC",
                                },
                              ]}
                            >
                              <Ionicons
                                name={(category.icon as any) || "grid-outline"}
                                size={20}
                                color="#FFFFFF"
                              />
                            </View>
                            <Text style={styles.categoryName}>
                              {category.name}
                            </Text>
                            {index < selectedCategories.length - 1 && (
                              <Text style={styles.categorySeparator}>, </Text>
                            )}
                          </View>
                        )
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.emptyCategoryIcon}>
                      <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.placeholderText}>Select category</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Amount Section Second */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Budget Amount</Text>
              <View style={styles.amountInputRow}>
                <View style={styles.currencyContainer}>
                  <Text style={styles.currencyText}>VND</Text>
                </View>
                <TextInput
                  style={styles.amountInput}
                  value={formatVND(parseFloat(amount))}
                  onChangeText={(text) =>
                    setAmount(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Enter amount"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Date Section */}
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => setShowPeriodModal(true)}
            >
              <View style={styles.itemLeft}>
                <View style={styles.dateIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.dateLabel}>Time Period</Text>
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString()} -{" "}
                    {endDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Wallet Section Last */}
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => {
                navigation.navigate("SelectWallet" as any, {
                  selectedWalletId: selectedWallet,
                });
              }}
            >
              <View style={styles.itemLeft}>
                {wallets.find((w) => w._id === selectedWallet) ? (
                  <>
                    <View
                      style={[
                        styles.walletIcon,
                        {
                          backgroundColor:
                            wallets.find((w) => w._id === selectedWallet)
                              ?.color || colors.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          (wallets.find((w) => w._id === selectedWallet)
                            ?.icon as any) || "wallet-outline"
                        }
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.itemText}>
                      {wallets.find((w) => w._id === selectedWallet)?.name}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="wallet-outline"
                        size={20}
                        color="#333333"
                      />
                    </View>
                    <Text style={styles.placeholderText}>Select wallet</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!amount || !selectedWallet || !selectedCategories?.length) &&
              styles.updateButtonDisabled,
            ]}
            onPress={handleUpdateBudget}
            disabled={
              !amount ||
              !selectedWallet ||
              !selectedCategories?.length ||
              loading
            }
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Budget</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.periodModalContent}>
            <View style={styles.periodModalHeader}>
              <Text style={styles.periodModalTitle}>Select Period</Text>
              <TouchableOpacity
                onPress={() => setShowPeriodModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {[
              {
                id: "thisMonth",
                title: "This Month",
                subtitle: "Current month budget period",
                icon: "calendar",
                color: "#4CAF50",
              },
              {
                id: "nextMonth",
                title: "Next Month",
                subtitle: "Plan ahead for next month",
                icon: "calendar",
                color: "#2196F3",
              },
              {
                id: "quarter",
                title: "Quarter",
                subtitle: "Three month period",
                icon: "calendar",
                color: "#9C27B0",
              },
              {
                id: "halfYear",
                title: "Half Year",
                subtitle: "Six month period",
                icon: "calendar",
                color: "#FF9800",
              },
              {
                id: "year",
                title: "Year",
                subtitle: "Full year budget",
                icon: "calendar",
                color: "#F44336",
              },
              {
                id: "customStartDate",
                title: "Custom Start Date",
                subtitle: `Current: ${startDate.toLocaleDateString()}`,
                icon: "calendar",
                color: "#607D8B",
              },
              {
                id: "customEndDate",
                title: "Custom End Date",
                subtitle: `Current: ${endDate.toLocaleDateString()}`,
                icon: "calendar",
                color: "#795548",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.periodOption}
                onPress={() => handlePeriodSelection(item.title)}
              >
                <View
                  style={[
                    styles.periodIconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.periodTextContainer}>
                  <Text style={styles.periodTitle}>{item.title}</Text>
                  <Text style={styles.periodSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal for iOS */}
      {Platform.OS === "ios" && showStartDatePicker && (
        <Modal
          visible={showStartDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStartDatePicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Cancel</Text>
                </TouchableOpacity>

                <Text style={styles.datePickerTitle}>Select Start Date</Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(true);
                  }}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "ios" && showEndDatePicker && (
        <Modal
          visible={showEndDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEndDatePicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowEndDatePicker(false);
                    setShowStartDatePicker(true);
                  }}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.datePickerTitle}>Select End Date</Text>

                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(false)}
                  style={styles.datePickerButton}
                >
                  <Text style={styles.datePickerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
                minimumDate={startDate}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Pickers */}
      {Platform.OS === "android" && showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              setShowEndDatePicker(true);
            }
          }}
        />
      )}

      {Platform.OS === "android" && showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
          minimumDate={startDate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDeleteConfirmation}
      >
        <View style={styles.deleteModalContainer}>
          <Animated.View
            style={[
              styles.deleteModalContent,
              {
                opacity: deleteModalOpacity,
                transform: [{ scale: deleteModalScale }],
              },
            ]}
          >
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={32} color="#FF6B6B" />
              <Text style={styles.deleteModalTitle}>Delete Budget</Text>
            </View>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={closeDeleteConfirmation}
                disabled={deleteLoading}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={executeDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 0 : 40,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  mainContainer: {
    padding: 20,
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoriesContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: "#333333",
  },
  categorySeparator: {
    fontSize: 16,
    color: "#999999",
    marginLeft: 4,
  },
  emptyCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#AAAAAA",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 16,
  },
  amountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#333333",
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
  },
  deleteModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  deleteModalCancelText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteModalConfirmText: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  periodModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  periodModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  periodModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 5,
  },
  periodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  periodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  periodTextContainer: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  periodSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
});

export default EditBudget;
