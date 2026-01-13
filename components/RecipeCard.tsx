
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group border border-stone-100"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-600">
          {recipe.difficulty}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
        <p className="text-stone-600 text-sm line-clamp-2 mb-4">{recipe.description}</p>
        <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
          <span className="flex items-center gap-1">
            <i className="fa-regular fa-clock"></i> {recipe.time}
          </span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-mortar-pestle"></i> {recipe.ingredients.length} Ingredients
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
