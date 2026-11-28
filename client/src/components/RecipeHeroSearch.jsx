import React from "react";
import { Search, Plus, Sparkles, Utensils } from "lucide-react";

export default function RecipeHeroSearch({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-8 sm:p-12 text-white mb-10 shadow-xl">
      <div className="max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-amber-300 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Bộ sưu tập món ngon chuẩn vị Việt
        </div>
        <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-4 tracking-tight">
          Nấu ngon hơn mỗi ngày cùng <span className="text-amber-400">Sổ Tay Bếp</span>
        </h2>
        <p className="text-stone-300 text-sm sm:text-base mb-8 leading-relaxed">
          Tìm kiếm công thức chi tiết, xem đánh giá chân thực từ cộng đồng và sắp xếp thực đơn cả tuần chỉ trong vài giây.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Bạn muốn nấu món gì hôm nay? (Phở, Bún chả, Sườn xào...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-stone-800 placeholder-stone-400 text-sm font-medium focus:outline-none"
            />
          </div>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition"
          >
            <Plus className="w-4 h-4" /> Đăng món mới
          </button>
        </div>
      </div>
      <Utensils className="w-72 h-72 text-orange-500/10 absolute -right-10 -bottom-12 rotate-12 pointer-events-none" />
    </div>
  );
}