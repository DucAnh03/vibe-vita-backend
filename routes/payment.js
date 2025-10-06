// D:\EXE201\vibe-vita-backend\routes\payment.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Payment = require("../models/Payment");
const payos = require("../untils/payos"); // ✅ đã export instance

router.post("/create", authenticate, async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.id;

    // 💰 Bảng giá cố định
    const packagePrices = {
      oneDay: 300000,
      threeToSevenDays: 1800000,
      monthly: 4500000,
    };

    const amount = packagePrices[packageType];
    if (!amount)
      return res.status(400).json({ message: "Gói thanh toán không hợp lệ" });

    // 🕒 Ngày hết hạn
    let expiredAt;
    if (packageType === "oneDay")
      expiredAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    else if (packageType === "threeToSevenDays")
      expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    else if (packageType === "monthly")
      expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 🧾 orderCode phải là số nguyên dương 6 chữ số
    const orderId = Math.floor(100000 + Math.random() * 900000);
    console.log("🚀 Bắt đầu tạo thanh toán với orderCode:", orderId);

    // ✅ Gọi PayOS SDK - Dùng createPaymentLinkUrl() (bản 2.0.3)
    const paymentLink = await payos.createPaymentLinkUrl({
      orderCode: orderId,
      amount,
      description: `Thanh toán gói thuê PT (${packageType})`,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
      items: [
        {
          name: `Gói thuê PT (${packageType})`,
          quantity: 1,
          price: amount,
        },
      ],
      buyer: {
        name: req.user?.username || "Khách hàng",
        email: req.user?.email || "no-reply@vibevita.com",
        phone: req.user?.phone || "0123456789",
      },
    });

    console.log("✅ PayOS trả về:", paymentLink);

    // ✅ Lưu DB (trạng thái pending)
    const newPayment = new Payment({
      userId,
      packageType,
      amount,
      status: "pending",
      transactionId: orderId,
      expiredAt,
    });
    await newPayment.save();

    res.status(200).json({
      message: "✅ Tạo link thanh toán thành công",
      url: paymentLink.checkoutUrl,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo thanh toán:", err);
    res.status(500).json({
      message: "❌ Lỗi tạo thanh toán",
      error: err.message,
    });
  }
});

// ================================
// 🔄 2️⃣ WEBHOOK PAYOS (CẬP NHẬT TRẠNG THÁI)
// ================================
router.post("/webhook", async (req, res) => {
  try {
    const { orderCode, status } = req.body.data || {};

    if (status === "PAID") {
      const payment = await Payment.findOneAndUpdate(
        { transactionId: orderCode },
        { status: "success" },
        { new: true }
      );
      console.log("✅ Thanh toán thành công:", payment);
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (err) {
    console.error("❌ Lỗi webhook:", err.message);
    res.status(500).json({
      message: "Lỗi xử lý webhook",
      error: err.message,
    });
  }
});

// ================================
// 🔍 3️⃣ KIỂM TRA GÓI HỢP LỆ
// ================================
router.get("/status", authenticate, async (req, res) => {
  try {
    const now = new Date();
    const payment = await Payment.findOne({
      userId: req.user.id,
      status: "success",
      expiredAt: { $gte: now },
    }).sort({ createdAt: -1 });

    if (!payment)
      return res
        .status(403)
        .json({ message: "⚠️ Bạn chưa có gói thuê PT hợp lệ." });

    res.json({ message: "✅ Đã có gói thuê hợp lệ", payment });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi kiểm tra thanh toán",
      error: err.message,
    });
  }
});

// ================================
// 🧾 4️⃣ LỊCH SỬ THANH TOÁN
// ================================
router.get("/history", authenticate, async (req, res) => {
  try {
    const history = await Payment.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi lấy lịch sử thanh toán",
      error: err.message,
    });
  }
});

module.exports = router;
