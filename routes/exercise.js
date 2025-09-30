const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");
const { authenticate } = require("../middleware/auth");

// Helper: expand gender filters to include mixed labels
function expandGenderFilters(inputGenders) {
  const set = new Set(inputGenders || []);
  if (set.has("nam") || set.has("nu")) {
    set.add("nam, nu");
    set.add("nam_nu");
  }
  return Array.from(set);
}

// Gợi ý bài tập dựa trên tiêu chí
router.post("/suggest", authenticate, async (req, res) => {
  try {
    const { muc_tieu, ngay_trong_tuan, gioi_tinh_phu_hop } = req.body;

    // Validation
    if (!muc_tieu || !Array.isArray(muc_tieu) || muc_tieu.length === 0) {
      return res.status(400).json({
        message: "Mục tiêu tập luyện là bắt buộc và phải là mảng",
      });
    }

    if (
      !ngay_trong_tuan ||
      !Array.isArray(ngay_trong_tuan) ||
      ngay_trong_tuan.length === 0
    ) {
      return res.status(400).json({
        message: "Ngày trong tuần là bắt buộc và phải là mảng",
      });
    }

    if (
      !gioi_tinh_phu_hop ||
      !Array.isArray(gioi_tinh_phu_hop) ||
      gioi_tinh_phu_hop.length === 0
    ) {
      return res.status(400).json({
        message: "Giới tính phù hợp là bắt buộc và phải là mảng",
      });
    }

    // Xây dựng query
    const query = {
      muc_tieu: { $in: muc_tieu },
      ngay_trong_tuan: { $in: ngay_trong_tuan },
      gioi_tinh_phu_hop: { $in: expandGenderFilters(gioi_tinh_phu_hop) },
    };

    // Tìm bài tập phù hợp
    const exercises = await Exercise.find(query)
      .sort({ luot_thich: -1, calo_tieu_thu: -1 }) // Sắp xếp theo lượt thích và calo
      .limit(20); // Giới hạn 20 bài tập

    if (exercises.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bài tập phù hợp với tiêu chí của bạn",
      });
    }

    res.json({
      message: "Gợi ý bài tập thành công",
      data: {
        exercises: exercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
        })),
        total: exercises.length,
      },
    });
  } catch (error) {
    console.error("Suggest exercises error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Gợi ý bài tập (GET) theo mục tiêu và giới tính - frontend tự lọc ngày trong tuần
router.get("/suggest", authenticate, async (req, res) => {
  try {
    const { muc_tieu, gioi_tinh_phu_hop } = req.query;

    // Chuyển query param thành mảng (hỗ trợ dạng ?a=x,y hoặc ?a=x&a=y)
    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      return String(val)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const mucTieuArr = toArray(muc_tieu);
    const gioiTinhArr = toArray(gioi_tinh_phu_hop);

    // Validation
    if (mucTieuArr.length === 0) {
      return res.status(400).json({
        message: "Mục tiêu tập luyện là bắt buộc và phải là mảng/chuỗi",
      });
    }

    if (gioiTinhArr.length === 0) {
      return res.status(400).json({
        message: "Giới tính phù hợp là bắt buộc và phải là mảng/chuỗi",
      });
    }

    // Xây dựng query chỉ theo mục tiêu và giới tính
    const query = {
      muc_tieu: { $in: mucTieuArr },
      gioi_tinh_phu_hop: { $in: expandGenderFilters(gioiTinhArr) },
    };

    const exercises = await Exercise.find(query)
      .sort({ luot_thich: -1, calo_tieu_thu: -1 })
      .limit(50);

    // Trả về danh sách (không lọc theo ngày). Frontend có thể lọc theo "ngay_trong_tuan"
    return res.json({
      message: "Gợi ý bài tập thành công",
      data: {
        exercises: exercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
        })),
        total: exercises.length,
      },
    });
  } catch (error) {
    console.error("Suggest exercises (GET) error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

// Gợi ý bài tập (POST, body chỉ gồm mục tiêu và giới tính) - frontend tự lọc ngày
router.post("/suggest-basic", authenticate, async (req, res) => {
  try {
    const { muc_tieu, gioi_tinh_phu_hop } = req.body;

    if (!muc_tieu || !Array.isArray(muc_tieu) || muc_tieu.length === 0) {
      return res.status(400).json({
        message: "Mục tiêu tập luyện là bắt buộc và phải là mảng",
      });
    }

    if (
      !gioi_tinh_phu_hop ||
      !Array.isArray(gioi_tinh_phu_hop) ||
      gioi_tinh_phu_hop.length === 0
    ) {
      return res.status(400).json({
        message: "Giới tính phù hợp là bắt buộc và phải là mảng",
      });
    }

    const query = {
      muc_tieu: { $in: muc_tieu },
      gioi_tinh_phu_hop: { $in: expandGenderFilters(gioi_tinh_phu_hop) },
    };

    const exercises = await Exercise.find(query)
      .sort({ luot_thich: -1, calo_tieu_thu: -1 })
      .limit(50);

    return res.json({
      message: "Gợi ý bài tập (cơ bản) thành công",
      data: {
        exercises: exercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
        })),
        total: exercises.length,
      },
    });
  } catch (error) {
    console.error("Suggest exercises (POST basic) error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

// Gợi ý bài tập dựa trên BMI của user
router.post("/suggest-by-bmi", authenticate, async (req, res) => {
  try {
    const { muc_tieu, ngay_trong_tuan } = req.body;
    const userId = req.user._id;

    // Lấy thông tin sức khỏe của user
    const HealthInfo = require("../models/HealthInfo");
    const healthInfo = await HealthInfo.findOne({ userId });

    if (!healthInfo) {
      return res.status(404).json({
        message:
          "Chưa có thông tin sức khỏe. Vui lòng cập nhật thông tin sức khỏe trước.",
      });
    }

    // Xác định giới tính và BMI category
    const gioi_tinh_phu_hop = [healthInfo.gender];
    const bmi_category = healthInfo.bmiCategory;

    // Validation
    if (!muc_tieu || !Array.isArray(muc_tieu) || muc_tieu.length === 0) {
      return res.status(400).json({
        message: "Mục tiêu tập luyện là bắt buộc và phải là mảng",
      });
    }

    if (
      !ngay_trong_tuan ||
      !Array.isArray(ngay_trong_tuan) ||
      ngay_trong_tuan.length === 0
    ) {
      return res.status(400).json({
        message: "Ngày trong tuần là bắt buộc và phải là mảng",
      });
    }

    // Xây dựng query
    const query = {
      muc_tieu: { $in: muc_tieu },
      ngay_trong_tuan: { $in: ngay_trong_tuan },
      gioi_tinh_phu_hop: { $in: gioi_tinh_phu_hop },
      nhom_BMI_phu_hop: { $in: [bmi_category] },
    };

    // Tìm bài tập phù hợp
    const exercises = await Exercise.find(query)
      .sort({ luot_thich: -1, calo_tieu_thu: -1 })
      .limit(20);

    if (exercises.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy bài tập phù hợp với BMI và tiêu chí của bạn",
      });
    }

    res.json({
      message: "Gợi ý bài tập dựa trên BMI thành công",
      data: {
        user_bmi: healthInfo.bmi,
        user_bmi_category: healthInfo.bmiCategory,
        exercises: exercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
        })),
        total: exercises.length,
      },
    });
  } catch (error) {
    console.error("Suggest exercises by BMI error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy tất cả bài tập (có phân trang)
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const exercises = await Exercise.find()
      .sort({ luot_thich: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Exercise.countDocuments();

    res.json({
      data: {
        exercises: exercises.map((exercise) => ({
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all exercises error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy chi tiết bài tập theo ID
router.get("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        message: "Không tìm thấy bài tập",
      });
    }

    res.json({
      data: {
        exercise: {
          id: exercise._id,
          ten_bai_tap: exercise.ten_bai_tap,
          muc_tieu: exercise.muc_tieu,
          mo_ta: exercise.mo_ta,
          thoi_gian_phut: exercise.thoi_gian_phut,
          anh: exercise.anh,
          calo_tieu_thu: exercise.calo_tieu_thu,
          luot_thich: exercise.luot_thich,
          luot_luu: exercise.luot_luu,
          hinh_thuc_tap: exercise.hinh_thuc_tap,
          gioi_tinh_phu_hop: exercise.gioi_tinh_phu_hop,
          nhom_BMI_phu_hop: exercise.nhom_BMI_phu_hop,
          ngay_trong_tuan: exercise.ngay_trong_tuan,
          do_kho: exercise.do_kho,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get exercise by ID error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Thích bài tập
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { $inc: { luot_thich: 1 } },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({
        message: "Không tìm thấy bài tập",
      });
    }

    res.json({
      message: "Đã thích bài tập",
      data: {
        luot_thich: exercise.luot_thich,
      },
    });
  } catch (error) {
    console.error("Like exercise error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lưu bài tập
router.post("/:id/save", authenticate, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { $inc: { luot_luu: 1 } },
      { new: true }
    );

    if (!exercise) {
      return res.status(404).json({
        message: "Không tìm thấy bài tập",
      });
    }

    res.json({
      message: "Đã lưu bài tập",
      data: {
        luot_luu: exercise.luot_luu,
      },
    });
  } catch (error) {
    console.error("Save exercise error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
