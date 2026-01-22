# Đặc Sản Việt Mobile App

Ứng dụng React Native TypeScript cho dịch vụ đặc sản Việt Nam với giao diện hiện đại, vibrant và tối ưu trải nghiệm người dùng.

## ✨ Tính năng chính

- **Intro Screen**: Loading thương hiệu với animation mượt mà (10s)
- **Welcome Screen**: Hero landing page với features và CTA buttons
- **Login**: Đăng nhập bằng email/username với validation
- **Register**: Form đăng ký đầy đủ với 6 trường thông tin
- **Homepage**: Dashboard hiển thị thông tin user và quick actions

## 🎨 Design System (2026 Redesign)

### Theme: Vietnamese Food Service

- **Primary Color**: `#DC2626` (Vibrant Red)
- **Secondary Color**: `#F87171` (Light Red)
- **Accent/CTA**: `#CA8A04` (Gold)
- **Background**: `#FEF2F2` (Light Red Tint)

### Style: Vibrant & Block-based

- Bold, energetic, playful design
- Geometric shapes với high contrast
- Large sections (48px+ gaps)
- Smooth transitions (200-300ms)
- Rounded corners (8-24px)

### Typography

- **Font Family**: Be Vietnam Pro (system fallback)
- **Sizes**: 36px (H1), 28px (H2), 24px (H3), 20px (H4)
- **Line Height**: Optimized cho Vietnamese text

### Key Features

- ✅ Accessibility labels trên mọi interactive elements
- ✅ Smooth animations với spring effects
- ✅ Consistent shadows và elevation
- ✅ Focus states rõ ràng
- ✅ No emojis - chỉ FontAwesome icons
- ✅ Responsive flexbox layout

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js 16+
- npm hoặc yarn
- Expo CLI
- iOS Simulator / Android Emulator hoặc thiết bị thật

### Cài đặt dependencies

```bash
npm install
```

### Cấu hình API

Chỉnh API base URL trong [services/api.ts](services/api.ts):

```typescript
const API_BASE_URL = "http://YOUR_IP:3001/api";
```

### Chạy ứng dụng

```bash
# Start Expo development server
npm start

# Chạy trên iOS
npm run ios

# Chạy trên Android
npm run android

# Chạy trên web
npm run web
```

## 📁 Cấu trúc Project

```
react-native-mobile/
├── screens/              # Các màn hình chính
│   ├── IntroScreen.tsx       # Loading screen
│   ├── WelcomeScreen.tsx     # Hero landing
│   ├── LoginScreen.tsx       # Form đăng nhập
│   ├── RegisterScreen.tsx    # Form đăng ký
│   └── HomepageScreen.tsx    # User dashboard
├── constants/
│   └── theme.ts             # Design system tokens
├── services/
│   └── api.ts              # API service layer
├── types/                  # TypeScript definitions
│   ├── api.ts
│   ├── navigation.ts
│   └── profile.ts
└── assets/                 # Images, fonts

```

## 🎯 Screen Flow

```
Intro (10s) → Welcome → Login/Register → Homepage
                 ↓
             Khám phá (guest mode)
```

## 🛠 Tech Stack

- **Framework**: React Native 0.81 + Expo SDK 54
- **Language**: TypeScript 5.9
- **Navigation**: React Navigation 7
- **Icons**: FontAwesome (@expo/vector-icons)
- **Storage**: AsyncStorage
- **HTTP Client**: Axios

## 📱 Screens Showcase

### 1. IntroScreen

- Brand loading với logo animation
- Progress bar 10 giây
- Red theme với spring animation

### 2. WelcomeScreen

- Hero section với brand messaging
- 3 Feature cards (Món Ngon, Chất Lượng, Giao Nhanh)
- Bold CTA buttons (Đăng Nhập / Đăng Ký)

### 3. LoginScreen

- Clean form với 2 inputs
- Email/Username + Password
- Show/hide password toggle
- Focus states với red accent
- Loading spinner

### 4. RegisterScreen

