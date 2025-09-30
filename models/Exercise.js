const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  ten_bai_tap: {
    type: String,
    required: true,
    trim: true,
  },
  muc_tieu: [
    {
      type: String,
      enum: [
        "Giữ dáng",
        "Giảm mỡ",
        "Tăng cơ",
        "Tăng sức bền",
        "Giảm stress",
        "Tăng linh hoạt",
      ],
      required: true,
    },
  ],
  mo_ta: {
    type: String,
    required: true,
    trim: true,
  },
  thoi_gian_phut: {
    type: Number,
    required: true,
    min: [1, "Thời gian phải lớn hơn 0 phút"],
    max: [180, "Thời gian không quá 180 phút"],
  },
  anh: {
    type: String,
    required: true,
    trim: true,
  },
  calo_tieu_thu: {
    type: Number,
    required: true,
    min: [0, "Calo tiêu thụ không được âm"],
  },
  luot_thich: {
    type: Number,
    default: 0,
    min: [0, "Lượt thích không được âm"],
  },
  luot_luu: {
    type: Number,
    default: 0,
    min: [0, "Lượt lưu không được âm"],
  },
  hinh_thuc_tap: [
    {
      type: String,
      enum: [
        "tại nhà",
        "phòng gym",
        "ngoài trời",
        "không có dụng cụ",
        "có dụng cụ",
      ],
      required: true,
    },
  ],
  gioi_tinh_phu_hop: [
    {
      type: String,
      enum: ["nam", "nu", "nam, nu"],
      required: true,
    },
  ],
  nhom_BMI_phu_hop: [
    {
      type: String,
      enum: ["Gầy", "Bình thường", "Thừa cân", "Béo phì"],
      required: true,
    },
  ],
  ngay_trong_tuan: [
    {
      type: String,
      enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      required: true,
    },
  ],
  do_kho: {
    type: String,
    enum: ["Dễ", "Trung bình", "Khó"],
    default: "Trung bình",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cập nhật updatedAt khi save
exerciseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Exercise", exerciseSchema);
