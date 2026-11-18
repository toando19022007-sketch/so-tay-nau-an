const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Recipe = require("../models/Recipe");
const { verifyToken } = require("../middleware/authMiddleware");

// 1. Lấy danh sách đánh giá của một món ăn
router.get("/:recipeId", async (req, res) => {
  try {
    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate("user", "username name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi tải đánh giá", error: err.message });
  }
});

// 2. Thêm đánh giá mới (Chặn đánh giá lần 2 & Tự động cập nhật điểm trung bình vào Recipe)
router.post("/:recipeId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id || req.user._id;
    const recipeId = req.params.recipeId;

    // Kiểm tra xem người này đã đánh giá món này chưa (Chặn đánh giá lần 2)
    const existingReview = await Review.findOne({
      recipe: recipeId,
      user: userId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá món ăn này rồi!" });
    }

    // Tạo đánh giá mới
    const newReview = new Review({
      recipe: recipeId,
      user: userId,
      rating,
      comment,
    });
    await newReview.save();

    // Tính toán lại điểm sao trung bình và số lượt đánh giá cho Recipe
    const allReviews = await Review.find({ recipe: recipeId });
    const numReviews = allReviews.length;
    const averageRating =
      allReviews.reduce((acc, item) => acc + item.rating, 0) / numReviews;

    // Cập nhật trực tiếp vào model Recipe
    await Recipe.findByIdAndUpdate(recipeId, {
      rating: Number(averageRating.toFixed(1)),
      reviewsCount: numReviews,
    });

    res
      .status(201)
      .json({ message: "Đã thêm đánh giá thành công!", review: newReview });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể gửi đánh giá", error: err.message });
  }
});

module.exports = router;
