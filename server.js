const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bookingRoutes = require('./routes/booking')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const healthRoutes = require('./routes/health')
const exerciseRoutes = require('./routes/exercise')
const seedRoutes = require('./routes/seed')
const mealRoutes = require('./routes/meal')
const chatRoutes = require('./routes/chat')
const trainerRoutes = require('./routes/trainer')
const paymentRoutes = require('./routes/payment')
const app = express()
app.use(
  cors({
    origin: ['https://vibe-vita-fontend.vercel.app/', 'http://localhost:5173'],
    credentials: true
  })
)

// Middleware
// app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send('🚀 Server Trainer API đang hoạt động!')
})
// Routes
app.use('/api/auth', authRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/exercise', exerciseRoutes)
app.use('/api/seed', seedRoutes)
app.use('/api/meal', mealRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/trainers', trainerRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/uploads', express.static('uploads'))
// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
//   .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy trên port ${PORT}`);
// });
// app.get("/healthz", (req, res) => {
//   res.status(200).send("OK");
// });
const PORT = process.env.PORT || 5000

// Start server **ngay lập tức**
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`)
})

// Kết nối MongoDB (chạy song song, không chặn Render)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB Atlas'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err))

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).send('OK')
})
app.use(
  cors({
    origin: ['https://vibe-vita-fontend.vercel.app/', 'http://localhost:5173'],
    credentials: true
  })
)
