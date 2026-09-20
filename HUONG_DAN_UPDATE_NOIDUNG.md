# Hướng Dẫn Cập Nhật Nội Dung Bài Học Mới

Tài liệu này hướng dẫn cách thêm bài học mới (hoặc cả một Phân hệ/Chuyên đề mới) vào website **Lean Six Sigma Black Belt Masterclass**, từ lúc soạn file cho đến khi nó xuất hiện trên trang web thật.

---

## 1. Hiểu luồng dữ liệu (đọc 1 lần cho chắc)

```
sources/                          ← Bạn thêm/sửa file .html tại đây
   │
   │  npm run index-curriculum  (hoặc tự động khi chạy npm run build)
   ▼
scripts/generate-curriculum.js    ← Quét toàn bộ sources/, đọc metadata mỗi bài
   │
   ├──► public/sources/           ← Copy y hệt sources/ sang đây để Vite phục vụ file tĩnh
   │
   └──► src/data/curriculum.json  ← Sinh ra "mục lục" toàn khóa học (React đọc từ đây)
```

**Quan trọng:** Bạn **không bao giờ** sửa tay file `src/data/curriculum.json` hay thư mục `public/sources/` — hai thứ này luôn được máy tự sinh ra từ nội dung trong `sources/`. Mọi thay đổi bạn cần làm chỉ diễn ra bên trong thư mục `sources/`.

---

## 2. Quy tắc đặt tên thư mục & file (BẮT BUỘC tuân thủ)

Cấu trúc 3 cấp: **Phân hệ (Module) → Chuyên đề (Subtopic) → Bài học (Lesson)**

```
sources/
└── 01. Foundation Vision/                 ← Module: "SỐ THỨ TỰ. Tên Module"
    └── 01. Introduction/                  ← Subtopic: "SỐ THỨ TỰ. Tên Subtopic"
        ├── 01.Welcome to MindPro.html     ← Lesson: "SỐ THỨ TỰ.Tên Bài Học.html"
        ├── 02.Understanding Lean...html
        └── 03.Innovation versus...html
```

* **Số thứ tự ở đầu tên quyết định thứ tự hiển thị** trên Sidebar/Dashboard (hệ thống sắp xếp theo số, không phải theo bảng chữ cái). Ví dụ `02.` sẽ luôn đứng trước `10.` — không bị lỗi như sắp chữ thường (`10` đứng trước `2`).
* Module và Subtopic: viết `SỐ. Tên` (có dấu cách sau dấu chấm).
* File bài học: viết `SỐ.Tên Bài Học.html` (thường không có dấu cách sau dấu chấm, nhưng có hay không đều được sắp xếp đúng).
* Chỉ file đuôi **`.html`** mới được hệ thống nhận diện là bài học. Các file khác (`.xlsx`, `.docx`, `.pdf`…) để tham khảo riêng thì đặt ở đâu cũng được, hệ thống sẽ bỏ qua, không đưa vào mục lục.
* Muốn thêm **Quiz tổng ôn tập** cuối chuyên đề: đặt tên file kiểu `Quiz - Tên Chuyên Đề Review.html` trong đúng thư mục Subtopic đó — nó sẽ tự động xếp ở cuối danh sách bài học của chuyên đề (vì không có số đứng đầu).

### Thêm Module / Chuyên đề mới hoàn toàn
Chỉ cần tạo thêm thư mục con theo đúng quy tắc trên (ví dụ `sources/05. Measure Phase/`) — hệ thống sẽ tự nhận diện, không cần khai báo gì thêm ở nơi khác.

### Thêm 1 bài học vào Chuyên đề đã có sẵn
Copy 1 file `.html` mới vào đúng thư mục Subtopic, đặt số thứ tự tiếp theo (ví dụ Subtopic đang có tới bài `07.`, thì bài mới đặt là `08.Tên Bài.html`).

> Nếu chèn bài vào **giữa** danh sách (ví dụ chèn giữa bài 03 và 04), bạn cần đổi số các file phía sau (04→05, 05→06...) để tránh trùng số thứ tự.

---

## 3. Bài học phải đúng chuẩn "5 Trụ Cột" (SSMI MindPro Standard)

Mọi file `.html` bài học **bắt buộc** tuân theo khung kiến trúc chi tiết đã quy định trong [`process.md`](process.md) (Executive Summary → Core Frameworks & Pure Math → Case Studies VS Grid → Interactive Arena 8 câu quiz + Flashcard 3D → Action Checklist), dùng chung bộ màu "Đại Lâm Mộc". **Đọc kỹ file `process.md` trước khi soạn bài mới** — đó là bản quy chuẩn đầy đủ nhất, tài liệu này không lặp lại toàn bộ.

Riêng có **4 điểm bắt buộc** ảnh hưởng trực tiếp đến việc hiển thị trên Dashboard/Sidebar mà bạn dễ quên nhất:

| Thẻ HTML cần có | Vai trò | Ví dụ |
|---|---|---|
| `<title>...</title>` | Tiêu đề bài học hiển thị trong danh sách | `<title>Bài 08: Tên Bài — Six Sigma Masterclass</title>` |
| `<h1 class="hero-title">` | Tiêu đề chính hiển thị trong trang đọc bài | `Thấu Hiểu Lean, Six Sigma...` |
| `<div class="hero-title-en">` | Phụ đề tiếng Anh | `Understanding Lean, Six Sigma...` |
| `<p class="hero-desc">` | Mô tả ngắn (tóm tắt điều hành) hiển thị ở Dashboard | 1-2 câu mô tả bài học |

Ngoài ra hệ thống tự đếm số lượng theo `class`, dùng để hiển thị badge trên thẻ bài học — cần đặt đúng class thì đếm mới chính xác:
* `class="quiz-card"` → đếm số câu hỏi trắc nghiệm
* `class="flashcard"` → đếm số thẻ flashcard
* `class="action-item"` → đếm số bước trong Action Checklist

**Mẹo nhanh nhất:** Copy nguyên 1 file bài học đã có sẵn (ví dụ `sources/01. Foundation Vision/01. Introduction/02.Understanding Lean, Six Sigma, and Lean Six Sigma.html`) làm khung mẫu, rồi thay nội dung — đảm bảo không thiếu class/thẻ nào.

---

## 4. Quy trình cập nhật từng bước

### Bước 1 — Soạn & đặt file đúng vị trí
Thêm/sửa file `.html` trong `sources/` theo đúng quy tắc ở Mục 2 và 3.

### Bước 2 — Sinh lại mục lục (chạy 1 lệnh)
Mở terminal tại thư mục dự án, chạy:
```bash
npm run index-curriculum
```
Lệnh này quét lại toàn bộ `sources/`, copy sang `public/sources/`, và ghi lại `src/data/curriculum.json`. Terminal sẽ in ra tổng số Module/Chuyên đề/Bài học để bạn đối chiếu số lượng.

### Bước 3 — Xem thử trên máy (Local Preview)
```bash
npm run dev
```
Mở trình duyệt vào địa chỉ terminal in ra (thường là `http://localhost:5173`) để kiểm tra bài học mới hiển thị đúng, đọc được, quiz chạy đúng.

> ⚠️ **Lưu ý:** `npm run dev` **không tự động** chạy lại bước sinh mục lục. Nếu bạn thêm bài mới trong lúc `npm run dev` đang chạy mà không thấy bài học xuất hiện, hãy dừng server (Ctrl+C), chạy lại `npm run index-curriculum`, rồi `npm run dev` lại.

### Bước 4 — Đẩy lên website chính thức (Deploy)
Sau khi ưng ý, đẩy code lên GitHub — Vercel sẽ **tự động** chạy `npm run build` (đã bao gồm bước sinh mục lục) và cập nhật web trong ~30 giây:
```bash
git add .
git commit -m "content: thêm bài học [Tên bài học/Chuyên đề]"
git push
```
Không cần chạy `npm run index-curriculum` thủ công trước khi push — vì Vercel tự làm lại bước đó trong quá trình build. Chạy nó ở Bước 2 chỉ để bạn xem thử ở Bước 3 trên máy mình thôi.

---

## 5. Các lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Bài học không xuất hiện trên web | Sai đuôi file (không phải `.html`), hoặc quên chạy `npm run index-curriculum` trước khi `npm run dev` | Kiểm tra đuôi file, chạy lại lệnh sinh mục lục |
| Bài học hiển thị sai thứ tự | Thiếu số thứ tự ở đầu tên file/thư mục, hoặc 2 file trùng số | Đặt lại số thứ tự tăng dần, không trùng |
| Tiêu đề/mô tả bài học bị trống hoặc sai trên Dashboard | Thiếu thẻ `<title>`, `.hero-title-en`, hoặc `.hero-desc` | Bổ sung đúng 3 thẻ này theo Mục 3 |
| Badge số câu quiz/flashcard hiển thị `0` dù bài có quiz | Sai tên `class` (không đúng `quiz-card` / `flashcard` / `action-item`) | Kiểm tra lại đúng chính tả class trong file HTML |
| Giao diện bài học lệch màu/layout so với các bài khác | Không dùng đúng bộ biến màu `:root` chuẩn trong `process.md` | Copy khung `<style>` từ 1 bài mẫu đã đúng chuẩn, không tự chế màu mới |

---

## 6. Tóm tắt siêu ngắn (cheat-sheet)

1. Soạn file `.html` theo chuẩn `process.md`, đặt đúng số thứ tự trong `sources/Module/Subtopic/`.
2. `npm run index-curriculum` → xem thử `npm run dev`.
3. Ưng ý → `git add .` → `git commit -m "..."` → `git push`.
4. Chờ ~30 giây, Vercel tự deploy xong.