- Comprehensive form với 6 fields:
  - Họ và tên (required)
  - Tên đăng nhập (required)
  - Email (required)
  - Số điện thoại (optional)
  - Mật khẩu + Xác nhận (required)
- Real-time validation
- Reusable input component

### 5. HomepageScreen

- Hero header với gradient background
- Profile avatar với status badge
- Info cards với user details
- Quick actions grid (Cập nhật, Cài đặt, Trợ giúp)
- Logout button

## 🎨 Design Principles

### Vibrant & Energetic

- Large gaps (48px+) cho breathable layout
- Bold color blocks
- High contrast cho readability
- Geometric shapes

### User-Centric

- Clear call-to-actions
- Intuitive navigation
- Helpful error messages
- Smooth transitions

### Accessibility First

- All interactive elements có labels
- Screen reader support ready
- Focus states visible
- Color không phải indicator duy nhất

## 🔒 Security Notes

⚠️ **Lưu ý**: App này được thiết kế cho mục đích học tập:

- Không có OTP verification
- Không sử dụng JWT tokens
- Password không được hash ở client
- Không có refresh token mechanism

Cho production app, nên thêm:

- JWT authentication
- Secure storage cho tokens
- OTP/2FA verification
- Password hashing
- Rate limiting
- HTTPS only

## 📝 API Endpoints

Xem chi tiết trong [services/api.ts](services/api.ts):

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/logout` - Đăng xuất
- `GET /users/me` - Lấy thông tin user

## 🐛 Known Issues

Không có issues nào được report. Nếu gặp lỗi, vui lòng tạo issue mới.

## 📄 License

MIT License - Free to use for learning purposes

## 👥 Credits

- **Design System**: ui-ux-pro-max.prompt.md
- **Icons**: FontAwesome
- **Framework**: React Native + Expo
- **Backend**: Node.js + Express + MySQL

---

**Đặc Sản Việt** © 2026 - Khám phá hương vị Việt Nam 🇻🇳

````

Chạy ứng dụng:

```bash
npm start
````

Test kết nối API:

```bash
npm run test-api
```

## Luồng điều hướng

```
Intro (loading 10s, logo)
   ↓
Welcome
   ├─ Login → Đăng nhập thành công → Homepage
   └─ Register → Đăng ký thành công → Login
```

## Xác thực (giữ nguyên yêu cầu)

- Không sử dụng OTP cho Register
- Không sử dụng JWT cho Login
- Tuân thủ validation hiện có, không thay đổi business logic/API

## Công nghệ

- React Native, TypeScript, Expo, React Navigation
- Icons: FontAwesome
- HTTP: Axios

## Tài khoản mẫu

- Email: admin@dacsanviet.com
- Username: admin
- Password: admin123

## Cấu trúc chính

- screens/: Intro, Welcome, Login (đã redesign), Register (đã redesign), Homepage
- services/: api.ts
- types/: navigation.ts, api.ts, profile.ts
- constants/: theme.ts
- assets/: logo thương hiệu

---

Nếu hữu ích, hãy để lại ⭐ nhé!# BaiTapTuan1 - Buoi2 - Login and Register

Ứng dụng React Native TypeScript với tích hợp API Authentication, thực hiện chức năng Register và Login không sử dụng OTP và JWT.

## 🎯 Mô tả dự án

Đây là bài tập tuần 1 được nâng cấp với TypeScript và tích hợp API backend. Ứng dụng bao gồm:

- **Intro Screen**: Màn hình loading với logo và progress bar (10 giây)
- **Welcome Screen**: Trang giới thiệu với các nút Đăng nhập/Đăng ký
- **Login Screen**: Form đăng nhập hỗ trợ email hoặc username
- **Register Screen**: Form đăng ký tài khoản mới
- **Homepage Screen**: Hiển thị thông tin cá nhân và chức năng logout

## 🚀 Demo giao diện

### Navigation Flow

