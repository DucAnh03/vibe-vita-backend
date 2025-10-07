// require("dotenv").config();

// // ✅ Cách import đúng cho @payos/node v2.0.3
// const { PayOS } = require("@payos/node");

// const payos = new PayOS(
//   process.env.PAYOS_CLIENT_ID,
//   process.env.PAYOS_API_KEY,
//   process.env.PAYOS_CHECKSUM_KEY
// );

// console.log("✅ PayOS SDK đã khởi tạo thành công");

// module.exports = payos;
// routes/payment.js
const express = require("express");
const router = express.Router();
require("dotenv").config();
const { PayOS } = require("@payos/node");

// ✅ Khởi tạo đúng chuẩn v2.x (object)
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// Tạo orderCode mặc định: giây hiện tại (hạn chế trùng)
function genOrderCode() {
  return Math.floor(Date.now() / 1000); // integer (ví dụ: 1728288888)
}

/**
 * POST /api/payment/create-link
 * body: { amount: number, description?: string, orderCode?: number, returnUrl?: string, cancelUrl?: string }
 */
router.post("/create-link", async (req, res) => {
  try {
    const {
      amount,
      description = "Thanh toán gói dịch vụ",
      orderCode,
      returnUrl,
      cancelUrl,
    } = req.body || {};

    // Validate cơ bản
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "amount phải là số VND > 0" });
    }

    const payload = {
      orderCode: Number.isInteger(orderCode) ? orderCode : genOrderCode(),
      amount: Math.floor(amount),
      description,
      returnUrl: returnUrl || process.env.PAYOS_RETURN_URL,
      cancelUrl: cancelUrl || process.env.PAYOS_CANCEL_URL,
    };

    // Gọi SDK tạo link thanh toán
    const link = await payos.paymentRequests.create(payload);

    // Trả full response để FE lấy checkoutUrl / paymentLinkId...
    return res.status(201).json({ success: true, data: link });
  } catch (err) {
    // Bắt lỗi từ SDK (thường có err.message, err.code, err.status)
    return res.status(500).json({
      success: false,
      message: err?.message || "Tạo link thất bại",
      code: err?.code,
      status: err?.status,
    });
  }
});

module.exports = router;
