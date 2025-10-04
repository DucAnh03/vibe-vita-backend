const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bookingRoutes = require("./routes/booking");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const exerciseRoutes = require("./routes/exercise");
const seedRoutes = require("./routes/seed");
const mealRoutes = require("./routes/meal");
const chatRoutes = require("./routes/chat");
const trainerRoutes = require("./routes/trainer");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/trainers", trainerRoutes);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
});
