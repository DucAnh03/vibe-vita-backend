const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const MealDetail = require("../models/MealDetail");
const { authenticate } = require("../middleware/auth");

function expandGenderFilters(inputGenders) {
  const set = new Set(inputGenders || []);
  if (set.has("nam") || set.has("nu")) {
    set.add("nam, nu");
    set.add("nam_nu");
  }
  return Array.from(set);
}

// Gợi ý bữa ăn (POST): trả về đủ sáng, trưa, tối
router.post("/suggest-basic", authenticate, async (req, res) => {
  try {
    const { muc_tieu, gioi_tinh_phu_hop, che_do_an_dac_biet } = req.body;

    if (!muc_tieu || !Array.isArray(muc_tieu) || muc_tieu.length === 0) {
      return res
        .status(400)
        .json({ message: "Mục tiêu là bắt buộc và phải là mảng" });
    }

    if (
      !gioi_tinh_phu_hop ||
      !Array.isArray(gioi_tinh_phu_hop) ||
      gioi_tinh_phu_hop.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Giới tính là bắt buộc và phải là mảng" });
    }

    if (
      !che_do_an_dac_biet ||
      !Array.isArray(che_do_an_dac_biet) ||
      che_do_an_dac_biet.length === 0
    ) {
      return res.status(400).json({
        message: "Chế độ ăn đặc biệt là bắt buộc và phải là mảng",
      });
    }

    const baseFilter = {
      muc_tieu: { $in: muc_tieu },
      gioi_tinh_phu_hop: { $in: expandGenderFilters(gioi_tinh_phu_hop) },
      che_do_an_dac_biet: { $in: che_do_an_dac_biet },
    };

    const [sang, trua, toi] = await Promise.all([
      Meal.find({ ...baseFilter, buoi_an: "sang" })
        .sort({ luot_thich: -1, luot_luu: -1 })
        .limit(10)
        .populate("detail"),
      Meal.find({ ...baseFilter, buoi_an: "trua" })
        .sort({ luot_thich: -1, luot_luu: -1 })
        .limit(10)
        .populate("detail"),
      Meal.find({ ...baseFilter, buoi_an: "toi" })
        .sort({ luot_thich: -1, luot_luu: -1 })
        .limit(10)
        .populate("detail"),
    ]);

    const mapMeal = (m) => ({
      id: m._id,
      ten_mon_an: m.ten_mon_an,
      muc_tieu: m.muc_tieu,
      thoi_gian_nau_phut: m.thoi_gian_nau_phut,
      luot_thich: m.luot_thich,
      luot_luu: m.luot_luu,
      gia_tri_dinh_duong: m.gia_tri_dinh_duong,
      anh: m.anh,
      buoi_an: m.buoi_an,
      detail: m.detail
        ? {
            id: m.detail._id,
            mo_ta: m.detail.mo_ta || "",
            nguyen_lieu: m.detail.nguyen_lieu || [],
            cach_lam: m.detail.cach_lam || [],
            hinh_anh_buoc_lam: m.detail.hinh_anh_buoc_lam || [],
            anh_chi_tiet: m.detail.anh_chi_tiet || [],
            ghi_chu: m.detail.ghi_chu || "",
          }
        : {
            id: null,
            mo_ta: m.mo_ta || "",
            nguyen_lieu: [],
            cach_lam: [],
            hinh_anh_buoc_lam: [],
            anh_chi_tiet: [],
            ghi_chu: "",
          },
    });

    return res.json({
      message: "Gợi ý bữa ăn thành công",
      data: {
        bua_sang: sang.map(mapMeal),
        bua_trua: trua.map(mapMeal),
        bua_toi: toi.map(mapMeal),
      },
    });
  } catch (error) {
    console.error("Suggest meals (POST basic) error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;

// Lấy chi tiết 1 món ăn theo ID (kèm detail)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate("detail");
    if (!meal) {
      return res.status(404).json({ message: "Không tìm thấy món ăn" });
    }

    const result = {
      id: meal._id,
      ten_mon_an: meal.ten_mon_an,
      muc_tieu: meal.muc_tieu,
      thoi_gian_nau_phut: meal.thoi_gian_nau_phut,
      luot_thich: meal.luot_thich,
      luot_luu: meal.luot_luu,
      gia_tri_dinh_duong: meal.gia_tri_dinh_duong,
      anh: meal.anh,
      buoi_an: meal.buoi_an,
      detail: meal.detail
        ? {
            id: meal.detail._id,
            mo_ta: meal.detail.mo_ta || "",
            nguyen_lieu: meal.detail.nguyen_lieu || [],
            cach_lam: meal.detail.cach_lam || [],
            hinh_anh_buoc_lam: meal.detail.hinh_anh_buoc_lam || [],
            anh_chi_tiet: meal.detail.anh_chi_tiet || [],
            ghi_chu: meal.detail.ghi_chu || "",
          }
        : null,
    };

    return res.json({ data: { meal: result } });
  } catch (error) {
    console.error("Get meal by ID error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

// Lấy chi tiết 1 món ăn bằng body (POST)
router.post("/detail", authenticate, async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ message: "Thiếu id món ăn trong body" });
    }

    const meal = await Meal.findById(id).populate("detail");
    if (!meal) {
      return res.status(404).json({ message: "Không tìm thấy món ăn" });
    }

    const result = {
      id: meal._id,
      ten_mon_an: meal.ten_mon_an,
      muc_tieu: meal.muc_tieu,
      thoi_gian_nau_phut: meal.thoi_gian_nau_phut,
      luot_thich: meal.luot_thich,
      luot_luu: meal.luot_luu,
      gia_tri_dinh_duong: meal.gia_tri_dinh_duong,
      anh: meal.anh,
      buoi_an: meal.buoi_an,
      detail: meal.detail
        ? {
            id: meal.detail._id,
            mo_ta: meal.detail.mo_ta || "",
            nguyen_lieu: meal.detail.nguyen_lieu || [],
            cach_lam: meal.detail.cach_lam || [],
            hinh_anh_buoc_lam: meal.detail.hinh_anh_buoc_lam || [],
            anh_chi_tiet: meal.detail.anh_chi_tiet || [],
            ghi_chu: meal.detail.ghi_chu || "",
          }
        : null,
    };

    return res.json({ data: { meal: result } });
  } catch (error) {
    console.error("Get meal detail by body error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});
