const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    ho_ten: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    thong_tin_xe: {
        loai_xe: { type: String, enum: ['Xe tay ga', 'Xe số', 'Xe điện', 'Ô tô'], default: 'Xe tay ga' },
        khoang_sang_gam_xe_cm: { type: Number, default: 15 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);