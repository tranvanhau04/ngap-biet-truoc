const User = require('../models/User');

exports.updateVehicle = async (req, res) => {
    try {
        const { loai_xe, khoang_sang_gam_xe_cm } = req.body;
        const userId = req.user.id; // Lấy từ authMiddleware

        const user = await User.findByIdAndUpdate(
            userId, 
            { thong_tin_xe: { loai_xe, khoang_sang_gam_xe_cm } }, 
            { new: true }
        );
        res.json({ message: 'Cập nhật xe thành công', thong_tin_xe: user.thong_tin_xe });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Lấy thông tin hồ sơ người dùng
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Lấy user nhưng giấu đi trường password
        const user = await User.findById(userId).select('-password'); 
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};