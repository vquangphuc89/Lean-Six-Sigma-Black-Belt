# 🔥 Hướng Dẫn Tích Hợp Firebase Cloud Sync (Tự Động Đồng Bộ Đa Thiết Bị)

Hệ thống **Lean Six Sigma Black Belt Masterclass** đã được tích hợp sẵn kiến trúc đám mây Firebase (Authentication & Cloud Firestore). Khi hoàn thành hướng dẫn 5 phút này, toàn bộ tiến độ học, ghi chú, điểm kiểm tra và bài hoàn thành sẽ **tự động đồng bộ thời gian thực** giữa máy tính công ty, laptop ở nhà và điện thoại!

> [!NOTE]
> **Hoàn toàn Miễn Phí (Firebase Spark Plan):**
> Google cung cấp gói miễn phí vĩnh viễn không cần nhập thẻ ngân hàng (Visa/Mastercard), hỗ trợ lưu trữ 1GB dữ liệu và 50.000 lượt truy cập/ngày — hoàn toàn đáp ứng trọn vẹn việc tự học và chia sẻ trong đội ngũ.

---

## 📋 Bước 1: Tạo Dự Án Firebase Trên Google

1. Truy cập [console.firebase.google.com](https://console.firebase.google.com) và đăng nhập bằng tài khoản Google (Gmail) của anh.
2. Nhấn vào nút **"Add project"** (hoặc **"Tạo dự án"**).
3. Đặt tên cho dự án: ví dụ `lean-six-sigma-black-belt` ➔ Nhấn **Continue**.
4. Ở bước Google Analytics: Anh có thể **Tắt (Disable)** để thiết lập nhanh gọn hơn ➔ Nhấn **Create project**.
5. Chờ vài giây Google khởi tạo, sau đó nhấn **Continue** để vào bảng điều khiển.

---

## 🔑 Bước 2: Bật Xác Thực Học Viên (Firebase Authentication)

1. Ở thanh menu bên trái, tìm mục **Build** ➔ chọn **Authentication**.
2. Nhấn nút **Get started**.
3. Tại tab **Sign-in method**, bật các phương thức đăng nhập sau:
   * **Email/Password:** Bấm chọn ➔ Gạt nút **Enable** sang màu xanh ➔ Nhấn **Save**.
   * **Google (Tùy chọn tiện lợi - Khuyên dùng):** Bấm chọn Google ➔ Gạt **Enable** sang màu xanh ➔ Chọn email hỗ trợ của anh trong ô *Project support email* ➔ Nhấn **Save**.

---

## 🗄️ Bước 3: Bật Cơ Sở Dữ Liệu Đám Mây (Cloud Firestore)

1. Ở thanh menu bên trái, mục **Build** ➔ chọn **Firestore Database**.
2. Nhấn nút **Create database**.
3. Chọn vị trí lưu trữ (**Location**): Chọn `asia-southeast1 (Singapore)` để tốc độ truy cập từ Việt Nam nhanh nhất.
4. Chọn chế độ bảo mật ban đầu: Chọn **Start in test mode** (hoặc Production) ➔ Nhấn **Next** ➔ Nhấn **Create**.
5. Sau khi tạo xong, chuyển sang tab **Rules** ở trên cùng, dán đoạn mã phân quyền an toàn sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mỗi học viên chỉ được đọc & ghi đúng dữ liệu học tập của chính mình
    match /study_data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Mỗi học viên chỉ được đọc & ghi đúng hồ sơ cá nhân của chính mình
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
6. **BẮT BUỘC:** Nhấn nút **Publish** màu xanh ở góc trên để quy tắc có hiệu lực ngay lập tức (Nếu không bấm Publish, Firebase sẽ chặn toàn bộ đồng bộ giữa các máy — đây chính là nguyên nhân phổ biến nhất khiến lỗi "Missing or insufficient permissions" xuất hiện dù đã đăng nhập thành công).

> Rule này cũng đã được lưu sẵn trong file [`firestore.rules`](firestore.rules) ở gốc dự án. Nếu đã cài [Firebase CLI](https://firebase.google.com/docs/cli), bạn có thể publish rule bằng lệnh sau thay vì copy/paste thủ công mỗi lần:
> ```bash
> npm install -g firebase-tools
> firebase login
> firebase deploy --only firestore:rules
> ```

---

## ⚙️ Bước 4: Lấy 6 Biến Cấu Hình Web App

1. Nhấn vào biểu tượng bánh răng **Project settings ⚙️** (nằm ở góc trên bên trái, cạnh chữ *Project Overview*).
2. Cuộn xuống phần **"Your apps"**, nhấn vào biểu tượng Web: `</>`.
3. Nhập tên đại diện: `LSS Web` (không cần tick *Firebase Hosting*) ➔ Nhấn **Register app**.
4. Firebase sẽ hiển thị đoạn mã chứa `firebaseConfig`. Anh sẽ thấy 6 thông số tương tự như sau:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
  authDomain: "lean-six-sigma-xxxxx.firebaseapp.com",
  projectId: "lean-six-sigma-xxxxx",
  storageBucket: "lean-six-sigma-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## 🚀 Bước 5: Cấu Hình Để Web Trên Vercel Tự Động Đồng Bộ

Để trang web `https://lean-six-sigma-black-belt.vercel.app` kết nối với Cloud:

1. Truy cập [vercel.com/dashboard](https://vercel.com/dashboard).
2. Chọn dự án **`lean-six-sigma-black-belt`**.
3. Vào tab **Settings** ➔ Chọn mục **Environment Variables** ở menu bên trái.
4. Thêm lần lượt 6 biến môi trường (copy chính xác giá trị từ Bước 4):

| Key (Tên biến) | Value (Giá trị từ Firebase) |
|---|---|
| `VITE_FIREBASE_API_KEY` | Giá trị của `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Giá trị của `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Giá trị của `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Giá trị của `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Giá trị của `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Giá trị của `appId` |

5. Sau khi thêm đủ 6 biến, chuyển sang tab **Deployments** trên Vercel ➔ Bấm vào dấu `...` ở bản deploy mới nhất ➔ Chọn **Redeploy**.

---

## 💻 Bước 6: Cấu Hình Khi Chạy Trên Máy Tính Cá Nhân (Tùy Chọn)

Nếu anh muốn chạy code trực tiếp dưới máy (`npm run dev`):
1. Trong thư mục dự án `E:\OneDrive\Desktop\Lean Six Sigma Black Belt\`, tạo một tệp mới tên là `.env.local`.
2. Dán 6 biến trên vào file `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=lean-six-sigma-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lean-six-sigma-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=lean-six-sigma-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## ✅ Trải Nghiệm Sau Khi Kích Hoạt

1. Mở trang web, nhìn lên thanh menu góc phải sẽ thấy huy hiệu **🟢 Cloud Ready** (hoặc **Cloud Synced**).
2. Bấm **Đăng Nhập** (hoặc bấm **Đăng ký** bằng email của anh, hoặc đăng nhập 1 chạm bằng Google).
3. Học và tick hoàn thành các bài học.
4. **Kiểm tra thần tốc:** Mở một cửa sổ ẩn danh (Ctrl + Shift + N) hoặc dùng điện thoại truy cập web ➔ Đăng nhập cùng tài khoản đó ➔ **Toàn bộ bài học, tiến độ và ghi chú sẽ tự động xuất hiện ngay lập tức!**
