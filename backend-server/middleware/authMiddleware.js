const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Không có token, từ chối truy cập!' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Lưu id user vào request để các hàm sau dùng
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ!' });
    }
};