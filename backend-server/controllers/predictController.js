const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('../models/User');

// 1. TẠO BIẾN LƯU DỮ LIỆU CAO ĐỘ
let danhSachCaoDo = [];

// 2. TỰ ĐỘNG ĐỌC FILE CSV KHI BẬT SERVER
// Lưu ý đường dẫn: từ thư mục controllers lùi ra 1 cấp (..) rồi vào thư mục data
const csvFilePath = path.join(__dirname, '../data/DoCaoDuongGoVap.csv');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    if (row['Độ cao trung bình (m)']) {
      danhSachCaoDo.push({
        ten_duong: row['Tên đường'].toLowerCase(), // Đưa về chữ thường để dễ tìm kiếm
        cao_do: parseFloat(row['Độ cao trung bình (m)'])
      });
    }
  })
  .on('end', () => {
    console.log(`✅ Đã nạp thành công ${danhSachCaoDo.length} dữ liệu cao độ đường Gò Vấp.`);
  });

// 3. HÀM XỬ LÝ DỰ BÁO NGẬP (GỌI TỪ MOBILE)
exports.getFloodPrediction = async (req, res) => {
    try {
        // Lấy các tham số từ App Mobile gửi lên (bao gồm cả destination - tên đường)
        const { luong_mua, dinh_trieu, tinh_trang_cong, destination } = req.body;
        const userId = req.user.id;

        // --- BẮT ĐẦU TÌM CAO ĐỘ TỰ ĐỘNG ---
        let cao_do_duong = 7.5; // Mặc định nếu không tìm thấy là 7.5m
        
        if (destination) {
            const destLower = destination.toLowerCase();
            // Tìm trong mảng CSV xem có tên đường nào khớp với địa chỉ khách nhập không
            const point = danhSachCaoDo.find(item => destLower.includes(item.ten_duong));
            if (point) {
                cao_do_duong = point.cao_do;
                console.log(`📍 Tìm thấy đường: ${point.ten_duong} - Cao độ: ${cao_do_duong}m`);
            } else {
                console.log(`⚠️ Không tìm thấy đường trong CSV, dùng mặc định 7.5m`);
            }
        }
        // --- KẾT THÚC TÌM CAO ĐỘ ---

        // Lấy thông tin gầm xe của User
        const user = await User.findById(userId);
        const gam_xe = user ? user.thong_tin_xe.khoang_sang_gam_xe_cm : 15;

        // Đảm bảo không bị undefined
        const rain = luong_mua || 0;
        const tide = dinh_trieu || 0;
        const cong = tinh_trang_cong || 0;

        // Gọi script Python (Lưu ý đường dẫn tới file predict.py)
        // Nếu file predict.py nằm trong thư mục scripts, hãy sửa thành `python scripts/predict.py ...`
        const command = `python predict.py ${rain} ${tide} ${cao_do_duong} ${cong}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Lỗi chạy Python:", stderr);
                return res.status(500).json({ error: "Lỗi AI Server" });
            }

            try {
                const aiResult = JSON.parse(stdout);
                
                // Tránh lỗi undefined nếu Python chạy lỗi
                if (!aiResult.success) {
                    return res.json({ muc_ngap_cm: 0, trang_thai: "Lỗi tính toán AI", mau_sac: "YELLOW" });
                }

                const mucNgap = aiResult.muc_ngap_cm;

                let canhBao = "";
                let maMau = "";

                if (mucNgap < 5) {
                    canhBao = "Đường khô ráo, lộ trình an toàn.";
                    maMau = "GREEN";
                } else if (mucNgap <= gam_xe - 5) { 
                    canhBao = `Nước ngập ${mucNgap}cm. Vượt qua được nhưng cần đi chậm.`;
                    maMau = "YELLOW";
                } else {
                    canhBao = `CẢNH BÁO ĐỎ: Ngập ${mucNgap}cm, vượt quá gầm xe (${gam_xe}cm). Nguy cơ thủy kích!`;
                    maMau = "RED";
                }

                res.json({ muc_ngap_cm: mucNgap, trang_thai: canhBao, mau_sac: maMau });

            } catch (parseErr) {
                console.error("Lỗi đọc JSON từ Python:", stdout);
                res.status(500).json({ error: "Dữ liệu AI trả về không đúng định dạng" });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};