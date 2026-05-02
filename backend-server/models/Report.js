const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ten_duong: { type: String, required: true },
    muc_ngap_uoc_tinh: { type: Number, required: true },
    mo_ta: { type: String },
    hinh_anh_url: { type: String, default: "" },
    // THÊM 2 DÒNG NÀY VÀO:
    latitude: { type: Number },
    longitude: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);