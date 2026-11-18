const express = require("express");
const router = express.Router();
const MealPlan = require("../models/MealPlan");
const { verifyToken } = require("../middleware/authMiddleware"); // Đảm bảo có dấu ngoặc nhọn ở đây

// 1. Lấy thực đơn tuần của người dùng đang đăng nhập
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const plans = await MealPlan.find({ user: userId }).populate(
      "recipe",
      "title image time difficulty",
    );
    res.json(plans);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi tải thực đơn", error: err.message });
  }
});

// 2. Thêm món ăn vào thực đơn tuần
router.post("/", verifyToken, async (req, res) => {
  try {
    const { dayOfWeek, mealType, recipeId } = req.body;
    const userId = req.user.id || req.user._id;

    const newPlan = new MealPlan({
      user: userId,
      dayOfWeek,
      mealType,
      recipe: recipeId,
    });

    await newPlan.save();
    res
      .status(201)
      .json({ message: "Đã thêm món vào thực đơn!", plan: newPlan });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Lỗi khi lưu thực đơn", error: err.message });
  }
});

// 3. Xóa một bữa ăn khỏi thực đơn
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await MealPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa món khỏi thực đơn!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa thực đơn", error: err.message });
  }
});

module.exports = router;
