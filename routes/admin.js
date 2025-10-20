const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

// ================================
// 🧩 ADMIN ROUTES
// ================================

// ✅ 1️⃣ Xem tất cả Personal Trainers
router.get("/trainers", authenticate, authorize("admin"), async (req, res) => {
  try {
    const trainers = await User.find({ role: "pt" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = trainers.map((t) => ({
      id: t._id,
      username: t.username,
      email: t.email,
      phone: t.phone,
      image: t.image
        ? `${process.env.SERVER_URL || "http://localhost:5000"}${t.image}`
        : null,
      specialty: t.specialty,
      experience: t.experience,
      location: t.location,
      description: t.description,
      prices: t.prices,
      isPremium: t.isPremium,
      premiumExpiredAt: t.premiumExpiredAt,
      premiumDaysLeft: t.premiumDaysLeft,
      createdAt: t.createdAt,
    }));

    res.json({
      message: "✅ Lấy danh sách tất cả trainer thành công",
      count: formatted.length,
      trainers: formatted,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách trainer:", error);
    res.status(500).json({
      message: "❌ Lỗi khi lấy danh sách trainer",
      error: error.message,
    });
  }
});

// ✅ 2️⃣ Xem tất cả Users (kể cả admin)
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["user", "admin"] },
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "✅ Lấy danh sách user thành công",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách user:", error);
    res.status(500).json({
      message: "❌ Lỗi khi lấy danh sách user",
      error: error.message,
    });
  }
});

// ✅ 3️⃣ Xem chi tiết 1 Trainer
router.get(
  "/trainers/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const trainer = await User.findById(req.params.id).select("-password");
      if (!trainer || trainer.role !== "pt") {
        return res.status(404).json({ message: "Không tìm thấy trainer" });
      }

      res.json({
        message: "✅ Lấy chi tiết trainer thành công",
        trainer,
      });
    } catch (error) {
      console.error("❌ Lỗi lấy chi tiết trainer:", error);
      res.status(500).json({
        message: "❌ Lỗi khi lấy chi tiết trainer",
        error: error.message,
      });
    }
  }
);

// ✅ 4️⃣ Xem chi tiết 1 User (đầy đủ thuộc tính trừ ảnh và mật khẩu)
router.get("/users/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -image") // ❌ Ẩn password và ảnh
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const HealthInfo = require("../models/HealthInfo");
    const health = await HealthInfo.findOne({ userId: user._id });

    res.json({
      message: "✅ Lấy chi tiết user đầy đủ thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        specialty: user.specialty,
        experience: user.experience,
        location: user.location,
        description: user.description,
        prices: user.prices,
        isPremium: user.isPremium,
        premiumExpiredAt: user.premiumExpiredAt,
        premiumDaysLeft: user.premiumDaysLeft,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      healthInfo: health
        ? {
            gender: health.gender,
            height: health.height,
            weight: health.weight,
            bmi: health.bmi,
            bmiCategory: health.bmiCategory,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy chi tiết user:", error);
    res.status(500).json({
      message: "❌ Lỗi khi lấy chi tiết user",
      error: error.message,
    });
  }
});

module.exports = router;
