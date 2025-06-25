import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import categoryStyles from "../../styles/category/categoryStyles";

const TermsAndConditionsScreen = ({ navigation }: { navigation: any }) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Điều Khoản & Điều Kiện</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>Thỏa Thuận Sử Dụng Và Dịch Vụ</Text>

          <Text style={styles.paragraph}>
            Chào mừng bạn đến với FinWise. Bằng việc truy cập hoặc sử dụng ứng
            dụng của chúng tôi, bạn đồng ý tuân theo các Điều Khoản và Điều Kiện
            này. Những điều khoản này ảnh hưởng đến quyền lợi và nghĩa vụ pháp
            lý của bạn, vì vậy nếu bạn không đồng ý với những điều khoản này,
            vui lòng không sử dụng ứng dụng hoặc dịch vụ của chúng tôi.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              1. Đăng Ký Tài Khoản Và Bảo Mật
            </Text>
            <Text style={styles.bulletPoint}>
              2. Thông Tin Cá Nhân Và Chính Sách Bảo Mật
            </Text>
            <Text style={styles.bulletPoint}>
              3. Sử Dụng Dịch Vụ Và Hành Vi Người Dùng
            </Text>
            <Text style={styles.bulletPoint}>
              4. Thông Tin Tài Chính Và Tuyên Bố Miễn Trừ
            </Text>
          </View>

          <Text style={styles.paragraph}>
            FinWise cung cấp các công cụ quản lý tài chính cá nhân cho phép bạn
            theo dõi chi tiêu, tạo ngân sách và phân tích thói quen chi tiêu của
            mình. Chúng tôi không phải là tổ chức tài chính và không cung cấp tư
            vấn tài chính. Tất cả quyết định bạn đưa ra dựa trên thông tin được
            cung cấp bởi ứng dụng của chúng tôi đều theo quyết định và rủi ro
            của riêng bạn.
          </Text>

          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>
              • Bạn có trách nhiệm duy trì tính bảo mật của thông tin đăng nhập
              tài khoản.
            </Text>
            <Text style={styles.bulletPoint}>
              • Chúng tôi thu thập và xử lý dữ liệu của bạn theo Chính Sách Bảo
              Mật.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Chúng tôi có quyền sửa đổi những điều khoản này bất cứ lúc nào mà
            không cần thông báo trước. Việc bạn tiếp tục sử dụng ứng dụng sau
            khi có bất kỳ thay đổi nào đối với những điều khoản này có nghĩa là
            bạn chấp nhận những thay đổi đó. Nếu bạn vi phạm những điều khoản
            này, chúng tôi có thể đình chỉ hoặc chấm dứt tài khoản và quyền truy
            cập vào dịch vụ của chúng tôi.
          </Text>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.readMoreLink}>
              Đọc đầy đủ điều khoản và điều kiện tại finwise.app.me
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 16,
  },
  bulletPoints: {
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 8,
  },
  readMoreLink: {
    fontSize: 14,
    color: "#00D09E",
    textDecorationLine: "underline",
    marginTop: 8,
    marginBottom: 24,
  },
});

export default TermsAndConditionsScreen;
