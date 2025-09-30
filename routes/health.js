const express = require("express");
const router = express.Router();
const HealthInfo = require("../models/HealthInfo");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// Tạo thông tin sức khỏe
router.post("/create", authenticate, async (req, res) => {
  try {
    const { gender, height, weight } = req.body;
    const userId = req.user._id;

    // Kiểm tra thông tin sức khỏe đã tồn tại
    const existingHealthInfo = await HealthInfo.findOne({ userId });
    if (existingHealthInfo) {
      return res.status(400).json({
        message: "Thông tin sức khỏe đã tồn tại. Vui lòng sử dụng API update.",
      });
    }

    // Validation
    if (!gender || !height || !weight) {
      return res.status(400).json({
        message: "Giới tính, chiều cao và cân nặng là bắt buộc",
      });
    }

    // Tạo thông tin sức khỏe mới
    const healthInfo = new HealthInfo({
      userId,
      gender,
      height,
      weight,
    });

    await healthInfo.save();

    res.status(201).json({
      message: "Tạo thông tin sức khỏe thành công",
      data: {
        healthInfo: {
          id: healthInfo._id,
          gender: healthInfo.gender,
          height: healthInfo.height,
          weight: healthInfo.weight,
          bmi: healthInfo.bmi,
          bmiCategory: healthInfo.bmiCategory,
          createdAt: healthInfo.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create health info error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Cập nhật thông tin sức khỏe
router.put("/update", authenticate, async (req, res) => {
  try {
    const { gender, height, weight } = req.body;
    const userId = req.user._id;

    // Tìm thông tin sức khỏe hiện tại
    let healthInfo = await HealthInfo.findOne({ userId });

    if (!healthInfo) {
      // Nếu chưa có, tạo mới
      healthInfo = new HealthInfo({
        userId,
        gender,
        height,
        weight,
      });
    } else {
      // Cập nhật thông tin
      if (gender) healthInfo.gender = gender;
      if (height) healthInfo.height = height;
      if (weight) healthInfo.weight = weight;
    }

    await healthInfo.save();

    res.json({
      message: "Cập nhật thông tin sức khỏe thành công",
      data: {
        healthInfo: {
          id: healthInfo._id,
          gender: healthInfo.gender,
          height: healthInfo.height,
          weight: healthInfo.weight,
          bmi: healthInfo.bmi,
          bmiCategory: healthInfo.bmiCategory,
          updatedAt: healthInfo.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update health info error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy thông tin sức khỏe
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const healthInfo = await HealthInfo.findOne({ userId });

    if (!healthInfo) {
      return res.status(404).json({
        message: "Chưa có thông tin sức khỏe",
      });
    }

    res.json({
      data: {
        healthInfo: {
          id: healthInfo._id,
          gender: healthInfo.gender,
          height: healthInfo.height,
          weight: healthInfo.weight,
          bmi: healthInfo.bmi,
          bmiCategory: healthInfo.bmiCategory,
          createdAt: healthInfo.createdAt,
          updatedAt: healthInfo.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get health info error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Xóa thông tin sức khỏe
router.delete("/delete", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const healthInfo = await HealthInfo.findOneAndDelete({ userId });

    if (!healthInfo) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin sức khỏe",
      });
    }

    res.json({
      message: "Xóa thông tin sức khỏe thành công",
    });
  } catch (error) {
    console.error("Delete health info error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
