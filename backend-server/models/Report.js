const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ten_duong: { type: String, required: true },
    muc_ngap_uoc_tinh: { type: Number, required: true }, // cm
    mo_ta: { type: String },
    hinh_anh_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);