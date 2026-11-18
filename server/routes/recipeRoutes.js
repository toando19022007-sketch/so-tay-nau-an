const router = require('express').Router();
const Recipe = require('../models/Recipe');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' }; 
    }
    if (category) {
      query.category = category;
    }

    const recipes = await Recipe.find(query).populate('author', 'username email');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/search-by-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.body; 
    if (!ingredients || !ingredients.length) {
      return res.status(400).json({ message: 'Vui lòng cung cấp danh sách nguyên liệu!' });
    }

    const recipes = await Recipe.find({
      ingredients: { $in: ingredients.map(i => new RegExp(i, 'i')) }
    }).populate('author', 'username');

    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, category, time, difficulty, ingredients, steps, image } = req.body;

    const newRecipe = new Recipe({
      title,
      category,
      time,
      difficulty,
      ingredients,
      steps,
      image,
      author: req.user.id 
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json({ message: 'Tạo công thức thành công!', recipe: savedRecipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức!' });

    // Kiểm tra quyền: Nếu không phải Admin và không phải người tạo thì chặn
    if (req.user.role !== 'ADMIN' && recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa công thức này!' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({ message: 'Cập nhật thành công!', recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức!' });

    if (req.user.role !== 'ADMIN' && recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa công thức này!' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Xóa công thức thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;