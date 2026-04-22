const express = require('express');
const cors = require('cors');
const path = require('path'); // 1. Bổ sung thư viện xử lý đường dẫn
require('dotenv').config();
const connectDB = require('./config/db');

// Khởi tạo App & Kết nối DB
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// 2. THÊM DÒNG NÀY ĐỂ MỞ QUYỀN TRUY CẬP ẢNH
// Cho phép Mobile App đọc file trong thư mục 'uploads' qua URL: http://.../uploads/ten-anh.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const predictRoutes = require('./routes/predictRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Định tuyến API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/predict', predictRoutes);
app.use('/api/v1/reports', reportRoutes);

// Chạy Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Ngập Biết Trước đang chạy tại http://localhost:${PORT}`);
});