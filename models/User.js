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

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: false },
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },

    // 🎯 Vai trò
    role: {
      type: String,
      enum: ["user", "pt", "admin"], // ✅ giữ nguyên "pt"
      default: "user",
    },

    // 💪 Thông tin dành cho PT
    specialty: { type: String },
    experience: { type: String },
    location: { type: String },
    description: { type: String },
    image: { type: String },
    prices: {
      oneSession: { type: Number, default: 0 },
      threeToSeven: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    // 💎 Premium (dành cho user)
    isPremium: { type: Boolean, default: false },
    premiumExpiredAt: { type: Date },
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Kiểm tra premium còn hạn không
userSchema.methods.isActivePremium = function () {
  if (!this.isPremium) return false;
  if (!this.premiumExpiredAt) return false;
  return new Date() < this.premiumExpiredAt;
};

// ✅ Virtual tính số ngày premium còn lại
userSchema.virtual("premiumDaysLeft").get(function () {
  if (!this.isActivePremium()) return 0;
  const now = new Date();
  const diff = this.premiumExpiredAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
