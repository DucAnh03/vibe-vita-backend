// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const { authenticate } = require("../middleware/auth");

// // 📌 API: Lấy thông tin user hiện tại
// router.get("/me", authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }
//     res.json(user);
//   } catch (err) {
//     console.error("❌ Lỗi khi lấy thông tin user:", err);
//     res.status(500).json({ message: "Lỗi server", details: err.message });
//   }
// });

// // 📌 API: Cập nhật thông tin user (username, email, phone)
// router.put("/update", authenticate, async (req, res) => {
//   try {
//     const { username, email, phone } = req.body;

//     // Nếu body rỗng thì trả lỗi
//     if (!username && !email && !phone) {
//       return res
//         .status(400)
//         .json({ message: "Vui lòng nhập thông tin cần cập nhật" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       { username, email, phone },
//       { new: true, runValidators: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }

//     res.json({ message: "✅ Cập nhật thành công", user: updatedUser });
//   } catch (err) {
//     console.error("❌ Lỗi khi cập nhật user:", err);
//     res.status(500).json({ message: "Lỗi server", details: err.message });
//   }
// });

// module.exports = router;
