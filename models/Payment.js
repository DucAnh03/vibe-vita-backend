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
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    expiredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