```
Intro Screen (10s loading)
    ↓
Welcome Screen (Trang giới thiệu)
    ├── Nút "Đăng Nhập" → Login Screen
    └── Nút "Đăng Ký" → Register Screen
         ↓ (thành công)
Homepage Screen (Thông tin cá nhân)
    ↓ (logout)
Welcome Screen
```

### Tính năng giao diện

- **Intro Screen**:
  - Logo animation với fade in effect
  - Progress bar loading 10 giây
  - Tự động chuyển sang Welcome Screen

- **Welcome Screen**:
  - Logo và thông điệp chào mừng
  - 3 feature highlights với icons
  - Nút "Đăng Nhập" (primary button)
  - Nút "Đăng Ký" (outline button)
  - Nút "Xem thử" (ghost button)

- **Login Screen**:
  - Form đăng nhập với validation
  - Hỗ trợ đăng nhập bằng **email hoặc username**
  - Toggle hiển thị/ẩn password
  - Loading state khi đang xử lý
  - Nút back về Welcome Screen

- **Register Screen**:
  - Form đăng ký đầy đủ với validation
  - Các trường: Username, Họ tên, Email, SĐT, Password, Confirm Password
  - Toggle hiển thị/ẩn password
  - Validation real-time
  - Nút back về Welcome Screen

- **Homepage Screen**:
  - Header với avatar và thông tin user
  - Hiển thị thông tin từ API (username, email, phone, role, status)
  - Các section: Sở thích, Kỹ năng, Mục tiêu
  - Nút logout ở header

## 🔧 Công nghệ sử dụng

### Frontend

- **React Native**: Framework chính
- **TypeScript**: Type safety
- **Expo**: Development platform
- **React Navigation 7**: Navigation system
- **FontAwesome Icons**: Icon library
- **Axios**: HTTP client
- **AsyncStorage**: Local storage

### Backend API

- **Node.js**: Runtime
- **Express.js**: Web framework
- **MySQL**: Database
- **bcrypt**: Password hashing
- **Session-based Authentication**: Không sử dụng JWT

## 📱 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình API

Cập nhật IP address trong `services/api.ts`:

```typescript
const API_BASE_URL = "http://YOUR_IP:3001/api";
```

### 3. Chạy API Server

```bash
cd ../GroupAPI_MySQL
npm start
```

### 4. Chạy React Native App

```bash
npm start
```

### 5. Test trên thiết bị

- **Android**: Quét QR code bằng Expo Go
- **iOS**: Quét QR code bằng Camera app
- **Web**: Mở http://localhost:8081

## 🧪 Testing

### Test API Connection

```bash
npm run test-api
```

### Test TypeScript

```bash
npm run type-check
```

### Manual Testing Flow

1. **Intro Screen**: Xem animation loading 10 giây
2. **Welcome Screen**: Nhấn các nút điều hướng
3. **Register**: Tạo tài khoản mới với validation
4. **Login**: Đăng nhập bằng email hoặc username
5. **Homepage**: Xem thông tin user và test logout

## 🔐 Authentication Features

### Login

- **Flexible Input**: Chấp nhận cả email và username
- **Validation**: Kiểm tra input không rỗng
- **Session Management**: Lưu session ID và user data
- **Error Handling**: Hiển thị lỗi từ API

### Register

- **Full Validation**: Username (min 3), email format, password (min 6)
- **Confirm Password**: Kiểm tra khớp với password
- **Optional Fields**: Phone number không bắt buộc
- **Unique Check**: API kiểm tra email/username đã tồn tại

### Session Management

