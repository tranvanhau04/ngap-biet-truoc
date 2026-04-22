const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/vehicle', authMiddleware, userController.updateVehicle);
// Thêm dòng này: API Lấy hồ sơ (Dùng cho màn hình Profile)
router.get('/profile', authMiddleware, userController.getUserProfile);
module.exports = router;