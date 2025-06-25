import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

// Bảng màu cho danh mục
const CATEGORY_COLORS = [
  "#3D5A80", // Blue
  "#4CAF50", // Green
  "#FFC107", // Yellow
  "#FF5722", // Orange
  "#9C27B0", // Purple
  "#F44336", // Red
  "#2196F3", // Light Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#00ACC1", // Cyan
  "#FF9800", // Dark Orange
  "#FF4081", // Pink Accent
  "#7C4DFF", // Deep Purple Accent
  "#448AFF", // Blue Accent
  "#40C4FF", // Light Blue Accent
  "#64FFDA", // Teal Accent
  "#69F0AE", // Green Accent
];

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  selectedColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelectColor,
  selectedColor,
}) => {
  const renderColorItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedColor;

    return (
      <TouchableOpacity
        style={[
          styles.colorItem,
          { backgroundColor: item },
          isSelected && styles.selectedColorItem,
        ]}
        onPress={() => onSelectColor(item)}
      >
        {isSelected && <Ionicons name="checkmark" size={24} color="#FFFFFF" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Color</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={CATEGORY_COLORS}
                renderItem={renderColorItem}
                keyExtractor={(item) => item}
                numColumns={5}
                contentContainerStyle={styles.colorList}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 4,
  },
  colorList: {
    paddingVertical: 8,
    alignItems: "center",
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ColorPicker;