- **AsyncStorage**: Lưu session ID và user data local
- **Auto Logout**: Khi session hết hạn
- **Secure**: Session-based thay vì JWT

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập (email hoặc username)
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/check-session` - Kiểm tra session

### Example Login Request

```json
{
  "emailOrUsername": "admin@dacsanviet.com",
  "password": "admin123"
}
```

## 🔍 Validation Rules

### Login

- **Email/Username**: Không được rỗng
- **Password**: Không được rỗng

### Register

- **Username**: Min 3 ký tự, không có khoảng trắng
- **Email**: Format email hợp lệ
- **Password**: Min 6 ký tự
- **Confirm Password**: Phải khớp với password
- **Full Name**: Bắt buộc
- **Phone**: Tùy chọn, format số điện thoại

## 🛡️ Security Features

- **Password Hashing**: bcrypt với salt rounds
- **Session-based Auth**: Không sử dụng JWT
- **Input Validation**: Client và server side
- **SQL Injection Prevention**: Prepared statements
- **Secure Storage**: AsyncStorage cho session data

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Flexible Layout**: Sử dụng Flexbox
- **Screen Adaptation**: Tự động điều chỉnh theo màn hình
- **Touch Friendly**: Buttons và inputs có kích thước phù hợp

## 🚨 Error Handling

- **Network Errors**: Hiển thị thông báo kết nối
- **Validation Errors**: Highlight fields lỗi
- **API Errors**: Hiển thị message từ server
- **Loading States**: Disable buttons khi đang xử lý

## 📈 Performance

- **TypeScript**: Type safety và better IDE support
- **Optimized Images**: WebP format cho logo
- **Lazy Loading**: Components load khi cần
- **Memory Management**: Proper cleanup cho timers

## 🎯 Test Accounts

### Admin Account

- **Email**: admin@dacsanviet.com
- **Username**: admin
- **Password**: admin123

### Test Account (tự tạo)

- Sử dụng form Register để tạo tài khoản test

## 🎨 UI/UX Design

### Color Scheme

- **Primary**: #667eea (Blue gradient)
- **Success**: #2ecc71 (Green)
- **Warning**: #f39c12 (Orange)
- **Error**: #e74c3c (Red)
- **Background**: #f5f7fa (Light gray)

### Typography

- **Headers**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Captions**: Light, 12px

### Components

- **Buttons**: Rounded corners, shadows, icons
- **Input Fields**: Clean design với icons
- **Cards**: Shadow effects, rounded corners
- **Loading States**: Activity indicators

## 📁 Cấu trúc project

```
BaiTapTuan1_TypeScript/
├── screens/
│   ├── IntroScreen.tsx          # Loading screen
│   ├── WelcomeScreen.tsx        # Trang giới thiệu (mới)
│   ├── LoginScreen.tsx          # Đăng nhập
│   ├── RegisterScreen.tsx       # Đăng ký
│   └── HomepageScreen.tsx       # Trang chính
├── services/
│   └── api.ts                   # API service layer
├── types/
│   ├── navigation.ts            # Navigation types
│   ├── api.ts                   # API types
│   └── profile.ts               # Profile types
├── constants/
│   └── theme.ts                 # Theme constants
├── assets/
│   └── dacsanvietLogo.webp     # Logo
└── App.tsx                      # Main app component
```

## Demo Giao diện

<table>
  <tr>
    <td align="center">
      <img src="screenshots/loadingScreen.png" width="280"/><br/>
      <em>Màn hình loading</em>
    </td>
    <td align="center">
      <img src="screenshots/homePage.png" width="280"/><br/>
      <em>Giao diện trang chủ giới thiệu bản thân</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/welcome.png" width="280"/><br/>
      <em>Màn hình Welcome</em>
    </td>
    <td align="center">
      <img src="screenshots/loginScreen.png" width="280"/><br/>
      <em>Giao diện trang đăng nhập đơn giản</em>
    </td>
    <td align="center">
      <img src="screenshots/registerScreen.png" width="280"/><br/>
      <em>Giao diện trang đăng ký đơn giản</em>
    </td>
  </tr>
</table>

## 📝 Changelog

### Version 2.0.0 (Current)

- ✅ Thêm Welcome Screen với UI/UX đẹp
- ✅ Login hỗ trợ email và username
- ✅ Tích hợp API MySQL backend
- ✅ Session management hoàn chỉnh
- ✅ TypeScript type safety
- ✅ Error handling và validation
- ✅ Responsive design

### Version 1.0.0

- ✅ Basic Intro và Homepage screens
- ✅ Static content display

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🧑‍💻 Tác giả

</div>
