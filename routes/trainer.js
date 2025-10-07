const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// ======================================================
// 🟢 CODE CŨ (giữ nguyên)
// ======================================================

// Lấy tất cả PT (trong collection Trainer)
router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Lấy chi tiết 1 PT theo id
router.get("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Không tìm thấy PT" });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Thêm PT mới
router.post("/", async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(201).json(trainer);
  } catch (error) {
    res.status(400).json({ message: "Thêm PT thất bại", error: error.message });
  }
});

// ======================================================
// 🟣 CODE MỚI (khi trainer lưu trong User model)
// ======================================================

// ✅ Lấy thông tin PT hiện tại (dành cho profile)
router.get("/profile/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID từ token
    const trainer = await User.findById(userId).select(
      "username email phone role gender location specialty experience description image prices rating createdAt"
    );

    if (!trainer || trainer.role !== "pt") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    res.json(trainer);
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin PT:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// ✅ Cập nhật thông tin PT
router.put("/profile/update", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const trainer = await User.findById(userId);

    if (!trainer || trainer.role !== "pt") {
      return res.status(403).json({ message: "Không có quyền cập nhật" });
    }

    // ✅ Gán các field cơ bản
    if (req.body.gender) trainer.gender = req.body.gender;
    if (req.body.location) trainer.location = req.body.location;
    if (req.body.specialty) trainer.specialty = req.body.specialty;
    if (req.body.experience) trainer.experience = req.body.experience;
    if (req.body.description) trainer.description = req.body.description;
    if (req.body.image) trainer.image = req.body.image;

    // ✅ Gán giá theo từng loại nếu có
    if (req.body.prices) {
      // Nếu chưa có prices, khởi tạo object rỗng
      if (!trainer.prices) trainer.prices = {};

      trainer.prices.oneSession =
        req.body.prices.oneSession ?? trainer.prices.oneSession;
      trainer.prices.threeToSeven =
        req.body.prices.threeToSeven ?? trainer.prices.threeToSeven;
      trainer.prices.monthly =
        req.body.prices.monthly ?? trainer.prices.monthly;
    }

    const updated = await trainer.save();

    // ✅ Trả về JSON rõ ràng (loại bỏ password)
    res.json({
      message: "Cập nhật thành công",
      updated: {
        _id: updated._id,
        username: updated.username,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        gender: updated.gender,
        location: updated.location,
        specialty: updated.specialty,
        experience: updated.experience,
        description: updated.description,
        image: updated.image,
        prices: updated.prices,
        rating: updated.rating,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật PT:", err);
    res.status(500).json({ message: "Cập nhật thất bại", error: err.message });
  }
});

// ✅ Lấy danh sách tất cả PT trong bảng User (role: 'pt')
router.get("/user/all", async (req, res) => {
  try {
    const trainers = await User.find({ role: "pt" }).select(
      "username email phone role specialty experience prices rating image"
    );
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
