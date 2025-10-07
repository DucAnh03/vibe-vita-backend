const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageType: {
      type: String,
      enum: ["oneDay", "threeToSevenDays", "monthly"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    orderCode: {
      type: Number,
      required: true,
      unique: true, // mỗi giao dịch chỉ có 1 orderCode duy nhất
    },
    description: {
      type: String,
      default: "VibeVita Premium Package",
    },
    paymentLinkId: String,
    checkoutUrl: String,

    // 🔧 Sửa điểm gây lỗi
    // Không cần unique vì transactionId có thể null hoặc trùng trong pending
    transactionId: {
      type: String,
      sparse: true, // Cho phép null, không bắt buộc unique
      index: true, // chỉ thêm index để tra cứu nhanh
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paidAt: Date,
    expiredAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index hỗ trợ tìm kiếm nhanh
paymentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
