const express = require("express");
const Booking = require("../models/Booking");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// 📌 Tạo booking mới (userId lấy từ token)
router.post("/", authenticate, async (req, res) => {
  try {
    const { trainerId, day, time, note } = req.body;

    if (!trainerId || !day || !time) {
      return res.status(400).json({ message: "Thiếu thông tin đặt lịch" });
    }

    const booking = new Booking({
      userId: req.user._id,
      trainerId,
      day,
      time,
      note,
      status: "pending",
    });

    await booking.save();

    // Populate trainer (User role=pt)
    const populatedBooking = await Booking.findById(booking._id)
      .populate("trainerId", "username email specialty experience price")
      .populate("userId", "username email");

    res.status(201).json({
      message: "✅ Đặt lịch thành công",
      booking: populatedBooking,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo booking:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 📌 Lấy tất cả booking theo userId
router.get("/user", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("trainerId", "username email specialty experience price")
      .populate("userId", "username email");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Lấy tất cả booking theo trainerId (PT login)
router.get("/trainer", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ trainerId: req.user._id }).populate(
      "userId",
      "username email phone"
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Admin lấy tất cả booking
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const bookings = await Booking.find()
      .populate("userId", "username email phone")
      .populate("trainerId", "username email specialty price");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
