const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Thêm thư viện quản lý file của Node.js
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware'); 

// --- TỰ ĐỘNG TẠO THƯ MỤC NẾU CHƯA CÓ ---
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Cấu hình Multer 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Trỏ thẳng vào thư mục đã tạo ở trên
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 2. Định nghĩa Route 
router.post('/', authMiddleware, upload.single('hinh_anh'), reportController.createReport);
router.get('/', reportController.getAllReports);

module.exports = router;