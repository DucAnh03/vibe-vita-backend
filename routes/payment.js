const express = require("express");
const router = express.Router();
require("dotenv").config();

const { authenticate } = require("../middleware/auth");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { PayOS } = require("@payos/node");

// ---------------------------
// 🔧 Khởi tạo PayOS SDK
// ---------------------------
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// ---------------------------
// ⚙️ Hàm tính ngày hết hạn gói
// ---------------------------
const calculateExpiredDate = (packageType) => {
  const now = new Date();
  switch (packageType) {
    case "oneDay":
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    case "threeToSevenDays":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  }
};

// ---------------------------
// 🧪 Test router
// ---------------------------
router.get("/ping", (req, res) => {
  res.json({ ok: true, scope: "payment-router", ts: Date.now() });
});

// ---------------------------
// 💳 API tạo link thanh toán PayOS
// ---------------------------
router.post("/create", authenticate, async (req, res) => {
  try {
    const { amount, packageType, orderCode } = req.body;

    if (!["oneDay", "threeToSevenDays", "monthly"].includes(packageType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid package type" });
    }

    const code =
      Number.isInteger(orderCode) && orderCode > 0
        ? orderCode
        : Math.floor(Date.now() / 1000);

    const amt = Number(amount);
    if (!amt || amt <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount phải lớn hơn 0" });

    const packageNames = {
      oneDay: "Gói 1 Ngày",
      threeToSevenDays: "Gói 7 Ngày",
      monthly: "Gói 1 Tháng",
    };
    const description = `VibeVita - ${packageNames[packageType]}`;

    const payload = {
      orderCode: code,
      amount: amt,
      description,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      items: [{ name: packageNames[packageType], quantity: 1, price: amt }],
      buyerName: req.user?.name || "Khách hàng",
      buyerEmail: req.user?.email,
      buyerPhone: req.user?.phone,
    };

    console.log("📤 Creating payment with payload:", payload);

    const response = await payos.paymentRequests.create(payload);
    console.log("✅ PayOS response:", response);

    const expiredAt = calculateExpiredDate(packageType);

    await Payment.create({
      userId: req.user._id,
      packageType,
      orderCode: code,
      amount: amt,
      description,
      status: "pending",
      paymentLinkId: response.paymentLinkId,
      checkoutUrl: response.checkoutUrl,
      expiredAt,
    });

    res.status(201).json({
      success: true,
      message: "Payment link created successfully",
      data: {
        orderCode: code,
        checkoutUrl: response.checkoutUrl,
        amount: amt,
        packageType,
        expiredAt,
      },
    });
  } catch (err) {
    console.error("❌ Create payment error:", err?.response?.data || err);
    res.status(500).json({
      success: false,
      message:
        err?.response?.data?.message || err?.message || "Create payment failed",
    });
  }
});

// ---------------------------
// 🪝 Webhook PayOS (xử lý PAID ngay)
// ---------------------------
router.post("/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      console.log("📩 Webhook test received");
      return res.status(200).json({ message: "Webhook test OK" });
    }

    let data;
    try {
      data = JSON.parse(req.body.toString("utf8"));
    } catch (e) {
      console.warn("⚠️ Webhook body parse fail");
      return res.status(200).json({ message: "Webhook OK (no JSON)" });
    }

    console.log("📥 Webhook received:", data);
    const { orderCode, code, status } = data;
    if (!orderCode)
      return res
        .status(400)
        .json({ message: "Invalid webhook (no orderCode)" });

    const payment = await Payment.findOne({ orderCode: Number(orderCode) });
    if (!payment) {
      console.warn("⚠️ Payment not found:", orderCode);
      return res.status(404).json({ message: "Payment not found" });
    }

    // ✅ Khi thanh toán thành công
    if (code === "00" || status === "PAID") {
      payment.status = "completed";
      payment.paidAt = new Date();
      await payment.save();

      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.premiumExpiredAt = payment.expiredAt;
        await user.save();
        console.log(`✅ User ${user._id} đã được nâng cấp Premium`);
      }
    } else {
      payment.status = "failed";
      await payment.save();
    }

    console.log("✅ Webhook processed successfully:", orderCode);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(200).json({ message: "Webhook handled (no crash)" });
  }
});

// ---------------------------
// 🔍 API kiểm tra trạng thái thanh toán
// ---------------------------
router.get("/status/:orderCode", authenticate, async (req, res) => {
  try {
    const { orderCode } = req.params;
    const payment = await Payment.findOne({
      orderCode: Number(orderCode),
      userId: req.user._id,
    });

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    const info = await payos.paymentRequests.get(orderCode);

    // ✅ Nếu PayOS báo PAID nhưng DB chưa update → đồng bộ ngay
    if (info.status === "PAID" && payment.status === "pending") {
      payment.status = "completed";
      payment.paidAt = new Date();
      await payment.save();

      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.premiumExpiredAt = payment.expiredAt;
        await user.save();
        console.log(`✅ Đồng bộ user ${user._id} Premium`);
      }
    }

    res.json({ success: true, data: { payment, payosStatus: info.status } });
  } catch (err) {
    console.error("❌ Get status error:", err);
    res.status(500).json({ success: false, message: "Failed to get status" });
  }
});

// ---------------------------
// 🧾 Lịch sử thanh toán
// ---------------------------
router.get("/history", authenticate, async (req, res) => {
  try {
    const list = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error("❌ Get history error:", err);
    res.status(500).json({ success: false, message: "Failed to get history" });
  }
});

// ---------------------------
// ❌ Hủy thanh toán
// ---------------------------
router.post("/cancel/:orderCode", authenticate, async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { cancellationReason } = req.body;

    await payos.paymentRequests.cancel(orderCode, {
      cancellationReason: cancellationReason || "User cancelled",
    });

    const payment = await Payment.findOne({
      orderCode: Number(orderCode),
      userId: req.user._id,
    });
    if (payment) {
      payment.status = "cancelled";
      await payment.save();
    }

    res.json({ success: true, message: "Payment cancelled successfully" });
  } catch (err) {
    console.error("❌ Cancel payment error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel payment" });
  }
  // ==============================================
  // ✅ CHECK PREMIUM STATUS (cho từng user)
  // ==============================================
  const User = require("../models/User");

  router.get("/check-status", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select(
        "username email isPremium premiumExpiredAt"
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User không tồn tại" });
      }

      // ✅ Tính số ngày còn lại của Premium
      let daysLeft = 0;
      if (user.isPremium && user.premiumExpiredAt) {
        const diff = new Date(user.premiumExpiredAt) - new Date();
        daysLeft = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
      }

      // ✅ Lấy danh sách PT đã thanh toán (lưu trong localStorage frontend)
      // Ở backend không lưu, nên mình để client tự lưu; backend chỉ cung cấp trạng thái user.

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isPremium: user.isPremium,
          premiumExpiredAt: user.premiumExpiredAt,
          daysLeft,
        },
      });
    } catch (err) {
      console.error("❌ Lỗi check premium:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: err.message });
    }
  });
});
// ✅ Check trạng thái Premium

router.get("/check-status", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "username email isPremium premiumExpiredAt"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User không tồn tại" });
    }

    let daysLeft = 0;
    if (user.isPremium && user.premiumExpiredAt) {
      const diff = new Date(user.premiumExpiredAt) - new Date();
      daysLeft = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiredAt: user.premiumExpiredAt,
        daysLeft,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi check premium:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
