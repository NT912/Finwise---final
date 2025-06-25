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

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.headerTitle}>Chính Sách Bảo Mật</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            FinWise cam kết bảo vệ quyền riêng tư của bạn. Chính Sách Bảo Mật
            này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ
            thông tin của bạn khi bạn sử dụng ứng dụng di động của chúng tôi.
          </Text>
          <Text style={styles.paragraph}>
            Vui lòng đọc kỹ Chính Sách Bảo Mật này. Nếu bạn không đồng ý với các
            điều khoản của Chính Sách Bảo Mật này, vui lòng không truy cập ứng
            dụng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Thu Thập Thông Tin Của Bạn</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể thu thập thông tin về bạn theo nhiều cách khác
            nhau. Thông tin chúng tôi có thể thu thập thông qua Ứng dụng bao
            gồm:
          </Text>
          <Text style={styles.bulletPoint}>
            • Dữ Liệu Cá Nhân: Thông tin có thể định danh cá nhân, chẳng hạn như
            tên, địa chỉ email và ngày sinh của bạn, mà bạn tự nguyện cung cấp
            cho chúng tôi khi đăng ký với Ứng dụng.
          </Text>
          <Text style={styles.bulletPoint}>
            • Dữ Liệu Tài Chính: Thông tin liên quan đến tài khoản tài chính,
            giao dịch và thói quen chi tiêu của bạn mà bạn chọn cung cấp hoặc
            được tạo ra thông qua việc sử dụng Ứng dụng của bạn.
          </Text>
          <Text style={styles.bulletPoint}>
            • Dữ Liệu Thiết Bị: Thông tin về hệ điều hành thiết bị di động, địa
            chỉ IP, loại trình duyệt, phiên bản trình duyệt và các công nghệ
            khác trên các thiết bị bạn sử dụng để truy cập Ứng dụng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Sử Dụng Thông Tin Của Bạn</Text>
          <Text style={styles.paragraph}>
            Việc có thông tin chính xác về bạn cho phép chúng tôi cung cấp cho
            bạn một trải nghiệm mượt mà, hiệu quả và được tùy chỉnh. Cụ thể,
            chúng tôi có thể sử dụng thông tin thu thập về bạn thông qua Ứng
            dụng để:
          </Text>
          <Text style={styles.bulletPoint}>
            • Tạo và quản lý tài khoản của bạn.
          </Text>
          <Text style={styles.bulletPoint}>
            • Cung cấp thông tin chi tiết và khuyến nghị tài chính được cá nhân
            hóa.
          </Text>
          <Text style={styles.bulletPoint}>
            • Xử lý giao dịch và theo dõi mô hình chi tiêu.
          </Text>
          <Text style={styles.bulletPoint}>
            • Gửi cho bạn cảnh báo và thông báo về hoạt động tài chính của bạn.
          </Text>
          <Text style={styles.bulletPoint}>
            • Phát triển tính năng mới và cải thiện Ứng dụng.
          </Text>
          <Text style={styles.bulletPoint}>
            • Giải quyết tranh chấp và khắc phục sự cố.
          </Text>
          <Text style={styles.bulletPoint}>
            • Ngăn chặn giao dịch gian lận và giám sát chống trộm cắp.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Tiết Lộ Thông Tin Của Bạn</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể chia sẻ thông tin chúng tôi đã thu thập về bạn
            trong một số tình huống nhất định. Thông tin của bạn có thể được
            tiết lộ như sau:
          </Text>
          <Text style={styles.bulletPoint}>
            • Theo Luật Hoặc Để Bảo Vệ Quyền: Nếu chúng tôi tin rằng việc tiết
            lộ thông tin về bạn là cần thiết để phản hồi quy trình pháp lý, để
            điều tra hoặc khắc phục các vi phạm tiềm ẩn đối với chính sách của
            chúng tôi, hoặc để bảo vệ quyền, tài sản và sự an toàn của người
            khác, chúng tôi có thể chia sẻ thông tin của bạn theo quy định hoặc
            yêu cầu của bất kỳ luật, quy tắc hoặc quy định hiện hành nào.
          </Text>
          <Text style={styles.bulletPoint}>
            • Nhà Cung Cấp Dịch Vụ Bên Thứ Ba: Chúng tôi có thể chia sẻ thông
            tin của bạn với các bên thứ ba thực hiện dịch vụ cho chúng tôi hoặc
            thay mặt chúng tôi, bao gồm xử lý thanh toán, phân tích dữ liệu, gửi
            email, dịch vụ lưu trữ, dịch vụ khách hàng và hỗ trợ tiếp thị.
          </Text>
          <Text style={styles.bulletPoint}>
            • Với Sự Đồng Ý Của Bạn: Chúng tôi có thể tiết lộ thông tin cá nhân
            của bạn cho bất kỳ mục đích nào khác với sự đồng ý của bạn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Bảo Mật Thông Tin Của Bạn</Text>
          <Text style={styles.paragraph}>
            Chúng tôi sử dụng các biện pháp bảo mật hành chính, kỹ thuật và vật
            lý để giúp bảo vệ thông tin cá nhân của bạn. Mặc dù chúng tôi đã
            thực hiện các bước hợp lý để bảo mật thông tin cá nhân bạn cung cấp
            cho chúng tôi, vui lòng lưu ý rằng mặc dù nỗ lực của chúng tôi,
            không có biện pháp bảo mật nào là hoàn hảo hoặc không thể xâm nhập,
            và không có phương pháp truyền dữ liệu nào có thể được đảm bảo chống
            lại bất kỳ sự chặn bắt hoặc lạm dụng nào khác.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Quyền Của Bạn Đối Với Dữ Liệu
          </Text>
          <Text style={styles.paragraph}>
            Bạn có quyền truy cập, sửa đổi hoặc xóa thông tin cá nhân mà chúng
            tôi thu thập và xử lý. Bạn cũng có thể có quyền hạn chế hoặc phản
            đối việc chúng tôi xử lý dữ liệu cá nhân của bạn và quyền di chuyển
            dữ liệu.
          </Text>
          <Text style={styles.paragraph}>
            Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi tại
            privacy@finwise.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Liên Hệ Với Chúng Tôi</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có câu hỏi hoặc nhận xét về Chính Sách Bảo Mật này, vui lòng
            liên hệ với chúng tôi tại:
          </Text>
          <Text style={styles.paragraph}>
            Ứng Dụng FinWise{"\n"}
            Email: tt912002@gmail.com{"\n"}
            Điện Thoại: 0918835701
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

export default PrivacyPolicyScreen;
