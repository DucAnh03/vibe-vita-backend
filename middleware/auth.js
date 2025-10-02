const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Thiếu token, vui lòng đăng nhập" });
    }

    const token = authHeader.split(" ")[1];

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    // Gán user vào request để dùng ở các route sau
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Lỗi xác thực token:", error.message);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Middleware phân quyền theo role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }

    next();
  };
};
