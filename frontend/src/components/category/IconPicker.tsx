import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

// Danh sách các biểu tượng phổ biến từ Ionicons
const COMMON_ICONS = [
  "basket-outline",
  "cart-outline",
  "cash-outline",
  "fast-food-outline",
  "home-outline",
  "car-outline",
  "bus-outline",
  "airplane-outline",
  "medical-outline",
  "gift-outline",
  "school-outline",
  "book-outline",
  "game-controller-outline",
  "film-outline",
  "beer-outline",
  "cafe-outline",
  "restaurant-outline",
  "fitness-outline",
  "shirt-outline",
  "paw-outline",
  "wallet-outline",
  "briefcase-outline",
  "card-outline",
  "phone-portrait-outline",
  "laptop-outline",
  "desktop-outline",
  "wifi-outline",
  "musical-note-outline",
  "ticket-outline",
  "globe-outline",
  "pin-outline",
  "pricetag-outline",
  "bag-outline",
  "bed-outline",
  "subway-outline",
  "bicycle-outline",
  "people-outline",
  "person-outline",
  "color-palette-outline",
  "cut-outline",
  "hammer-outline",
  "build-outline",
  "settings-outline",
  "pizza-outline",
  "heart-outline",
  "glasses-outline",
  "umbrella-outline",
  "alarm-outline",
  "receipt-outline",
  "cube-outline",
  "barbell-outline",
  "document-outline",
];

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

interface IconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  onSelectColor: (color: string) => void;
  selectedIcon?: string;
  selectedColor?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({
  visible,
  onClose,
  onSelectIcon,
  onSelectColor,
  selectedIcon,
  selectedColor,
}) => {
  const [currentTab, setCurrentTab] = useState<"icons" | "colors">("icons");
  const [tempSelectedIcon, setTempSelectedIcon] = useState<string>(
    selectedIcon || COMMON_ICONS[0]
  );
  const [tempSelectedColor, setTempSelectedColor] = useState<string>(
    selectedColor || CATEGORY_COLORS[0]
  );

  const handleDone = () => {
    onSelectIcon(tempSelectedIcon);
    onSelectColor(tempSelectedColor);
    onClose();
  };

  const renderIconItem = ({ item }: { item: string }) => {
    const isSelected = item === tempSelectedIcon;

    return (
      <TouchableOpacity
        style={[
          styles.iconItem,
          isSelected && {
            backgroundColor: tempSelectedColor,
            borderColor: tempSelectedColor,
          },
        ]}
        onPress={() => setTempSelectedIcon(item)}
      >
        <Ionicons
          name={item as any}
          size={24}
          color={isSelected ? "#FFFFFF" : "#333333"}
        />
      </TouchableOpacity>
    );
  };

  const renderColorItem = ({ item }: { item: string }) => {
    const isSelected = item === tempSelectedColor;

    return (
      <TouchableOpacity
        style={[
          styles.colorItem,
          { backgroundColor: item },
          isSelected && styles.selectedColorItem,
        ]}
        onPress={() => setTempSelectedColor(item)}
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
                <Text style={styles.title}>Customize</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Icon preview */}
              <View style={styles.previewContainer}>
                <View
                  style={[
                    styles.iconPreview,
                    { backgroundColor: tempSelectedColor },
                  ]}
                >
                  <Ionicons
                    name={tempSelectedIcon as any}
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    currentTab === "icons" && styles.activeTab,
                  ]}
                  onPress={() => setCurrentTab("icons")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === "icons" && styles.activeTabText,
                    ]}
                  >
                    Icons
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    currentTab === "colors" && styles.activeTab,
                  ]}
                  onPress={() => setCurrentTab("colors")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === "colors" && styles.activeTabText,
                    ]}
                  >
                    Colors
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              {currentTab === "icons" ? (
                <FlatList
                  key="icons-list"
                  data={COMMON_ICONS}
                  renderItem={renderIconItem}
                  keyExtractor={(item) => `icon-${item}`}
                  numColumns={6}
                  contentContainerStyle={styles.iconList}
                />
              ) : (
                <FlatList
                  key="colors-list"
                  data={CATEGORY_COLORS}
                  renderItem={renderColorItem}
                  keyExtractor={(item) => `color-${item}`}
                  numColumns={5}
                  contentContainerStyle={styles.colorList}
                />
              )}

              {/* Button */}
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
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
    borderRadius: 16,
    padding: 16,
    paddingBottom: 20,
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
  previewContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3D5A80",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    color: "#999999",
  },
  activeTabText: {
    color: "#333333",
    fontWeight: "600",
  },
  iconList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  colorList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default IconPicker;
