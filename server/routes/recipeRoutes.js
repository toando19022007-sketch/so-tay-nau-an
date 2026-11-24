const router = require("express").Router();
const Recipe = require("../models/Recipe");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    const recipes = await Recipe.find(query).populate(
      "author",
      "username email",
    );
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/search-by-ingredients", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !ingredients.length) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp danh sách nguyên liệu!" });
    }

    const recipes = await Recipe.find({
      ingredients: { $in: ingredients.map((i) => new RegExp(i, "i")) },
    }).populate("author", "username");

    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Phần đã sửa để tránh lỗi 500 khi tạo món
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, category, time, difficulty, ingredients, steps, image } =
      req.body;
    const authorId = req.user?.id || req.user?._id;

    if (!authorId) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập lại trước khi đăng món!" });
    }

    const normalizedIngredients = Array.isArray(ingredients)
      ? ingredients.map((item) => String(item).trim()).filter(Boolean)
      : String(ingredients || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

    const normalizedSteps = Array.isArray(steps)
      ? steps.map((item) => String(item).trim()).filter(Boolean)
      : String(steps || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ message: "Tên món ăn không được để trống!" });
    }

    if (normalizedIngredients.length === 0 || normalizedSteps.length === 0) {
      return res.status(400).json({
        message: "Vui lòng nhập ít nhất 1 nguyên liệu và 1 bước thực hiện!",
      });
    }

    const newRecipe = new Recipe({
      title: title.trim(),
      category:
        category && String(category).trim()
          ? String(category).trim()
          : "Món mặn",
      time:
        time !== undefined && time !== null && String(time).trim() !== ""
          ? String(time).trim()
          : "30 phút",
      difficulty: ["Dễ", "Trung bình", "Khó"].includes(difficulty)
        ? difficulty
        : "Trung bình",
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      image: image && String(image).trim() ? String(image).trim() : undefined,
      author: authorId,
    });

    const savedRecipe = await newRecipe.save();
    await savedRecipe.populate("author", "username email");

    res.status(201).json({
      message: "Tạo công thức thành công!",
      recipe: savedRecipe,
    });
  } catch (err) {
    console.error("Lỗi POST /api/recipes:", err);
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
    res
      .status(500)
      .json({ message: "Không thể lưu công thức", error: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ message: "Không tìm thấy công thức!" });

    if (req.user.role !== "ADMIN" && recipe.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa công thức này!" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res
      .status(200)
      .json({ message: "Cập nhật thành công!", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ message: "Không tìm thấy công thức!" });

    if (req.user.role !== "ADMIN" && recipe.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa công thức này!" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa công thức thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
