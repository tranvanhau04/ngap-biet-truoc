
# 🌊 Ngập Biết Trước (Innogreen) - Dự án Cộng đồng

Đây là ứng dụng sử dụng Trí tuệ nhân tạo (AI) và dữ liệu cộng đồng thời gian thực để cảnh báo ngập lụt tại khu vực TP.HCM. Dự án giúp người đi xe máy chủ động chọn lộ trình an toàn, tránh thủy kích và giảm thiểu thiệt hại kinh tế cho người dân.

---

## 👥 Đội ngũ thực hiện (GreenFlow Team)
* **Trần Văn Hậu** (PM) - Phát triển Full-stack & AI.
* **Tô Hoàng Thành** - Đồng sáng lập & Phát triển dự án.
* **Cao Thành Đông** - Thành viên nòng cốt.
* **Đơn vị:** Khoa Công nghệ Thông tin - Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH).

---

## 📂 Cấu trúc dự án (Monorepo)
Dự án được tổ chức theo cấu trúc Monorepo để dễ dàng quản lý đồng bộ:
* `/ai-model`: Huấn luyện mô hình Random Forest Regressor bằng Python.
* `/backend-server`: API Server xử lý logic bằng Node.js (Express) và Database.
* `/mobile-app`: Ứng dụng di động đa nền tảng sử dụng React Native (Expo).

---

## 🧠 Logic AI & Dữ liệu đầu vào
Hệ thống sử dụng mô hình học máy để dự báo mức ngập dựa trên 5 biến số lõi:
* **X1 (Lượng mưa - mm):** Lấy từ trạm vệ tinh NASA.
* **X2 (Đỉnh triều cường - m):** Lấy từ trạm Vũng Tàu.
* **X3 (Cao độ địa hình - m):** Dữ liệu cao độ từ Open-Meteo Elevation.
* **X4 (Tình trạng cống/Điểm đen):** Dữ liệu khảo sát từ UDI Maps.
* **X5 (Khoảng sáng gầm xe - cm):** Thông số cá nhân hóa do người dùng nhập.

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Local)

Để hệ thống hoạt động hoàn chỉnh, bạn cần chạy song song 3 dịch vụ này trên 3 Terminal khác nhau.

### 1. Phân hệ AI-Model (Python)
**Yêu cầu:** Python >= 3.9.
```bash
cd ai-model
# 1. Tạo và kích hoạt môi trường ảo
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1 | Mac/Linux: source venv/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Huấn luyện và xuất model (Tạo file ngap_model_v1.pkl)
python train_model.py
```

### 2. Phân hệ Backend-Server (Node.js)
**Yêu cầu:** Node.js & npm.
```bash
cd backend-server
# 1. Cài đặt các gói thư viện
npm install

# 2. Khởi động server API (Mặc định chạy tại http://localhost:3000)
node index.js
```

### 3. Phân hệ Mobile-App (React Native)
**Yêu cầu:** Cài sẵn ứng dụng **Expo Go** trên điện thoại.
```bash
cd mobile-app
# 1. Cài đặt thư viện
npm install

# 2. Khởi động ứng dụng
npx expo start
```
*Gõ `w` để xem trên trình duyệt hoặc quét mã QR bằng Expo Go trên điện thoại để trải nghiệm.*

---

## 🛡️ Quy trình Git dành cho thành viên
Để đảm bảo an toàn cho mã nguồn, vui lòng tuân thủ quy tắc:
1. **Luôn cập nhật**: `git checkout main` -> `git pull origin main` trước khi bắt đầu.
2. **Tạo nhánh riêng**: `git checkout -b <tên_mảng>/<tên_task>` (VD: `mobile/ui-glassmorphism`).
3. **Lưu code**: `git add .` -> `git commit -m "Mô tả công việc"`.
4. **Đẩy code & Review**: `git push origin <tên_nhánh>` và tạo **Pull Request** trên GitHub.

---
*Dự án vì cộng đồng - Vì một thành phố không còn nỗi lo ngập nước.*
```