const Report = require('../models/Report');

// 1. Người dùng gửi báo cáo điểm ngập mới (Đã hỗ trợ kèm Ảnh)
exports.createReport = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ body (Dùng toàn bộ dấu gạch dưới cho chuẩn)
        const { ten_duong, muc_ngap_uoc_tinh, mo_ta } = req.body;
        const userId = req.user.id;

        let hinh_anh_url = "";
        if (req.file) {
            hinh_anh_url = `/uploads/${req.file.filename}`;
        }

        const newReport = new Report({
            user_id: userId,
            ten_duong,
            // 2. SỬA TẠI ĐÂY: Tên biến phải khớp y hệt dòng const ở trên
            muc_ngap_uoc_tinh: Number(muc_ngap_uoc_tinh), 
            mo_ta,
            hinh_anh_url 
        });

        await newReport.save();
        res.status(201).json({ message: 'Cảm ơn bạn đã báo cáo!', report: newReport });
    } catch (error) {
        console.log("Lỗi lưu báo cáo:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Mobile App lấy danh sách báo cáo để ghim lên Bản đồ
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 }) 
            .limit(50) 
            .populate('user_id', 'ho_ten'); 

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};