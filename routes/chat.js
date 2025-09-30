const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authenticate } = require("../middleware/auth");
const perUserRateLimit = require("../middleware/rateLimit");

// POST /api/chat
router.post("/", authenticate, perUserRateLimit, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Thiếu 'message'" });
    }
    const trimmed = message.trim();
    // limit 100 characters
    if (trimmed.length === 0 || trimmed.length > 100) {
      return res
        .status(400)
        .json({ message: "Tin nhắn phải từ 1 đến 100 ký tự" });
    }

    // Env key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Thiếu cấu hình GEMINI_API_KEY" });
    }

    // Init model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // System prompt to focus on gym and healthy meals
    const systemPrompt =
      "Bạn là trợ lý AI tư vấn về gym/fitness, lịch tập, kỹ thuật tập, và các bữa ăn healthy, khẩu phần hợp lý. Trả lời ngắn gọn, rõ ràng, an toàn. Không trả lời ngoài chủ đề.";

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: trimmed }] },
      ],
    });
    const text = result.response.text();
    return res.json({ reply: text });
  } catch (error) {
    console.error("Chat error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
