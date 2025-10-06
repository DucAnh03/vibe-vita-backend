// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//   },
//   phone: {
//     type: String,
//     required: false,
//     unique: false,
//     trim: true,
//     match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
//   },
//   dateOfBirth: {
//     type: Date,
//     required: false,
//   },
//   role: {
//     type: String,
//     enum: ["user", "pt", "admin"],
//     default: "user",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Hash password trước khi lưu
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // So sánh password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: false,
    unique: false,
    trim: true,
    match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "pt", "admin"],
    default: "user",
  },

  // ==========================
  // Các field riêng cho PT
  // ==========================
  specialty: { type: String, default: "" }, // Chuyên môn (Yoga, Gym…)
  experience: { type: String, default: "" }, // Kinh nghiệm (VD: "5 năm kinh nghiệm")
  location: { type: String, default: "" }, // Địa chỉ tập luyện
  gender: { type: String, default: "" }, // Giới tính
  description: { type: String, default: "" }, // Mô tả chi tiết về PT
  image: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  }, // Ảnh đại diện mặc định

  // ✅ Giá theo 3 gói tập
  prices: {
    oneSession: { type: Number, default: 0 }, // Giá 1 buổi
    threeToSeven: { type: Number, default: 0 }, // Giá 3–7 buổi
    monthly: { type: Number, default: 0 }, // Giá theo tháng
  },

  // ✅ Điểm đánh giá trung bình
  rating: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
