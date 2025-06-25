import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types/category";
import {
  formatVND,
  formatNumberWithCommas,
  parseFormattedNumber,
} from "../../utils/formatters";

interface CategoryBudgetModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (budget: number) => void;
}

const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  visible,
  category,
  onClose,
  onSave,
}) => {
  const [budget, setBudget] = useState<string>(
    category?.budget ? formatNumberWithCommas(category.budget.toString()) : "0"
  );

  const handleSave = () => {
    const numericBudget = parseFormattedNumber(budget);
    if (!isNaN(numericBudget)) {
      onSave(numericBudget);
    }
  };

  const handleTextChange = (text: string) => {
    // Format the input as the user types
    const formattedText = formatNumberWithCommas(text);
    setBudget(formattedText);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Budget</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category?.color || "#FF6B6B" },
                  ]}
                >
                  <Ionicons
                    name={category?.icon || "cart"}
                    size={24}
                    color="#FFF"
                  />
                </View>
                <Text style={styles.categoryName}>{category?.name}</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ngân sách hàng tháng</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>₫</Text>
                  <TextInput
                    style={styles.input}
                    value={budget}
                    onChangeText={handleTextChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                    autoFocus={true}
                  />
                </View>
                <Text style={styles.formattedValue}>
                  {formatVND(parseFormattedNumber(budget))}
                </Text>
                <Text style={styles.helperText}>
                  Nhập số tiền bạn muốn đặt làm ngân sách cho danh mục này
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Lưu ngân sách</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#00D09E",
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  formattedValue: {
    fontSize: 18,
    color: "#00D09E",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "right",
  },
  helperText: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
});

export default CategoryBudgetModal;
