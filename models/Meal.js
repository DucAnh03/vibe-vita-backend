const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  ten_mon_an: { type: String, required: true, trim: true },
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
  mo_ta: { type: String, trim: true },
  thoi_gian_nau_phut: {
    type: Number,
    required: true,
    min: [1, "Thời gian phải lớn hơn 0 phút"],
    max: [240, "Thời gian không quá 240 phút"],
  },
  anh: { type: String, required: true, trim: true },
  luot_thich: { type: Number, default: 0, min: [0, "Không âm"] },
  luot_luu: { type: Number, default: 0, min: [0, "Không âm"] },
  che_do_an_dac_biet: [
    {
      type: String,
      enum: ["eatclean", "keto", "lowcarb", "chaygym", "none"],
      required: true,
    },
  ],
  gioi_tinh_phu_hop: [
    { type: String, enum: ["nam", "nu", "nam, nu", "nam_nu"], required: true },
  ],
  gia_tri_dinh_duong: [
    {
      type: String, // Ví dụ: "Protein: 25g", "Carb: 40g", "Fat: 10g", "Calories: 350"
      required: true,
    },
  ],
  buoi_an: {
    type: String,
    enum: ["sang", "trua", "toi"],
    required: true,
  },
  // Tham chiếu đến chi tiết món ăn
  detail: { type: mongoose.Schema.Types.ObjectId, ref: "MealDetail" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

mealSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Meal", mealSchema);
