import React, { useState, useEffect } from "react";
import axiosClient from "./api/axiosClient";
import {
  Utensils,
  Search,
  Clock,
  Star,
  Calendar,
  Plus,
  Trash2,
  User,
  LogOut,
  ChefHat,
  X,
  CheckCircle2,
  Sparkles,
  Flame,
  BookOpen,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];
const MEAL_TYPES = ["Sáng", "Trưa", "Tối"];

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState("recipes");
  const [user, setUser] = useState(getStoredUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("Tất cả");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    category: "Món mặn",
    description: "",
    image: "",
    time: 30,
    difficulty: "Dễ",
    ingredients: "",
    steps: "",
  });

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [mealPlans, setMealPlans] = useState([]);
  const [planModal, setPlanModal] = useState({
    open: false,
    day: "",
    meal: "",
  });
  const [selectedPlanRecipeId, setSelectedPlanRecipeId] = useState("");

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/recipes");
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải công thức:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get("/meal-plans");
      setMealPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải thực đơn:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (user) fetchMealPlans();
    else setMealPlans([]);
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await axiosClient.post(endpoint, authForm);
      if (isRegister) {
        notify("Đăng ký thành công! Hãy đăng nhập ngay.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        setShowAuthModal(false);
        setAuthForm({ username: "", email: "", password: "" });
        notify(`Xin chào ${res.data.user.username || res.data.user.email}!`);
      }
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "Sai thông tin đăng nhập hoặc lỗi server!",
        "error",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setActiveTab("recipes");
    notify("Đã đăng xuất tài khoản");
  };

  const openRecipeDetail = async (recipe) => {
    setSelectedRecipe(recipe);
    setRating(5);
    setComment("");
    try {
      const res = await axiosClient.get(`/reviews/${recipe._id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReviews([]);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return notify("Đăng nhập để gửi đánh giá nhé!", "error");
    }
    if (!comment.trim()) {
      return notify("Vui lòng nhập nội dung đánh giá!", "error");
    }
    try {
      await axiosClient.post(`/reviews/${selectedRecipe._id}`, {
        rating,
        comment: comment.trim(),
      });
      notify("Đã gửi đánh giá của bạn!");
      setComment("");
      const resReviews = await axiosClient.get(
        `/reviews/${selectedRecipe._id}`,
      );
      setReviews(Array.isArray(resReviews.data) ? resReviews.data : []);
      fetchRecipes();
    } catch (err) {
      notify(
        err.response?.data?.message ||
          "Bạn đã đánh giá món này rồi hoặc có lỗi xảy ra!",
        "error",
      );
    }
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return notify("Bạn cần đăng nhập để thêm công thức!", "error");
    }
    try {
      const payload = {
        title: newRecipe.title.trim(),
        category: newRecipe.category || "Món mặn",
        time: `${newRecipe.time || 30} phút`,
        difficulty: newRecipe.difficulty || "Dễ",
        image: newRecipe.image.trim(),
        ingredients: newRecipe.ingredients
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        steps: newRecipe.steps
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await axiosClient.post("/recipes", payload);
      notify("Đăng công thức mới thành công!");
      setShowCreateModal(false);
      setNewRecipe({
        title: "",
        category: "Món mặn",
        description: "",
        image: "",
        time: 30,
        difficulty: "Dễ",
        ingredients: "",
        steps: "",
      });
      fetchRecipes();
    } catch (err) {
      notify(
        err.response?.data?.message || "Không thể lưu công thức!",
        "error",
      );
    }
  };

  const handleAddMealPlan = async (e) => {
    e.preventDefault();
    if (!selectedPlanRecipeId) return;
    try {
      await axiosClient.post("/meal-plans", {
        dayOfWeek: planModal.day,
        mealType: planModal.meal,
        recipeId: selectedPlanRecipeId,
      });
      notify(`Đã thêm vào ${planModal.day} - Bữa ${planModal.meal}`);
      setPlanModal({ open: false, day: "", meal: "" });
      fetchMealPlans();
    } catch (err) {
      notify(
        err.response?.data?.message || "Lỗi khi lưu thực đơn tuần!",
        "error",
      );
    }
  };

  const handleDeleteMealPlan = async (planId) => {
    try {
      await axiosClient.delete(`/meal-plans/${planId}`);
      notify("Đã xóa món khỏi thực đơn");
      fetchMealPlans();
    } catch {
      notify("Không thể xóa món!", "error");
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchName = r.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchDiff =
      difficultyFilter === "Tất cả" || r.difficulty === difficultyFilter;
    return matchName && matchDiff;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 selection:bg-orange-200">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-orange-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div
            onClick={() => setActiveTab("recipes")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-105 transition">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900">
                Sổ Tay <span className="text-orange-600">Nấu Ăn</span>
              </h1>
              <p className="text-[11px] font-medium text-stone-400">
                Bếp nhà ấm lửa mỗi ngày
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "recipes"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Công thức
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return notify(
                    "Vui lòng đăng nhập để dùng Thực đơn tuần!",
                    "error",
                  );
                }
                setActiveTab("meal-plan");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "meal-plan"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calendar className="w-4 h-4" /> Thực đơn tuần
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-200 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Đăng món
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-200 text-orange-700 font-extrabold flex items-center justify-center border border-orange-200">
                  {(user.username || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-bold text-stone-700 max-w-[120px] truncate">
                  {user.username || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold shadow-sm transition"
              >
                <User className="w-4 h-4 text-amber-400" /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "recipes" ? (
          <>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-8 sm:p-12 text-white mb-10 shadow-xl">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-amber-300 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Bộ sưu tập món ngon chuẩn
                  vị Việt
                </div>
                <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-4 tracking-tight">
                  Nấu ngon hơn mỗi ngày cùng{" "}
                  <span className="text-amber-400">Sổ Tay Bếp</span>
                </h2>
                <p className="text-stone-300 text-sm sm:text-base mb-8 leading-relaxed">
                  Tìm kiếm công thức chi tiết, xem đánh giá chân thực từ cộng
                  đồng và sắp xếp thực đơn cả tuần chỉ trong vài giây.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Bạn muốn nấu món gì hôm nay? (Phở, Bún chả, Sườn xào...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-stone-800 placeholder-stone-400 text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="sm:hidden flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> Đăng món mới
                  </button>
                </div>
              </div>
              <Utensils className="w-72 h-72 text-orange-500/10 absolute -right-10 -bottom-12 rotate-12 pointer-events-none" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["Tất cả", "Dễ", "Trung bình", "Khó"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      difficultyFilter === level
                        ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                        : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300"
                    }`}
                  >
                    {level === "Tất cả"
                      ? "🍽 Tất cả món"
                      : `🔥 Độ khó: ${level}`}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-stone-400">
                Hiển thị {filteredRecipes.length} công thức
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-3xl bg-white animate-pulse border border-stone-100"
                  />
                ))}
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                <ChefHat className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                  Chưa tìm thấy món ăn nào
                </h3>
                <p className="text-sm text-stone-400 mb-5">
                  Database hiện đang trống hoặc chưa có món khớp từ khóa của
                  bạn.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-md shadow-orange-200 transition"
                >
                  <Plus className="w-4 h-4" /> Thêm công thức đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    onClick={() => openRecipeDetail(recipe)}
                    className="group bg-white rounded-[1.75rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/70 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-stone-100">
                      <img
                        src={
                          recipe.image ||
                          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-extrabold text-orange-600 shadow-sm">
                        {recipe.difficulty || "Dễ"}
                      </span>
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
                        <span className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />{" "}
                          {recipe.time || "30 phút"}
                        </span>
                        <span className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-3 py-1 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {Number(recipe.rating || 0).toFixed(1)} (
                          {recipe.reviewsCount || 0})
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-orange-600 transition line-clamp-1 mb-2">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">
                          {recipe.description ||
                            "Công thức gia truyền dễ làm, nguyên liệu quen thuộc giúp bữa cơm thêm tròn vị."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <span className="text-xs font-bold text-stone-400">
                          {recipe.ingredients?.length || 0} nguyên liệu
                        </span>
                        <span className="text-xs font-extrabold text-orange-600 group-hover:translate-x-1 transition-transform">
                          Xem cách nấu →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                  Lập kế hoạch dinh dưỡng
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  Thực Đơn Tuần Của Bạn
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Chủ động lên lịch Sáng - Trưa - Tối cho cả tuần để đi chợ gọn
                  nhẹ và tiết kiệm thời gian.
                </p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-orange-50 text-orange-700 text-xs font-bold">
                📅 Đã lên lịch: {mealPlans.length} bữa ăn
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                    <h3 className="text-lg font-black text-stone-900">{day}</h3>
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  </div>

                  <div className="space-y-3">
                    {MEAL_TYPES.map((meal) => {
                      const items = mealPlans.filter(
                        (p) => p.dayOfWeek === day && p.mealType === meal,
                      );
                      return (
                        <div
                          key={meal}
                          className="bg-[#FAF7F2] rounded-2xl p-3.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-stone-500">
                              {meal === "Sáng"
                                ? "🌅 Bữa Sáng"
                                : meal === "Trưa"
                                  ? "☀️ Bữa Trưa"
                                  : "🌙 Bữa Tối"}
                            </span>
                            <button
                              onClick={() => {
                                setPlanModal({ open: true, day, meal });
                                setSelectedPlanRecipeId(recipes[0]?._id || "");
                              }}
                              className="w-6 h-6 rounded-lg bg-white border border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                              title="Thêm món"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">
                              Trống
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-stone-100 text-xs font-bold text-stone-800 shadow-2xs"
                                >
                                  <span className="truncate pr-2">
                                    {item.recipe?.title || "Món đã chọn"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleDeleteMealPlan(item._id)
                                    }
                                    className="text-stone-300 hover:text-rose-500 transition shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative h-64 sm:h-72">
              <img
                src={
                  selectedRecipe.image ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                }
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 text-stone-800 flex items-center justify-center shadow-lg hover:scale-105 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-xs font-extrabold">
                  {selectedRecipe.difficulty || "Dễ"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  {selectedRecipe.title}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-bold">
                <span className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Thời gian:{" "}
                  {selectedRecipe.time || "30 phút"}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {Number(selectedRecipe.rating || 0).toFixed(1)} sao (
                  {selectedRecipe.reviewsCount || 0} lượt đánh giá)
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-orange-100">
                  <h4 className="font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                    🛒 Nguyên liệu chuẩn bị
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    {(selectedRecipe.ingredients?.length
                      ? selectedRecipe.ingredients
                      : ["Đang cập nhật nguyên liệu"]
                    ).map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-orange-100">
                  <h4 className="font-extrabold text-stone-900 mb-3 flex items-center gap-2">
                    👩‍🍳 Các bước chế biến
                  </h4>
                  <ol className="space-y-3 text-sm text-stone-700">
                    {(selectedRecipe.steps?.length
                      ? selectedRecipe.steps
                      : ["Đang cập nhật hướng dẫn"]
                    ).map((st, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-6">
                <h3 className="text-lg font-extrabold text-stone-900 mb-4">
                  Đánh giá & Cảm nhận ({reviews.length})
                </h3>

                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-stone-50 p-4 rounded-2xl mb-5 border border-stone-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-stone-600">
                      Chọn số sao:
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Chia sẻ trải nghiệm nấu món này của bạn..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
                    >
                      Gửi
                    </button>
                  </div>
                </form>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-4">
                      Chưa có bình luận nào. Hãy mở hàng đánh giá nhé!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="p-4 rounded-2xl bg-white border border-stone-100 shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-extrabold text-stone-800">
                            {rev.user?.username ||
                              rev.user?.email ||
                              "Thành viên"}
                          </span>
                          <span className="text-xs font-bold text-amber-500">
                            {"★".repeat(rev.rating)}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-stone-900">
                  Đăng Công Thức Mới
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Chia sẻ bí quyết nấu ăn của bạn với mọi người
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Tên món ăn (vd: Sườn xào chua ngọt)"
                value={newRecipe.title}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Mô tả ngắn hấp dẫn về món ăn"
                value={newRecipe.description}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Link ảnh món ăn (URL)"
                value={newRecipe.image}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, image: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Thời gian (phút)"
                  value={newRecipe.time}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, time: e.target.value })
                  }
                  className="px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                />
                <select
                  value={newRecipe.difficulty}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, difficulty: e.target.value })
                  }
                  className="px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="Dễ">Độ khó: Dễ</option>
                  <option value="Trung bình">Độ khó: Trung bình</option>
                  <option value="Khó">Độ khó: Khó</option>
                </select>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Nguyên liệu (mỗi nguyên liệu xuống 1 dòng)"
                value={newRecipe.ingredients}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, ingredients: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <textarea
                rows={4}
                required
                placeholder="Các bước thực hiện (mỗi bước xuống 1 dòng)"
                value={newRecipe.steps}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, steps: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-200 transition"
              >
                Lưu & Đăng món
              </button>
            </form>
          </div>
        </div>
      )}

      {planModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-stone-900">
                Thêm món — {planModal.day} ({planModal.meal})
              </h3>
              <button
                onClick={() => setPlanModal({ open: false, day: "", meal: "" })}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMealPlan} className="space-y-4">
              <select
                value={selectedPlanRecipeId}
                onChange={(e) => setSelectedPlanRecipeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              >
                {recipes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-extrabold transition"
              >
                Lưu vào thực đơn
              </button>
            </form>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-7 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 absolute top-5 right-5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-black text-stone-900">
              {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
            </h2>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              {isRegister
                ? "Đăng ký để lưu công thức yêu thích và lên thực đơn tuần."
                : "Đăng nhập để quản lý công thức và thực đơn cá nhân."}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {isRegister && (
                <input
                  type="text"
                  required
                  placeholder="Tên hiển thị"
                  value={authForm.username}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                />
              )}
              <input
                type="email"
                required
                placeholder="Email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm transition mt-2"
              >
                {isRegister ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-stone-500">
              {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-orange-600 font-extrabold hover:underline"
              >
                {isRegister ? "Đăng nhập" : "Đăng ký"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
