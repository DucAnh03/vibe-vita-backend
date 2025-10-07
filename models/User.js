const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },

    // 🖼 Ảnh đại diện
    image: { type: String, default: "" },

    // 🎯 Vai trò
    role: {
      type: String,
      enum: ["user", "pt", "admin"],
      default: "user",
    },

    // 💪 Thông tin PT (nếu có)
    specialty: { type: String },
    experience: { type: String },
    location: { type: String },
    description: { type: String },
    prices: {
      oneSession: { type: Number, default: 0 },
      threeToSeven: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },

    // 💎 Premium
    isPremium: { type: Boolean, default: false },
    premiumExpiredAt: { type: Date },
  },
  { timestamps: true }
);

// 🔐 Hash mật khẩu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 💎 Kiểm tra premium còn hạn
userSchema.methods.isActivePremium = function () {
  if (!this.isPremium) return false;
  if (!this.premiumExpiredAt) return false;
  return new Date() < this.premiumExpiredAt;
};

// 📅 Virtual: số ngày premium còn lại
userSchema.virtual("premiumDaysLeft").get(function () {
  if (!this.isActivePremium()) return 0;
  const now = new Date();
  const diff = this.premiumExpiredAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
