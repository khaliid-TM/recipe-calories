import React from 'react';
import type { RecipeData } from '../types';

interface HistoryDisplayProps {
  history: RecipeData[];
  onClearHistory: () => void;
  onSelectHistoryItem: (recipe: RecipeData) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onClearHistory, onSelectHistoryItem }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mt-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-200">Recent Analyses</h2>
        <button
          onClick={onClearHistory}
          className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-3 rounded-md transition-colors"
          aria-label="Clear recipe history"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-3">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="bg-slate-800 rounded-lg p-3 shadow-md flex justify-between items-center cursor-pointer transition-all duration-200 hover:bg-slate-700 hover:scale-105"
            onClick={() => onSelectHistoryItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHistoryItem(item)}
            aria-label={`View details for ${item.recipeName}`}
          >
            <h3 className="text-md font-semibold text-teal-400 truncate pr-4">{item.recipeName}</h3>
            <p className="text-slate-400 text-right shrink-0 ml-4">
              <span className="font-bold text-white text-lg">{item.totalCalories}</span> kcal
            </p>
          </div>
        ))}
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
