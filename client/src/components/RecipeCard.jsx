import React from "react";
import { Clock, Star } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

export default function RecipeCard({ recipe, onSelect }) {
  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-[1.75rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/70 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img
          src={recipe.image || FALLBACK_IMAGE}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 text-xs font-extrabold text-orange-600">
          {recipe.difficulty || "Dễ"}
        </span>
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
          <span className="flex items-center gap-1.5 bg-black/45 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> {recipe.time || "30 phút"}
          </span>
          <span className="flex items-center gap-1 bg-black/45 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {Number(recipe.rating || 0).toFixed(1)} ({recipe.reviewsCount || 0})
          </span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-orange-600 transition line-clamp-1 mb-2">
            {recipe.title}
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 mb-4">
            {recipe.description || "Công thức gia truyền dễ làm, nguyên liệu quen thuộc."}
          </p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400">
            {recipe.ingredients?.length || 0} nguyên liệu
          </span>
          <span className="text-xs font-extrabold text-orange-600">Xem cách nấu →</span>
        </div>
      </div>
    </div>
  );
}