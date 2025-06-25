import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const TermsOfUseScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều Khoản Sử Dụng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chấp Nhận Điều Khoản</Text>
          <Text style={styles.paragraph}>
            Bằng việc truy cập hoặc sử dụng FinWise, bạn đồng ý tuân theo các
            Điều Khoản Sử Dụng này. Nếu bạn không đồng ý với các điều khoản này,
            vui lòng không sử dụng ứng dụng của chúng tôi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Tài Khoản Người Dùng</Text>
          <Text style={styles.paragraph}>
            Để sử dụng một số tính năng của FinWise, bạn có thể được yêu cầu tạo
            tài khoản người dùng. Bạn chịu trách nhiệm duy trì tính bảo mật của
            thông tin đăng nhập tài khoản và cho tất cả hoạt động diễn ra dưới
            tài khoản của bạn.
          </Text>
          <Text style={styles.paragraph}>
            Bạn đồng ý cung cấp thông tin chính xác, hiện tại và đầy đủ trong
            quá trình đăng ký và cập nhật thông tin đó để giữ cho nó chính xác,
            hiện tại và đầy đủ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Quyền Riêng Tư</Text>
          <Text style={styles.paragraph}>
            Quyền riêng tư của bạn rất quan trọng đối với chúng tôi. Chính Sách
            Bảo Mật của chúng tôi mô tả cách chúng tôi thu thập, sử dụng và tiết
            lộ thông tin về bạn. Bằng việc sử dụng FinWise, bạn đồng ý với việc
            thu thập, sử dụng và tiết lộ thông tin của bạn như được mô tả trong
            Chính Sách Bảo Mật của chúng tôi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Hoạt Động Bị Cấm</Text>
          <Text style={styles.paragraph}>
            Bạn đồng ý không tham gia vào bất kỳ hoạt động nào sau đây:
          </Text>
          <Text style={styles.bulletPoint}>
            • Cố gắng bỏ qua bất kỳ tính năng bảo mật nào của ứng dụng
          </Text>
          <Text style={styles.bulletPoint}>
            • Sử dụng ứng dụng cho bất kỳ mục đích bất hợp pháp nào hoặc vi phạm
            bất kỳ luật địa phương, tiểu bang, quốc gia hoặc quốc tế nào
          </Text>
          <Text style={styles.bulletPoint}>
            • Tạo nhiều tài khoản hoặc cung cấp thông tin sai lệch
          </Text>
          <Text style={styles.bulletPoint}>
            • Can thiệp hoặc làm gián đoạn hoạt động của ứng dụng
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Thông Tin Tài Chính</Text>
          <Text style={styles.paragraph}>
            FinWise cung cấp các công cụ để quản lý và phân tích tài chính.
            Thông tin được cung cấp thông qua ứng dụng chỉ mang tính chất thông
            tin và không nên được coi là tư vấn tài chính.
          </Text>
          <Text style={styles.paragraph}>
            Bạn hoàn toàn chịu trách nhiệm về các quyết định và hành động tài
            chính của mình. Chúng tôi khuyến nghị tham khảo ý kiến của cố vấn
            tài chính có trình độ trước khi đưa ra các quyết định tài chính quan
            trọng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Thay Đổi Điều Khoản</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có quyền sửa đổi các Điều Khoản Sử Dụng này vào bất kỳ lúc
            nào. Nếu chúng tôi thực hiện những thay đổi quan trọng đối với các
            Điều Khoản này, chúng tôi sẽ thông báo cho bạn thông qua ứng dụng
            hoặc bằng các phương tiện khác.
          </Text>
          <Text style={styles.paragraph}>
            Việc tiếp tục sử dụng FinWise sau khi các thay đổi có hiệu lực được
            coi là bạn chấp nhận các Điều Khoản đã được sửa đổi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Chấm Dứt</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có quyền chấm dứt hoặc tạm ngưng tài khoản và quyền truy
            cập vào FinWise theo quyết định riêng của chúng tôi, mà không cần
            thông báo trước, đối với hành vi mà chúng tôi tin rằng vi phạm các
            Điều Khoản Sử Dụng này hoặc có hại cho người dùng khác, chúng tôi
            hoặc bên thứ ba, hoặc vì bất kỳ lý do nào khác.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Thông Tin Liên Hệ</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có bất kỳ câu hỏi nào về các Điều Khoản Sử Dụng này, vui
            lòng liên hệ với chúng tôi tại support@finwise.com.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cập Nhật Lần Cuối: 10 Tháng 4, 2023
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333333",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333333",
    marginLeft: 16,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999999",
  },
});

export default TermsOfUseScreen;
