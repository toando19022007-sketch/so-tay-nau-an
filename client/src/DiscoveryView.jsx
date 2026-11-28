import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import RecipeHeroSearch from "./components/RecipeHeroSearch";
import DifficultyFilterBar from "./components/DifficultyFilterBar";
import RecipeGrid from "./components/RecipeGrid";
import CreateRecipeModal from "./components/CreateRecipeModal";

export default function DiscoveryView({ onSelectRecipe }) {
  const { recipes, loading, fetchRecipes } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("Tất cả");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRecipes = recipes.filter((r) => {
    const matchName = r.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiff =
      difficultyFilter === "Tất cả" || r.difficulty === difficultyFilter;
    return matchName && matchDiff;
  });

  return (
    <>
      <RecipeHeroSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      <DifficultyFilterBar
        difficultyFilter={difficultyFilter}
        onSelectDifficulty={setDifficultyFilter}
        totalCount={filteredRecipes.length}
      />

      <RecipeGrid
        loading={loading}
        recipes={filteredRecipes}
        onSelectRecipe={onSelectRecipe}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateRecipeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchRecipes}
        />
      )}
    </>
  );
}