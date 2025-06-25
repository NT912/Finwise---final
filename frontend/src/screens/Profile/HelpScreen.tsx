import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileStackParamList } from "../../navigation/types";

// FAQ data with categories
const FAQData = [
  {
    id: "1",
    question: "Làm thế nào để sử dụng FinWise?",
    answer:
      "FinWise là ứng dụng quản lý tài chính cá nhân giúp bạn theo dõi thu nhập, chi tiêu và tiết kiệm. Điều hướng qua các tab để truy cập các tính năng khác nhau.",
    category: "general",
  },
  {
    id: "2",
    question: "Chi phí sử dụng FinWise là bao nhiêu?",
    answer:
      "FinWise miễn phí sử dụng với các tính năng cơ bản. Các tính năng cao cấp có thể yêu cầu đăng ký.",
    category: "general",
  },
  {
    id: "3",
    question: "Làm thế nào để liên hệ hỗ trợ?",
    answer:
      "Bạn có thể liên hệ đội ngũ hỗ trợ của chúng tôi qua tab Liên Hệ hoặc gửi email đến tt912002@gmail.com.",
    category: "general",
  },
  {
    id: "4",
    question: "FinWise có hỗ trợ đa ngôn ngữ không?",
    answer:
      "Hiện tại FinWise hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang phát triển thêm nhiều ngôn ngữ khác.",
    category: "general",
  },
  {
    id: "5",
    question: "Ứng dụng có tương thích với những thiết bị nào?",
    answer:
      "FinWise tương thích với iOS và Android. Bạn có thể tải ứng dụng từ App Store hoặc Google Play Store.",
    category: "general",
  },
  {
    id: "6",
    question: "Có giới hạn về số lượng giao dịch không?",
    answer:
      "Không có giới hạn về số lượng giao dịch. Bạn có thể thêm bao nhiêu giao dịch tùy ý.",
    category: "general",
  },
  {
    id: "7",
    question: "Làm thế nào để đặt lại mật khẩu nếu tôi quên?",
    answer:
      "Đi đến màn hình đăng nhập và nhấn vào 'Quên Mật Khẩu'. Làm theo hướng dẫn để đặt lại mật khẩu.",
    category: "account",
  },
  {
    id: "8",
    question: "Có biện pháp bảo mật dữ liệu nào không?",
    answer:
      "Có, chúng tôi sử dụng mã hóa tiêu chuẩn ngành để bảo vệ dữ liệu của bạn. Bạn có thể đọc chính sách bảo mật để biết thêm chi tiết.",
    category: "account",
  },
  {
    id: "9",
    question: "Làm thế nào để xóa tài khoản?",
    answer:
      "Đi đến Hồ Sơ > Cài Đặt > Xóa Tài Khoản. Bạn sẽ cần nhập mật khẩu để xác nhận xóa.",
    category: "account",
  },
  {
    id: "10",
    question: "Tôi có thể thay đổi email đăng nhập không?",
    answer:
      "Có, bạn có thể thay đổi email trong phần Chỉnh Sửa Hồ Sơ. Bạn sẽ cần xác nhận email mới.",
    category: "account",
  },
  {
    id: "11",
    question: "Dữ liệu của tôi có được sao lưu không?",
    answer:
      "Có, dữ liệu của bạn được sao lưu tự động trên đám mây. Bạn có thể khôi phục dữ liệu khi đăng nhập lại.",
    category: "account",
  },
  {
    id: "12",
    question: "Làm thế nào để bảo vệ tài khoản?",
    answer:
      "Sử dụng mật khẩu mạnh, không chia sẻ thông tin đăng nhập và bật xác thực hai yếu tố nếu có.",
    category: "account",
  },
  {
    id: "13",
    question: "Tôi có thể tùy chỉnh cài đặt trong ứng dụng không?",
    answer:
      "Có, bạn có thể tùy chỉnh nhiều cài đặt khác nhau bao gồm thông báo, giao diện và tùy chọn bảo mật từ hồ sơ của bạn.",
    category: "services",
  },
  {
    id: "14",
    question: "Làm thế nào để truy cập lịch sử chi tiêu?",
    answer:
      "Bạn có thể xem lịch sử giao dịch trong tab Giao Dịch. Bạn có thể lọc và tìm kiếm các giao dịch cụ thể.",
    category: "services",
  },
  {
    id: "15",
    question: "Tôi có thể sử dụng ứng dụng offline không?",
    answer:
      "Một số tính năng của FinWise hoạt động offline, nhưng đồng bộ hóa với đám mây yêu cầu kết nối internet.",
    category: "services",
  },
  {
    id: "16",
    question: "Làm thế nào để tạo ngân sách?",
    answer:
      "Đi đến tab Ngân Sách và nhấn 'Tạo Ngân Sách'. Chọn danh mục, nhập số tiền và khoảng thời gian.",
    category: "services",
  },
  {
    id: "17",
    question: "Có thể thêm nhiều ví không?",
    answer:
      "Có, bạn có thể tạo nhiều ví khác nhau để quản lý các tài khoản tài chính riêng biệt.",
    category: "services",
  },
  {
    id: "18",
    question: "Làm thế nào để xuất báo cáo?",
    answer:
      "Trong tab Báo Cáo, bạn có thể xem và xuất báo cáo chi tiêu theo tháng, quý hoặc năm.",
    category: "services",
  },
  {
    id: "19",
    question: "Có thể tạo danh mục tùy chỉnh không?",
    answer:
      "Có, bạn có thể tạo danh mục chi tiêu và thu nhập tùy chỉnh theo nhu cầu của mình.",
    category: "services",
  },
  {
    id: "20",
    question: "Làm thế nào để đặt mục tiêu tiết kiệm?",
    answer:
      "Trong tab Tiết Kiệm, bạn có thể tạo mục tiêu tiết kiệm và theo dõi tiến độ đạt được.",
    category: "services",
  },
  {
    id: "21",
    question: "Có thể chia sẻ dữ liệu với người khác không?",
    answer:
      "Hiện tại FinWise không hỗ trợ chia sẻ dữ liệu trực tiếp. Dữ liệu chỉ được lưu trữ cá nhân.",
    category: "services",
  },
  {
    id: "22",
    question: "Làm thế nào để nhắc nhở thanh toán?",
    answer:
      "Bạn có thể thiết lập nhắc nhở thanh toán trong cài đặt thông báo của ứng dụng.",
    category: "services",
  },
];

