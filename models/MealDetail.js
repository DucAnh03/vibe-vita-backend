const mongoose = require("mongoose");

const mealDetailSchema = new mongoose.Schema({
  mo_ta: { type: String, trim: true },
  nguyen_lieu: [{ type: String }],
  cach_lam: [{ type: String }],
  hinh_anh_buoc_lam: [{ type: String }],
  ghi_chu: { type: String, trim: true },
  anh_chi_tiet: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

mealDetailSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("MealDetail", mealDetailSchema);
