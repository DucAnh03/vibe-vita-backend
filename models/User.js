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
  specialty: { type: String }, // Chuyên môn (Yoga, Gym…)
  experience: { type: String }, // Kinh nghiệm (ví dụ: "5 năm")
  price: { type: String }, // Giá buổi tập
  location: { type: String }, // Địa chỉ tập
  description: { type: String }, // Mô tả chi tiết về PT
  rating: { type: Number, default: 0 }, // Điểm đánh giá mặc định 0

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