const HelpScreen = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const handleBackPress = () => {
    // Xóa function handleNotificationPress
  };

  // Filter FAQs based on search query and active category
  const filteredFAQs = FAQData.filter(
    (faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle question expansion
  const toggleQuestion = (id: string) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00D09E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Trợ Giúp & Hỗ Trợ</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Help Title */}
        <Text style={styles.helpTitle}>Chúng Tôi Có Thể Giúp Gì Cho Bạn?</Text>

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[
              styles.categoryTab,
              activeCategory === "general" && styles.activeCategoryTab,
            ]}
            onPress={() => setActiveCategory("general")}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === "general" && styles.activeCategoryText,
              ]}
            >
              Chung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryTab,
              activeCategory === "account" && styles.activeCategoryTab,
            ]}
            onPress={() => setActiveCategory("account")}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === "account" && styles.activeCategoryText,
              ]}
            >
              Tài Khoản
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryTab,
              activeCategory === "services" && styles.activeCategoryTab,
            ]}
            onPress={() => setActiveCategory("services")}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === "services" && styles.activeCategoryText,
              ]}
            >
              Dịch Vụ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
        </View>

        {/* FAQ List */}
        <ScrollView style={styles.faqContainer}>
          {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleQuestion(faq.id)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.questionText}>{faq.question}</Text>
                <Ionicons
                  name={
                    expandedQuestions.includes(faq.id)
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color="#333"
                />
              </View>

              {expandedQuestions.includes(faq.id) && (
                <Text style={styles.answerText}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F6F9F8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5F8F0",
  },
  activeCategoryTab: {
    backgroundColor: "#E5F8F0",
    borderBottomWidth: 2,
    borderBottomColor: "#00D09E",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryText: {
    color: "#00D09E",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 8,
  },
  faqContainer: {
    flex: 1,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E5E5",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    lineHeight: 20,
  },
});

export default HelpScreen;
