# FinWise - Ứng dụng Quản lý Tài chính Thông minh

<div align="center">

![FinWise Logo](https://img.shields.io/badge/FinWise-Financial%20Wisdom-00D09E?style=for-the-badge&logo=react-native)

**Giải pháp quản lý tài chính cá nhân toàn diện với giao diện hiện đại và tính năng thông minh**

[![React Native](https://img.shields.io/badge/React%20Native-0.72.0-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-49.0+-000020?style=flat-square&logo=expo)](https://expo.dev/)

</div>

---

## 📋 Tổng quan

FinWise là ứng dụng quản lý tài chính cá nhân được phát triển với React Native và Node.js, giúp người dùng theo dõi thu chi, lập kế hoạch ngân sách, và đưa ra quyết định tài chính thông minh. Ứng dụng được thiết kế với giao diện người dùng hiện đại, trực quan và dễ sử dụng.

### ✨ Tính năng nổi bật

- 📊 **Dashboard thông minh** - Tổng quan tài chính với biểu đồ trực quan
- 💰 **Quản lý thu chi** - Theo dõi chi tiết các khoản thu chi hàng ngày
- 📈 **Phân tích chi tiêu** - Biểu đồ và báo cáo chi tiết theo thời gian
- 🎯 **Lập kế hoạch ngân sách** - Thiết lập và theo dõi mục tiêu tài chính
- 💳 **Quản lý ví** - Hỗ trợ nhiều ví và tài khoản ngân hàng
- 🔒 **Bảo mật cao** - Xác thực JWT và mã hóa dữ liệu
- 📱 **Đa nền tảng** - Hoạt động trên iOS và Android

---

## 🛠️ Công nghệ sử dụng

### Frontend (React Native)

- **Framework**: React Native 0.72.0
- **Development Platform**: Expo SDK 49
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **UI Components**: Custom components với React Native
- **Icons**: Expo Vector Icons
- **Storage**: AsyncStorage

### Backend (Node.js)

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **CORS**: Express CORS

---

## ⚙️ Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js 18.0 trở lên
- npm hoặc yarn
- Expo CLI
- MongoDB (cho backend)

### Bước 1: Clone repository

```bash
git clone https://github.com/your-username/finwise-app.git
cd finwise-app
```

### Bước 2: Cài đặt dependencies

#### Frontend

```bash
cd frontend
npm install
# hoặc
yarn install
```

#### Backend

```bash
cd backend
npm install
# hoặc
yarn install
```

### Bước 3: Cấu hình môi trường

#### Frontend (.env)

```env
API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Backend (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finwise
JWT_SECRET=your-secret-key
```

### Bước 4: Chạy ứng dụng

#### Backend

```bash
cd backend
npm run dev
# hoặc
yarn dev
```

#### Frontend

```bash
cd frontend
npx expo start
# hoặc
yarn start
```

---

## 📁 Cấu trúc dự án

```
finwise-app/
├── frontend/                 # React Native App
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API services
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── assets/               # Images, fonts, etc.
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   └── utils/            # Utility functions
│   ├── uploads/              # File uploads
│   └── package.json
└── README.md
```

---

## 🔧 Tính năng chi tiết

### 💳 Quản lý Giao dịch

- Thêm, sửa, xóa giao dịch
- Phân loại theo danh mục
- Gắn thẻ và ghi chú
- Tìm kiếm và lọc giao dịch

### 📊 Phân tích & Báo cáo

- Biểu đồ thu chi theo thời gian
- Phân tích chi tiêu theo danh mục
- Báo cáo hàng tháng/năm
- Xuất báo cáo PDF

### 🎯 Kế hoạch Ngân sách

- Thiết lập ngân sách hàng tháng
- Theo dõi tiến độ
- Cảnh báo khi vượt ngân sách
- Đề xuất tiết kiệm

### 💰 Quản lý Ví

- Tạo nhiều ví khác nhau
- Chuyển tiền giữa các ví
- Theo dõi số dư từng ví
- Lịch sử giao dịch

### 🔒 Bảo mật

- Xác thực JWT
- Mã hóa mật khẩu
- Bảo vệ dữ liệu người dùng
- Backup tự động

---

## 🚀 Triển khai

### Backend (Heroku/Vercel)

```bash
# Cấu hình environment variables
# Deploy với Git
git push heroku main
```

### Frontend (Expo)

```bash
# Build cho production
expo build:android
expo build:ios

# Publish lên Expo
expo publish
```

---

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng đọc hướng dẫn đóng góp trước khi bắt đầu.

### Quy trình đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

---

## 📞 Liên hệ

- **Tác giả**: NhaTruong
- **Email**: your-email@example.com
- **GitHub**: [@NT912](https://github.com/NT912)

---

<div align="center">

_Xây dựng tương lai tài chính thông minh_

_Made with ❤️ by NhaTruong_

</div>
