const rateLimitWindowMs = 60 * 60 * 1000; // 1 hour
const maxRequestsPerWindow = 6;

// In-memory store: { userId: [{ timestamp }, ...] }
// For production, replace with Redis or a durable store
const userRequestLog = new Map();

module.exports = function perUserRateLimit(req, res, next) {
  try {
    const userId = req.user && req.user._id ? String(req.user._id) : null;
    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu cần đăng nhập" });
    }

    const now = Date.now();
    const windowStart = now - rateLimitWindowMs;

    const existing = userRequestLog.get(userId) || [];
    // Remove requests older than window
    const recent = existing.filter((t) => t >= windowStart);

    if (recent.length >= maxRequestsPerWindow) {
      const retryAfterSec = Math.ceil(
        (recent[0] + rateLimitWindowMs - now) / 1000
      );
      res.set("Retry-After", String(Math.max(retryAfterSec, 1)));
      return res.status(429).json({
        message: "Bạn đã vượt quá giới hạn 6 tin/giờ. Vui lòng thử lại sau.",
      });
    }

    recent.push(now);
    userRequestLog.set(userId, recent);
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Lỗi rate limit", error: err.message });
  }
};
