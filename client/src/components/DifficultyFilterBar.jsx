import React from "react";

const DIFFICULTY_LEVELS = ["Tất cả", "Dễ", "Trung bình", "Khó"];

export default function DifficultyFilterBar({
  difficultyFilter,
  onSelectDifficulty,
  totalCount,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DIFFICULTY_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSelectDifficulty(level)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              difficultyFilter === level
                ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300"
            }`}
          >
            {level === "Tất cả" ? "🍽 Tất cả món" : `🔥 Độ khó: ${level}`}
          </button>
        ))}
      </div>
      <span className="text-xs font-bold text-stone-400">
        Hiển thị {totalCount} công thức
      </span>
    </div>
  );
}