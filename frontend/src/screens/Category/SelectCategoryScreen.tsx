import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
  ParamListBase,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { colors, shadow } from "../../theme";
import {
  getCategoriesByType,
  getAllCategories,
} from "../../services/categoryService";
import { Category } from "../../types/category";

// Event system to avoid passing callbacks through navigation
const categorySelectEventKey = "onCategorySelect";
const eventListeners: Record<string, ((category: any) => void)[]> = {};

// Helper functions for the event system
const addListener = (
  eventKey: string,
  listener: (category: any) => void
): (() => void) => {
  if (!eventListeners[eventKey]) {
    eventListeners[eventKey] = [];
  }
  eventListeners[eventKey].push(listener);

  // Return cleanup function
  return () => {
    if (eventListeners[eventKey]) {
      eventListeners[eventKey] = eventListeners[eventKey].filter(
        (l) => l !== listener
      );
    }
  };
};

const emitEvent = (eventKey: string, data: any) => {
  if (eventListeners[eventKey]) {
    eventListeners[eventKey].forEach((listener) => listener(data));
  }
};

type CategoryType = "expense" | "income" | "debt_loan";
type SortOption = "default" | "frequency" | "name";

type RouteParams = {
  SelectCategory: {
    selectedCategoryId?: string;
    listenerId?: string;
    type?: CategoryType;
    onSelectCategory?: (category: Category) => void;
  };
};

const SelectCategoryScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RouteParams, "SelectCategory">>();
  const {
    selectedCategoryId,
    listenerId,
    type: initialType,
    onSelectCategory,
  } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    selectedCategoryId
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<CategoryType>(
    initialType || "expense"
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Mapping of parent category names to IDs for subcategory handling
  const [parentCategoryMap, setParentCategoryMap] = useState<
    Record<string, string>
  >({});

  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Animation values for search bar
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories of selected type
      const fetchedCategories = await getCategoriesByType(selectedType);
      console.log(
        `Fetched ${fetchedCategories.length} ${selectedType} categories`
      );

      // Process categories to mark parents and subcategories
      const processedCategories = fetchedCategories.map((cat) => ({
        ...cat,
        isSubcategory: !!cat.parent,
      }));

      // Log parent-child relationships for debugging
      const parents = processedCategories.filter((cat) => !cat.parent);
      const children = processedCategories.filter((cat) => !!cat.parent);
      console.log(
        `Found ${parents.length} parent categories and ${children.length} subcategories`
      );

      // Filter out subcategories for main list
      const mainCategories = processedCategories.filter(
        (cat) => !cat.isSubcategory
      );

      // Apply sorting
      let sortedCategories;
      switch (sortOption) {
        case "name":
          // Sort alphabetically by name
          sortedCategories = mainCategories.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;

        case "frequency":
          // Sort by frequency - in a real app this would use actual usage data
          // For now, we're keeping the order as is
          sortedCategories = mainCategories;
          break;

        case "default":
        default:
          // Keep the original order from API
          sortedCategories = mainCategories;
          break;
      }

      // Set the entire processed category collection for subcategory lookup
      setCategories(processedCategories);
      // Set only the main categories for display
      setDisplayedCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // Reset on error
      setDisplayedCategories([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, sortOption]);

  // Call fetchCategories when selectedType or sortOption changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, selectedType, sortOption]);

  // Update displayed categories when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show only main categories when no search query
      const mainCategories = categories.filter((cat) => !cat.isSubcategory);
      setDisplayedCategories(mainCategories);
      return;
    }

    // Filter categories by name - include both main and subcategories in search results
    const lowercaseQuery = searchQuery.toLowerCase().trim();
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(lowercaseQuery)
    );
    setDisplayedCategories(filtered);
  }, [searchQuery, categories]);

  const handleCategorySelect = (category: Category) => {
    if (!category || !category._id || category._id === "undefined") return;
    setSelectedCategory(category._id);
    // If we have a callback, use that
    if (onSelectCategory) {
      onSelectCategory(category);
    } else if (listenerId) {
      // Otherwise use the event system if we have a listener ID
      emitEvent(`${categorySelectEventKey}_${listenerId}`, category);
    } else {
      // Finally fall back to the default event
      emitEvent(categorySelectEventKey, category);
    }
    // Navigate back
    navigation.goBack();
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSortOptions = () => {
    if (showSortOptions) {
      // Hide sort options
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSortOptions(false);
      });
    } else {
      // Show sort options
      setShowSortOptions(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const toggleSearchBar = () => {
    if (showSearchBar) {
      // Hide search bar
      Animated.parallel([
        Animated.timing(searchBarHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowSearchBar(false);
        setSearchQuery("");
      });
    } else {
      // Show search bar
      setShowSearchBar(true);
      Animated.parallel([
        Animated.timing(searchBarHeight, {
          toValue: 56,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle invalid icons
  const getValidIconName = (iconName: string): string => {
    // List of invalid icons and their replacements
    const iconMap: Record<string, string> = {
      food: "restaurant-outline",
      "shopping-bag": "bag-outline",
      swap: "swap-horizontal-outline",
      // Thêm các biểu tượng mặc định cho các loại danh mục phổ biến
      receipt: "receipt-outline",
      cart: "cart-outline",
      people: "people-outline",
      car: "car-outline",
      fitness: "fitness-outline",
      school: "school-outline",
      game: "game-controller-outline",
      gift: "gift-outline",
      cube: "cube-outline",
      cash: "cash-outline",
      tag: "pricetag-outline",
      house: "home-outline",
      heart: "heart-outline",
      plane: "airplane-outline",
      card: "card-outline",
      cafe: "cafe-outline",
      call: "call-outline",
    };

    // Nếu biểu tượng không có "outline" ở cuối, thử thêm vào
    if (iconName && !iconName.includes("outline") && !iconMap[iconName]) {
      const withOutline = `${iconName}-outline`;
      return withOutline;
    }

    return iconMap[iconName] || iconName;
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    // Skip subcategories in the main list - they will be shown under their parent categories
    if (item.parent) {
      return null;
    }

    // Get all subcategories - check both for parent as ID or name
    const subcategories = categories.filter(
      (cat) => cat.parent === item._id || cat.parent === item.name
    );

    console.log(
      `Rendering category ${item.name} (ID: ${item._id}), found ${subcategories.length} subcategories`
    );

    const hasSubcategories = subcategories.length > 0;
    const isSelected = selectedCategory === item._id;

    // Use getValidIconName to ensure the icon is valid
    const validIconName = getValidIconName(item.icon);

    return (
      <View key={`category-container-${item._id}`}>
        <TouchableOpacity
          key={`category-${item._id}`}
          style={styles.categoryItem}
          onPress={() => handleCategorySelect(item)}
          onLongPress={() => {
            // Show options menu for this category
            Alert.alert(
              item.name,
              "Bạn muốn làm gì?",
              [
                {
                  text: "Chọn",
                  onPress: () => handleCategorySelect(item),
                },
                {
                  text: "Hủy",
                  style: "cancel",
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <View style={styles.categoryInfo}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: item.color },
              ]}
            >
              <Ionicons name={validIconName as any} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
          </View>

          <View style={styles.categoryRightSide}>
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={22}
                color="#4CD964"
                style={styles.checkmark}
              />
            )}

            {hasSubcategories && (
              <Ionicons name="chevron-down" size={18} color="#CCCCCC" />
            )}
          </View>
        </TouchableOpacity>

        {/* Always render subcategories if they exist */}
        {hasSubcategories && (
          <View style={styles.subcategoriesContainer}>
            {/* Vertical line connecting all subcategories */}
            <View style={styles.verticalLine} />

            {subcategories.map((subcat, index) => {
              // Log subcategory info for debugging
              console.log(
                `Rendering subcategory: ${subcat.name} (ID: ${subcat._id}, Parent: ${subcat.parent})`
              );

              // Handle icon for subcategories
              const validSubcatIconName = getValidIconName(subcat.icon);
              const isSubcatSelected = selectedCategory === subcat._id;
              const isLastSubcategory = index === subcategories.length - 1;

              return (
                <TouchableOpacity
                  key={`subcategory-${subcat._id}`}
                  style={[
                    styles.categoryItem,
                    styles.subcategoryItem,
                    isLastSubcategory && styles.lastSubcategoryItem,
                  ]}
                  onPress={() => handleCategorySelect(subcat)}
                >
                  <View style={styles.categoryInfo}>
                    {/* Hiển thị đường kẻ nhánh cho danh mục con */}
                    <View style={styles.indentContainer}>
                      <View style={styles.indentMarker} />
                    </View>

                    <View
                      style={[
                        styles.subcategoryIconContainer,
                        { backgroundColor: subcat.color },
                      ]}
                    >
                      <Ionicons
                        name={validSubcatIconName as any}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.subcategoryName}>{subcat.name}</Text>
                  </View>

                  {isSubcatSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#4CD964"
                      style={styles.checkmark}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderNewCategoryButton = () => {
    return (
      <TouchableOpacity
        key="new-category-button"
        style={styles.newCategoryButton}
        onPress={() => {
          // Navigate to create category screen
          navigation.navigate("CreateCategory", { type: selectedType });
        }}
      >
        <View style={styles.categoryInfo}>
          <View style={styles.addIconContainer}>
            <Ionicons name="add" size={20} color="#4CD964" />
          </View>
          <Text style={styles.newCategoryText}>Danh mục mới</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View key="separator" style={styles.divider} />;

  const renderHelpButton = () => (
    <TouchableOpacity key="help-button" style={styles.helpButton}>
      <Text style={styles.helpButtonText}>
        Cần trợ giúp? Gửi tin nhắn cho chúng tôi{" "}
        <Ionicons name="help-circle-outline" size={16} color="#4CD964" />
      </Text>
    </TouchableOpacity>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loaderText}>Đang tải danh mục...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <SafeAreaView style={styles.safeAreaTop} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent
      />

      {/* Header with status bar height included */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Chọn danh mục</Text>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSortOptions}
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleSearchBar}
          >
            <Ionicons name="search" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchBarContainer,
          {
            height: searchBarHeight,
            opacity: searchBarOpacity,
          },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm danh mục"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
            autoFocus={showSearchBar}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Rest of the content */}
      <View style={{ flex: 1 }}>
        {/* Category Type Selector */}
        <View style={styles.categoryTypeContainer}>
          <View style={styles.categoryTypeButtonsWrapper}>
            <TouchableOpacity
              style={[
                styles.categoryTypeButton,
                selectedType === "expense" && styles.selectedCategoryTypeButton,
              ]}
              onPress={() => setSelectedType("expense")}
            >
              <Text
                style={[
                  styles.categoryTypeText,
                  selectedType === "expense" && styles.selectedCategoryTypeText,
                ]}
              >
                Chi tiêu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryTypeButton,
                selectedType === "income" && styles.selectedCategoryTypeButton,
              ]}
              onPress={() => setSelectedType("income")}
            >
              <Text
                style={[
                  styles.categoryTypeText,
                  selectedType === "income" && styles.selectedCategoryTypeText,
                ]}
              >
                Thu nhập
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryTypeButton,
                selectedType === "debt_loan" &&
                  styles.selectedCategoryTypeButton,
              ]}
              onPress={() => setSelectedType("debt_loan")}
            >
              <Text
                style={[
                  styles.categoryTypeText,
                  selectedType === "debt_loan" &&
                    styles.selectedCategoryTypeText,
                ]}
              >
                Nợ/Vay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category List */}
        {loading ? (
          renderLoader()
        ) : (
          <FlatList
            data={displayedCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderNewCategoryButton}
            ListFooterComponent={renderHelpButton}
            ListEmptyComponent={
              <View style={styles.emptyResultContainer}>
                <Ionicons name="search-outline" size={40} color="#CCCCCC" />
                <Text style={styles.emptyResultText}>
                  {searchQuery
                    ? `Không tìm thấy danh mục nào phù hợp với "${searchQuery}"`
                    : `Không tìm thấy danh mục ${
                        selectedType === "expense"
                          ? "chi tiêu"
                          : selectedType === "income"
                          ? "thu nhập"
                          : "nợ/vay"
                      } nào`}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Sort Modal */}
      {showSortOptions && (
        <View style={styles.sortModalOverlay}>
          <Animated.View
            style={[styles.sortModalBackdrop, { opacity: backdropOpacity }]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={toggleSortOptions}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.sortOptionsContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sortOptionsHandle} />
            <Text style={styles.sortOptionsTitle}>Sắp xếp danh mục</Text>

            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => {
                setSortOption("frequency");
                toggleSortOptions();
              }}
            >
              <View style={styles.radioButton}>
                {sortOption === "frequency" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.sortOptionText}>Tần suất sử dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => {
                setSortOption("name");
                toggleSortOptions();
              }}
            >
              <View style={styles.radioButton}>
                {sortOption === "name" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.sortOptionText}>Theo tên A-Z</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => {
                setSortOption("default");
                toggleSortOptions();
              }}
            >
              <View style={styles.radioButton}>
                {sortOption === "default" && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.sortOptionText}>Mặc định</Text>
            </TouchableOpacity>
          </Animated.View>
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
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    height:
      Platform.OS === "android" ? 56 + (StatusBar.currentHeight || 0) : 56,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginRight: 10,
    padding: 4,
  },
  searchButton: {
    padding: 4,
  },
  categoryTypeContainer: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginTop: 0,
    alignItems: "center",
  },
  categoryTypeButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  categoryTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    minWidth: 90,
    alignItems: "center",
  },
  selectedCategoryTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  selectedCategoryTypeText: {
    color: "#FFFFFF",
  },
  listContent: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
  },
  newCategoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    ...shadow.medium,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  categoryRightSide: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmark: {
    marginRight: 10,
  },
  subcategoriesContainer: {
    position: "relative",
    marginLeft: 0,
    paddingLeft: 0,
    backgroundColor: "#F8F8F8",
  },
  verticalLine: {
    position: "absolute",
    left: 28,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#DDDDDD",
  },
  subcategoryItem: {
    backgroundColor: "#F8F8F8",
    paddingLeft: 16,
    marginLeft: 0,
    position: "relative",
    borderLeftWidth: 0,
    paddingVertical: 10, // Giảm padding để làm cho danh mục con nhỏ hơn
  },
  lastSubcategoryItem: {
    borderBottomLeftRadius: 8,
    marginBottom: 0,
    paddingBottom: 12,
  },
  indentContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  indentMarker: {
    width: 20,
    height: 2,
    backgroundColor: "#DDDDDD",
    position: "absolute",
    top: "50%",
    left: 28,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginLeft: 20,
    ...shadow.small,
  },
  // Biểu tượng cho danh mục con - nhỏ hơn danh mục cha
  subcategoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginLeft: 24,
    ...shadow.small,
  },
  addIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#EEFFF0",
    borderWidth: 1,
    borderColor: "#4CD964",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
    flex: 1,
  },
  // Style riêng cho tên danh mục con
  subcategoryName: {
    fontSize: 14,
    color: "#444444",
    fontWeight: "400",
    flex: 1,
  },
  newCategoryText: {
    fontSize: 14,
    color: "#4CD964",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  helpButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  helpButtonText: {
    fontSize: 14,
    color: "#666666",
  },
  sortModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sortModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sortOptionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  sortOptionsHandle: {
    alignSelf: "center",
    width: 50,
    height: 5,
    backgroundColor: "#DDDDDD",
    borderRadius: 2.5,
    marginBottom: 20,
  },
  sortOptionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 20,
    paddingLeft: 0,
    textAlign: "center",
  },
  sortOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: "100%",
    alignSelf: "stretch",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    fontSize: 17,
    color: "#333333",
    fontWeight: "500",
  },
  searchBarContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  searchInputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333333",
    padding: 0,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyResultContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyResultText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  loaderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  addSubcategoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  addSubcategoryText: {
    fontSize: 14,
    color: "#4CD964",
    fontWeight: "500",
  },
});

// Export event system for other components to use
export { addListener, emitEvent, categorySelectEventKey };
export default SelectCategoryScreen;
