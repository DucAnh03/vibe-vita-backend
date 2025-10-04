const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");

// Lấy tất cả PT
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

module.exports = router;
