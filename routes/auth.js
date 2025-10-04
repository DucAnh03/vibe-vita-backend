const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, dateOfBirth, role } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username, email hoặc số điện thoại đã tồn tại",
      });
    }

    // Tạo user mới
    const userData = {
      username,
      email,
      password,
      role: role || "user",
    };

    // Chỉ thêm phone và dateOfBirth nếu có
    if (phone) userData.phone = phone;
    if (dateOfBirth) userData.dateOfBirth = dateOfBirth;

    const user = new User(userData);

    await user.save();

    // Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc password không đúng" });
    }

    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc password không đúng" });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Lấy thông tin user hiện tại
router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// Route chỉ cho admin
router.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  res.json({ message: "Đây là route dành cho admin" });
});
// Route cho pt
router.get("/trainers", async (req, res) => {
  try {
    const trainers = await User.find({ role: "pt" }).select("-password");
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});
// Route cho PT và admin
router.get("/pt", authenticate, authorize("pt", "admin"), async (req, res) => {
  res.json({ message: "Đây là route dành cho PT và admin" });
});

// Cập nhật profile (thông tin user + sức khỏe)
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { username, email, phone, dateOfBirth, gender, height, weight } =
      req.body;
    const userId = req.user._id;

    // Cập nhật thông tin user
    const updateUserData = {};
    if (username) updateUserData.username = username;
    if (email) updateUserData.email = email;
    if (phone) updateUserData.phone = phone;
    if (dateOfBirth) updateUserData.dateOfBirth = dateOfBirth;

    // Kiểm tra email/username/phone trùng lặp
    if (email || username || phone) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email, username hoặc số điện thoại đã tồn tại",
        });
      }
    }

    // Cập nhật user
    const updatedUser = await User.findByIdAndUpdate(userId, updateUserData, {
      new: true,
      runValidators: true,
    }).select("-password");

    // Cập nhật thông tin sức khỏe nếu có
    let healthInfo = null;
    if (gender || height || weight) {
      const HealthInfo = require("../models/HealthInfo");

      healthInfo = await HealthInfo.findOne({ userId });

      if (healthInfo) {
        // Cập nhật thông tin sức khỏe hiện có
        if (gender) healthInfo.gender = gender;
        if (height) healthInfo.height = height;
        if (weight) healthInfo.weight = weight;
        await healthInfo.save();
      } else {
        // Tạo mới thông tin sức khỏe
        healthInfo = new HealthInfo({
          userId,
          gender: gender || "male",
          height: height || 170,
          weight: weight || 70,
        });
        await healthInfo.save();
      }
    }

    res.json({
      message: "Cập nhật profile thành công",
      data: {
        user: updatedUser,
        healthInfo: healthInfo
          ? {
              id: healthInfo._id,
              gender: healthInfo.gender,
              height: healthInfo.height,
              weight: healthInfo.weight,
              bmi: healthInfo.bmi,
              bmiCategory: healthInfo.bmiCategory,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});
// Cập nhật profile PT
router.put(
  "/trainer/profile",
  authenticate,
  authorize("pt", "admin"),
  async (req, res) => {
    try {
      const { specialty, experience, price, location, description } = req.body;
      const userId = req.user._id;

      const updateData = {};
      if (specialty) updateData.specialty = specialty;
      if (experience) updateData.experience = experience;
      if (price) updateData.price = price;
      if (location) updateData.location = location;
      if (description) updateData.description = description;

      const updatedTrainer = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({
        message: "Cập nhật profile PT thành công",
        trainer: updatedTrainer,
      });
    } catch (error) {
      console.error("Update trainer profile error:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
);

module.exports = router;
