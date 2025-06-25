import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors, shadow } from "../../theme";
import {
  createCategory,
  getCategoriesByType,
} from "../../services/categoryService";
import { Category } from "../../types/category";
import IconPicker from "../../components/category/IconPicker";
import { IconName } from "../../types";

// Định nghĩa các tham số cho màn hình này
type RouteParams = {
  CreateCategory: {
    type: "expense" | "income" | "debt_loan";
    parentCategory?: Category; // Danh mục cha nếu đang tạo danh mục con
  };
};

const CreateCategoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "CreateCategory">>();
  const { type: initialType, parentCategory } = route.params || {
    type: "expense",
  };

  // State cho dữ liệu danh mục
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("heart-outline");
  const [color, setColor] = useState("#3D5A80");
  const [type, setType] = useState<"expense" | "income" | "debt_loan">(
    initialType
  );
  const [loading, setLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<Category | null>(
    parentCategory || null
  );
  const [showParentSelector, setShowParentSelector] = useState(false);

  // Lấy danh sách danh mục cha tiềm năng
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const categories = await getCategoriesByType(type);
        // Chỉ lấy các danh mục chính, không phải danh mục con
        const parents = categories.filter((cat) => !cat.parent);
        setParentCategories(parents);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      }
    };

    fetchParentCategories();
  }, [type]);

  // Tạo danh mục mới
  const handleCreateCategory = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên danh mục là bắt buộc");
      return;
    }

    setLoading(true);
    try {
      // Nếu parentCategory được truyền qua route params, sử dụng nó
      const parentId = parentCategory
        ? parentCategory._id
        : selectedParent
        ? selectedParent._id
        : null;

      const newCategory = {
        name: name.trim(),
        icon,
        color,
        type,
        parent: parentId,
      };

      const createdCategory = await createCategory(newCategory);
      console.log("Category created successfully:", createdCategory);

      navigation.goBack();
    } catch (error) {
      console.error("Error creating category:", error);
      Alert.alert("Lỗi", "Không thể tạo danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Chọn danh mục cha
  const handleSelectParent = (parent: Category | null) => {
    setSelectedParent(parent);
    setShowParentSelector(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <SafeAreaView style={styles.safeAreaTop} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Danh mục mới</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Card chứa icon và tên danh mục */}
        <View style={styles.categoryCard}>
          <TouchableOpacity
            style={styles.iconSection}
            onPress={() => setShowIconPicker(true)}
          >
            <View
              style={[styles.iconPreviewContainer, { backgroundColor: color }]}
            >
              <Ionicons name={icon as any} size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.nameInput}
            placeholder="Tên danh mục"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Phần chọn loại danh mục */}
        <View style={styles.typeSection}>
          <View style={styles.typeLabel}>
            <Ionicons name="add-outline" size={24} color="#000000" />
            <Text style={styles.typeLabelText}>Thu nhập / Chi tiêu</Text>
          </View>

          <View style={styles.typeButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "income" && styles.selectedTypeButton,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === "income" && styles.selectedTypeButtonText,
                ]}
              >
                Thu nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "expense" && styles.selectedTypeButton,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === "expense" && styles.selectedTypeButtonText,
                ]}
              >
                Chi tiêu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "debt_loan" && styles.selectedTypeButton,
              ]}
              onPress={() => setType("debt_loan")}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === "debt_loan" && styles.selectedTypeButtonText,
                ]}
              >
                Nợ/Vay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phần chọn danh mục cha */}
        <View style={styles.parentSection}>
          <Text style={styles.parentSectionLabel}>Danh mục cha</Text>
          <TouchableOpacity
            style={styles.parentSelector}
            onPress={() => setShowParentSelector(true)}
          >
            <View style={styles.parentSelectorContent}>
              <Ionicons name="cube-outline" size={24} color="#000000" />
              <Text style={styles.parentSelectorText}>
                {selectedParent ? selectedParent.name : "Chọn danh mục"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        {/* Nút Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            name.trim()
              ? { backgroundColor: colors.primary }
              : { backgroundColor: "#DDDDDD" },
          ]}
          onPress={handleCreateCategory}
          disabled={loading || !name.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn biểu tượng và màu sắc */}
      {showIconPicker && (
        <IconPicker
          visible={showIconPicker}
          onClose={() => setShowIconPicker(false)}
          onSelectIcon={(selectedIcon) => setIcon(selectedIcon as IconName)}
          onSelectColor={(selectedColor) => setColor(selectedColor)}
          selectedIcon={icon}
          selectedColor={color}
        />
      )}

      {/* Modal chọn danh mục cha */}
      {showParentSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowParentSelector(false)}
          />
          <View style={styles.parentSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Danh Mục Cha</Text>
              <TouchableOpacity
                onPress={() => setShowParentSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.parentList}>
              <TouchableOpacity
                style={styles.parentItem}
                onPress={() => handleSelectParent(null)}
              >
                <Text style={styles.parentItemText}>
                  Không có danh mục cha (tạo danh mục chính)
                </Text>
                {selectedParent === null && (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>

              {parentCategories.map((parent) => (
                <TouchableOpacity
                  key={parent._id}
                  style={styles.parentItem}
                  onPress={() => handleSelectParent(parent)}
                >
                  <View style={styles.parentItemContent}>
                    <View
                      style={[
                        styles.parentIconContainer,
                        { backgroundColor: parent.color },
                      ]}
                    >
                      <Ionicons
                        name={parent.icon as any}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.parentItemText}>{parent.name}</Text>
                  </View>

                  {selectedParent?._id === parent._id && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    height: Platform.OS === "ios" ? 50 : 60,
    paddingTop: Platform.OS === "ios" ? 0 : 10,
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...shadow.small,
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3D5A80",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.small,
  },
  nameInput: {
    fontSize: 22,
    color: "#333333",
    textAlign: "center",
    fontWeight: "500",
  },
  typeSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...shadow.small,
  },
  typeLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  typeLabelText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
    fontWeight: "500",
  },
  typeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 20,
    alignItems: "center",
  },
  selectedTypeButton: {
    backgroundColor: "#FFFFFF",
    ...shadow.small,
  },
  typeButtonText: {
    fontSize: 14,
    color: "#999999",
  },
  selectedTypeButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  parentSection: {
    marginBottom: 20,
  },
  parentSectionLabel: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  parentSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    ...shadow.small,
  },
  parentSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  parentSelectorText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
  saveButton: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
    ...shadow.medium,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  parentSelectorModal: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    ...shadow.medium,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 4,
  },
  parentList: {
    maxHeight: 300,
  },
  parentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  parentItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  parentItemText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 10,
  },
  parentIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});

export default CreateCategoryScreen;
