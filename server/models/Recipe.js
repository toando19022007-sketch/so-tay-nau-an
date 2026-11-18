const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    time: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Dễ", "Trung bình", "Khó"],
      default: "Trung bình",
    },
    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],
    image: { type: String },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recipe", recipeSchema);
