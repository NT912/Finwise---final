import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORY_COLORS } from "../../utils/categoryColors";
import { IconName } from "../../types";

interface CategoryFormModalProps {
  visible: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSave: () => void;
  name: string;
  onNameChange: (text: string) => void;
  icon: IconName;
  onIconChange: (icon: IconName) => void;
  color: string;
  onColorChange: (color: string) => void;
  iconPickerVisible: boolean;
  onIconPickerToggle: () => void;
  colorPickerVisible: boolean;
  onColorPickerToggle: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  mode,
  onClose,
  onSave,
  name,
  onNameChange,
  icon,
  onIconChange,
  color,
  onColorChange,
  iconPickerVisible,
  onIconPickerToggle,
  colorPickerVisible,
  onColorPickerToggle,
}) => {
  const handleClose = () => {
    console.log("Closing form modal");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Category</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Write..."
                  value={name}
                  onChangeText={onNameChange}
                  placeholderTextColor="#ADB5BD"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 30,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    fontSize: 16,
    color: "#495057",
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D09E",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    width: "100%",
    backgroundColor: "#F1F8F5",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ADB5BD",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CategoryFormModal;
