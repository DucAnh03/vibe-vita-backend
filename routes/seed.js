const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

// Thêm dữ liệu mẫu bài tập
router.post("/exercises", async (req, res) => {
  try {
    const sampleExercises = [
      {
        ten_bai_tap: "Crunch bụng",
        muc_tieu: ["Giữ dáng", "Giảm mỡ"],
        mo_ta: "Nằm ngửa, co gối, nâng vai lên khỏi sàn siết cơ bụng.",
        thoi_gian_phut: 6,
        anh: "https://example.com/images/crunch.jpg",
        calo_tieu_thu: 35,
        luot_thich: 880,
        luot_luu: 610,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 2"],
        do_kho: "Dễ",
      },
      {
        ten_bai_tap: "Push-up",
        muc_tieu: ["Tăng cơ", "Giữ dáng"],
        mo_ta: "Nằm sấp, chống tay xuống sàn, đẩy cơ thể lên xuống.",
        thoi_gian_phut: 10,
        anh: "https://example.com/images/pushup.jpg",
        calo_tieu_thu: 50,
        luot_thich: 1200,
        luot_luu: 800,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 2", "Thứ 4", "Thứ 6"],
        do_kho: "Trung bình",
      },
      {
        ten_bai_tap: "Squat",
        muc_tieu: ["Tăng cơ", "Giữ dáng", "Giảm mỡ"],
        mo_ta: "Đứng thẳng, hạ người xuống như ngồi xổm rồi đứng lên.",
        thoi_gian_phut: 8,
        anh: "https://example.com/images/squat.jpg",
        calo_tieu_thu: 45,
        luot_thich: 950,
        luot_luu: 720,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân", "Béo phì"],
        ngay_trong_tuan: ["Thứ 3", "Thứ 5", "Thứ 7"],
        do_kho: "Dễ",
      },
      {
        ten_bai_tap: "Plank",
        muc_tieu: ["Tăng cơ", "Giữ dáng"],
        mo_ta: "Nằm sấp, chống khuỷu tay, giữ cơ thể thẳng như tấm ván.",
        thoi_gian_phut: 5,
        anh: "https://example.com/images/plank.jpg",
        calo_tieu_thu: 25,
        luot_thich: 1100,
        luot_luu: 900,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 2", "Thứ 4", "Thứ 6"],
        do_kho: "Trung bình",
      },
      {
        ten_bai_tap: "Burpee",
        muc_tieu: ["Tăng sức bền", "Giảm mỡ", "Tăng cơ"],
        mo_ta:
          "Squat xuống, chống tay, nhảy chân ra sau, push-up, nhảy chân về, nhảy lên.",
        thoi_gian_phut: 15,
        anh: "https://example.com/images/burpee.jpg",
        calo_tieu_thu: 80,
        luot_thich: 750,
        luot_luu: 500,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 3", "Thứ 5"],
        do_kho: "Khó",
      },
      {
        ten_bai_tap: "Lunge",
        muc_tieu: ["Tăng cơ", "Giữ dáng"],
        mo_ta:
          "Bước một chân về phía trước, hạ gối xuống, đẩy lên và đổi chân.",
        thoi_gian_phut: 12,
        anh: "https://example.com/images/lunge.jpg",
        calo_tieu_thu: 40,
        luot_thich: 680,
        luot_luu: 450,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 4", "Thứ 6"],
        do_kho: "Trung bình",
      },
      {
        ten_bai_tap: "Mountain Climber",
        muc_tieu: ["Tăng sức bền", "Giảm mỡ"],
        mo_ta:
          "Bắt đầu ở tư thế plank, chạy tại chỗ bằng cách đưa gối lên ngực.",
        thoi_gian_phut: 10,
        anh: "https://example.com/images/mountain-climber.jpg",
        calo_tieu_thu: 60,
        luot_thich: 820,
        luot_luu: 580,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 2", "Thứ 5"],
        do_kho: "Trung bình",
      },
      {
        ten_bai_tap: "Jumping Jacks",
        muc_tieu: ["Tăng sức bền", "Giảm mỡ", "Giảm stress"],
        mo_ta: "Nhảy dang chân và tay ra, sau đó nhảy về vị trí ban đầu.",
        thoi_gian_phut: 8,
        anh: "https://example.com/images/jumping-jacks.jpg",
        calo_tieu_thu: 35,
        luot_thich: 920,
        luot_luu: 650,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 3", "Thứ 7"],
        do_kho: "Dễ",
      },
      {
        ten_bai_tap: "Deadlift",
        muc_tieu: ["Tăng cơ", "Giữ dáng"],
        mo_ta:
          "Đứng thẳng, cầm tạ, hạ xuống bằng cách gập hông và gối, sau đó đứng lên.",
        thoi_gian_phut: 20,
        anh: "https://example.com/images/deadlift.jpg",
        calo_tieu_thu: 120,
        luot_thich: 600,
        luot_luu: 400,
        hinh_thuc_tap: ["phòng gym", "có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Bình thường", "Thừa cân"],
        ngay_trong_tuan: ["Thứ 2", "Thứ 4", "Thứ 6"],
        do_kho: "Khó",
      },
      {
        ten_bai_tap: "Yoga Flow",
        muc_tieu: ["Tăng linh hoạt", "Giảm stress", "Giữ dáng"],
        mo_ta: "Chuỗi các động tác yoga nhẹ nhàng, kết hợp hít thở.",
        thoi_gian_phut: 30,
        anh: "https://example.com/images/yoga-flow.jpg",
        calo_tieu_thu: 100,
        luot_thich: 1500,
        luot_luu: 1200,
        hinh_thuc_tap: ["tại nhà", "không có dụng cụ"],
        gioi_tinh_phu_hop: ["nam", "nu"],
        nhom_BMI_phu_hop: ["Gầy", "Bình thường", "Thừa cân", "Béo phì"],
        ngay_trong_tuan: ["Chủ nhật"],
        do_kho: "Dễ",
      },
    ];

    // Xóa dữ liệu cũ (nếu có)
    await Exercise.deleteMany({});

    // Thêm dữ liệu mới
    const createdExercises = await Exercise.insertMany(sampleExercises);

    res.json({
      message: "Đã thêm dữ liệu mẫu bài tập thành công",
      data: {
        total: createdExercises.length,
        exercises: createdExercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
        })),
      },
    });
  } catch (error) {
    console.error("Seed exercises error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
