import React, { useState, useEffect } from 'react';
import type { RecipeData, Ingredient } from '../types';
import { getNutritionForIngredient } from '../services/geminiService';
import { COMMON_INGREDIENTS } from '../constants/ingredients';

interface CalorieDisplayProps {
  data: RecipeData;
  onUpdateIngredients: (updatedIngredients: Ingredient[]) => void;
}

const initialNewIngredientState: Ingredient = {
    name: '',
    quantity: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
};

export const CalorieDisplay: React.FC<CalorieDisplayProps> = ({ data, onUpdateIngredients }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<Ingredient>(initialNewIngredientState);
  const [isAnalyzingIngredient, setIsAnalyzingIngredient] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // State for inline quantity editing
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [newQuantityValue, setNewQuantityValue] = useState('');
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  useEffect(() => {
    setEditedIngredients([...data.ingredients]);
    setIsEditing(false);
    setEditingQuantityIndex(null);
  }, [data]);
  
  const handleRemoveIngredient = (indexToRemove: number) => {
    setEditedIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNewIngredientNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };
  
  const handleNewIngredientTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewIngredient(prev => ({ ...prev, name: value }));

    if (value.length > 1) {
      const filteredSuggestions = COMMON_INGREDIENTS.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Show up to 5 suggestions
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewIngredient(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
  };

  const handleAnalyzeIngredient = async () => {
    const { name, quantity } = newIngredient;
    if (name.trim() === '' || quantity.trim() === '') {
        setIngredientError("Please enter both a quantity and an ingredient name.");
        return;
    }
    const query = `${quantity} ${name}`;

    setShowSuggestions(false);
    setIsAnalyzingIngredient(true);
    setIngredientError(null);
    try {
        const nutritionData = await getNutritionForIngredient(query);
        setNewIngredient(nutritionData);
    } catch (err) {
        if(err instanceof Error) {
            setIngredientError(err.message);
        } else {
            setIngredientError("An unknown error occurred.");
        }
    } finally {
        setIsAnalyzingIngredient(false);
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.name.trim() === '' || newIngredient.quantity.trim() === '' || newIngredient.calories <= 0) {
      setIngredientError("Please analyze an ingredient with a quantity before adding.");
      return;
    };
    setEditedIngredients(prev => [...prev, newIngredient]);
    setNewIngredient(initialNewIngredientState);
    setIngredientError(null);
  };

  const handleSaveChanges = () => {
    onUpdateIngredients(editedIngredients);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedIngredients([...data.ingredients]); // Revert changes
    setIsEditing(false);
    setIngredientError(null);
    setNewIngredient(initialNewIngredientState);
    setShowSuggestions(false);
    setEditingQuantityIndex(null);
  };

  const handleEditQuantityClick = (index: number) => {
    setEditingQuantityIndex(index);
    setNewQuantityValue(editedIngredients[index].quantity);
  };

  const handleCancelEditQuantity = () => {
    setEditingQuantityIndex(null);
    setNewQuantityValue('');
  };

  const handleUpdateQuantity = async (indexToUpdate: number) => {
    const ingredientToUpdate = editedIngredients[indexToUpdate];
    if (!ingredientToUpdate || newQuantityValue.trim() === '') return;

    const query = `${newQuantityValue} ${ingredientToUpdate.name}`;
    setIsUpdatingQuantity(true);
    setIngredientError(null);

    try {
        const updatedNutrition = await getNutritionForIngredient(query);
        const newIngredients = [...editedIngredients];
        newIngredients[indexToUpdate] = updatedNutrition;
        setEditedIngredients(newIngredients);
        setEditingQuantityIndex(null);
        setNewQuantityValue('');
    } catch (err) {
        if (err instanceof Error) {
            setIngredientError(`Failed to update quantity: ${err.message}`);
        } else {
            setIngredientError("An unknown error occurred while updating quantity.");
        }
    } finally {
        setIsUpdatingQuantity(false);
    }
  };


  const displayIngredients = isEditing ? editedIngredients : data.ingredients;

  return (
    <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-teal-300 mb-2">
        {data.recipeName}
      </h2>
      <div className="text-center my-6">
        <p className="text-slate-400 text-lg">Estimated Calories</p>
        <p className="text-7xl font-extrabold text-white tracking-tight">
          {data.totalCalories}
        </p>
        <p className="text-slate-400 text-lg">kcal</p>
      </div>

      <div className="my-6 flex justify-around text-center p-4 bg-slate-900/50 rounded-lg">
        <div>
            <p className="text-sm sm:text-base text-slate-400">Protein</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{data.protein}g</p>
        </div>
        <div>
            <p className="text-sm sm:text-base text-slate-400">Carbs</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{data.carbs}g</p>
        </div>
        <div>
            <p className="text-sm sm:text-base text-slate-400">Fats</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{data.fats}g</p>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-200">
            Nutritional Breakdown by Ingredient
            </h3>
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Edit Ingredients
                </button>
            )}
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
              <tr>
                <th scope="col" className="px-4 py-3">Ingredient</th>
                <th scope="col" className="px-4 py-3">Quantity</th>
                <th scope="col" className="px-4 py-3 text-right">Calories</th>
                <th scope="col" className="px-4 py-3 text-right">Protein (g)</th>
                <th scope="col" className="px-4 py-3 text-right">Carbs (g)</th>
                <th scope="col" className="px-4 py-3 text-right">Fats (g)</th>
                {isEditing && <th scope="col" className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayIngredients.map((ingredient, index) => {
                const isCurrentlyEditingQty = editingQuantityIndex === index;
                return (
                  <tr key={index} className={`bg-slate-800 border-b border-slate-700 ${!isCurrentlyEditingQty && 'hover:bg-slate-700/50'}`}>
                    <th scope="row" className="px-4 py-4 font-medium text-slate-100 whitespace-nowrap">
                      {ingredient.name}
                    </th>
                    <td className="px-4 py-4">
                      {isCurrentlyEditingQty ? (
                        <input
                          type="text"
                          value={newQuantityValue}
                          onChange={(e) => setNewQuantityValue(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-md p-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                          disabled={isUpdatingQuantity}
                          aria-label={`Edit quantity for ${ingredient.name}`}
                        />
                      ) : (
                        ingredient.quantity
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">{ingredient.calories}</td>
                    <td className="px-4 py-4 text-right">{ingredient.protein}</td>
                    <td className="px-4 py-4 text-right">{ingredient.carbs}</td>
                    <td className="px-4 py-4 text-right">{ingredient.fats}</td>
                    {isEditing && (
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {isCurrentlyEditingQty ? (
                          <>
                            <button
                              onClick={() => handleUpdateQuantity(index)}
                              className="text-green-400 hover:text-green-300 font-semibold disabled:text-slate-500 disabled:cursor-wait"
                              disabled={isUpdatingQuantity}
                            >
                              {isUpdatingQuantity ? '...' : 'Update'}
                            </button>
                            <button
                              onClick={handleCancelEditQuantity}
                              className="text-slate-400 hover:text-slate-300 font-semibold ml-3"
                              disabled={isUpdatingQuantity}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditQuantityClick(index)} className="text-cyan-400 hover:text-cyan-300 font-semibold">Edit Qty</button>
                            <button onClick={() => handleRemoveIngredient(index)} className="text-red-400 hover:text-red-300 font-semibold ml-3">Remove</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {isEditing && (
            <div className="mt-6">
                <h4 className="text-lg font-semibold text-slate-200 mb-3">Add Ingredient</h4>
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div className="col-span-1">
                            <label htmlFor="quantity" className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                            <input 
                                type="text" 
                                name="quantity" 
                                placeholder="e.g., 1 cup"
                                value={newIngredient.quantity} 
                                onChange={handleNewIngredientTextChange} 
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1">Ingredient Name</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={newIngredient.name} 
                                    onChange={handleNameChange} 
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    autoComplete="off"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow click
                                />
                                {showSuggestions && (
                                    <ul className="absolute z-10 w-full bg-slate-600 border border-slate-500 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="px-3 py-2 cursor-pointer hover:bg-slate-700 text-slate-200"
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div>
                             <button onClick={handleAnalyzeIngredient} disabled={isAnalyzingIngredient} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-wait">
                                {isAnalyzingIngredient ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    </div>

                    {ingredientError && <p className="text-red-400 text-xs mt-2">{ingredientError}</p>}
                    
                    <form onSubmit={handleAddIngredient} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end mt-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="calories" className="block text-xs font-medium text-slate-400 mb-1">Calories</label>
                            <input type="number" name="calories" value={newIngredient.calories} onChange={handleNewIngredientNumberChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="protein" className="block text-xs font-medium text-slate-400 mb-1">Protein</label>
                            <input type="number" name="protein" value={newIngredient.protein} onChange={handleNewIngredientNumberChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="carbs" className="block text-xs font-medium text-slate-400 mb-1">Carbs</label>
                            <input type="number" name="carbs" value={newIngredient.carbs} onChange={handleNewIngredientNumberChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label htmlFor="fats" className="block text-xs font-medium text-slate-400 mb-1">Fats</label>
                            <input type="number" name="fats" value={newIngredient.fats} onChange={handleNewIngredientNumberChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                         <div className="col-span-2 sm:col-span-1">
                             <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Add</button>
                        </div>
                    </form>
                 </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={handleCancel} className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveChanges} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Changes</button>
                </div>
            </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
