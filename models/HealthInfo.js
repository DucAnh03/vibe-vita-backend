const mongoose = require("mongoose");

const healthInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Nam", "Nữ", "Khác"],
  },
  height: {
    type: Number,
    required: true,
    min: [50, "Chiều cao phải lớn hơn 50cm"],
    max: [300, "Chiều cao phải nhỏ hơn 300cm"],
  },
  weight: {
    type: Number,
    required: true,
    min: [10, "Cân nặng phải lớn hơn 10kg"],
    max: [500, "Cân nặng phải nhỏ hơn 500kg"],
  },
  bmi: {
    type: Number,
    default: 0, // ✅ có giá trị mặc định
  },
  bmiCategory: {
    type: String,
    enum: ["Thiếu cân", "Bình thường", "Thừa cân", "Béo phì"],
    default: "Bình thường", // ✅ mặc định để không bị null
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

// Tính BMI trước khi lưu
healthInfoSchema.pre("save", function (next) {
  if (this.height && this.weight) {
    this.bmi = parseFloat(
      (this.weight / Math.pow(this.height / 100, 2)).toFixed(1)
    );

    if (this.bmi < 18.5) {
      this.bmiCategory = "Thiếu cân";
    } else if (this.bmi >= 18.5 && this.bmi < 25) {
      this.bmiCategory = "Bình thường";
    } else if (this.bmi >= 25 && this.bmi < 30) {
      this.bmiCategory = "Thừa cân";
    } else {
      this.bmiCategory = "Béo phì";
    }
  }
  this.updatedAt = new Date();
  next();
});

// Cập nhật updatedAt khi save
healthInfoSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("HealthInfo", healthInfoSchema);
