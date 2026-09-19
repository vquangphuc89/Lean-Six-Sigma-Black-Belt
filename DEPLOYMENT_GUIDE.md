# 🚀 Hướng Dẫn Triển Khai Nền Tảng LSS Lên Vercel Qua GitHub

Trang web tự học **Lean Six Sigma Black Belt Masterclass** được kiến trúc sẵn sàng 100% để triển khai tự động lên [Vercel](https://vercel.com) thông qua GitHub hoàn toàn miễn phí.

Mỗi khi bạn bổ sung bài học mới vào thư mục `sources/` hoặc cập nhật nội dung, bạn chỉ cần thực hiện `git push`, Vercel sẽ tự động build và cập nhật trang web trực tuyến trong vòng **30 giây**.

---

## 🛠️ Bước 1: Khởi Tạo Git Repository Tại Máy Tính

Mở terminal (PowerShell hoặc Git Bash) tại thư mục dự án `E:\OneDrive\Desktop\Lean Six Sigma Black Belt` và chạy các lệnh sau:

```bash
# 1. Khởi tạo kho git (nếu chưa có)
git init

# 2. Thêm toàn bộ mã nguồn và học liệu
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: initialize Lean Six Sigma Black Belt learning platform"
```

---

## 🐙 Bước 2: Tạo Repository Trên GitHub & Đẩy Code Lên

1. Truy cập [github.com](https://github.com) và đăng nhập tài khoản của bạn.
2. Nhấn nút **"New repository"** (hoặc dấu `+` ở góc trên cùng bên phải).
3. Đặt tên repository (ví dụ: `lean-six-sigma-black-belt`).
4. Chọn chế độ **Public** (hoặc **Private** tùy nhu cầu của bạn).
5. **Không tick chọn** "Add a README file" hay ".gitignore" (vì trong dự án đã có sẵn).
6. Nhấn nút **"Create repository"**.
7. Chạy 3 lệnh sau trong PowerShell để liên kết và đẩy code lên:

```bash
# Đổi nhánh chính thành main
git branch -M main

# Thêm địa chỉ remote (thay <your-username> và <repo-name> bằng link github của bạn)
git remote add origin https://github.com/<your-username>/<repo-name>.git

# Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## ⚡ Bước 3: Kết Nối Với Vercel (Chỉ Cần Làm 1 Lần Duy Nhất)

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản **GitHub**.
2. Tại màn hình Dashboard của Vercel, nhấn nút **"Add New..."** ➔ chọn **"Project"**.
3. Bạn sẽ thấy danh sách các repository trên GitHub của mình ➔ Tìm `lean-six-sigma-black-belt` và nhấn **"Import"**.
4. Cấu hình triển khai:
   * **Framework Preset:** Vercel sẽ tự động nhận diện là **Vite**.
   * **Build Command:** `npm run build` (Mặc định).
   * **Output Directory:** `dist` (Mặc định).
5. Nhấn nút **"Deploy"** màu xanh.
6. Chờ khoảng 30 đến 45 giây, Vercel sẽ cung cấp cho bạn một đường link website trực tuyến dạng:
   👉 `https://lean-six-sigma-black-belt.vercel.app`

---

## 🔄 Quy Trình Cập Nhật Bài Học Mới Lên Web (Sau Này)

Bất kỳ khi nào bạn hoàn thành biên soạn một bài học mới (hoặc chỉnh sửa bài học hiện có):

```bash
# 1. Lưu thay đổi
git add .

# 2. Commit nội dung mới
git commit -m "update: hoàn thành bài học mới"

# 3. Đẩy lên GitHub
git push
```

**Tất cả diễn ra tự động:** GitHub sẽ gửi tín hiệu sang Vercel để kích hoạt quy trình build lại và cập nhật nội dung mới nhất ngay tức thì mà bạn không cần phải thao tác thủ công gì thêm!

---

## 💾 Tính Năng Bảo Toàn Tiến Độ Học Tập Trên Vercel

* **Bộ nhớ LocalStorage:** Toàn bộ trạng thái bài đã học, bookmark ⭐, điểm số trắc nghiệm và ghi chú cá nhân của bạn được lưu an toàn trực tiếp trên trình duyệt của bạn.
* **Tính năng Sao lưu (Export / Import):** Bạn có thể nhấn vào nút biểu tượng **Database 🗄️** trên thanh Header của trang web để tải tệp JSON sao lưu về máy, giúp bạn chuyển đổi máy tính hoặc học trên điện thoại/máy tính bảng mà không bao giờ bị mất tiến độ.
