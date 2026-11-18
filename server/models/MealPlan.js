const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
    },
    mealType: {
      type: String,
      required: true,
      enum: ["Sáng", "Trưa", "Tối"],
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MealPlan", mealPlanSchema);
