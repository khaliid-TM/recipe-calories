import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CalorieDisplay } from './components/CalorieDisplay';
import { Spinner } from './components/Spinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { WelcomeMessage } from './components/WelcomeMessage';
import { HistoryDisplay } from './components/HistoryDisplay';
import type { RecipeData, Ingredient } from './types';
import { getRecipeFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<{ base64: string; mimeType: string; } | null>(null);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RecipeData[]>([]);
  const [uploaderKey, setUploaderKey] = useState(Date.now());

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('recipeHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Failed to parse history from localStorage:", err);
      localStorage.removeItem('recipeHistory');
    }
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      setImage({ base64, mimeType });
      setRecipeData(null);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipeData(null);

    try {
      const data = await getRecipeFromImage(image.base64, image.mimeType);
      setRecipeData(data);

      setHistory(prevHistory => {
        const newHistory = [data, ...prevHistory].slice(0, 5);
        try {
          localStorage.setItem('recipeHistory', JSON.stringify(newHistory));
        } catch (err) {
            console.error("Failed to save history to localStorage:", err);
        }
        return newHistory;
      });

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(`An error occurred: ${err.message}. Please try again.`);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIngredients = (updatedIngredients: Ingredient[]) => {
    if (!recipeData) return;

    const newTotalCalories = updatedIngredients.reduce((sum, ing) => sum + ing.calories, 0);
    const newProtein = updatedIngredients.reduce((sum, ing) => sum + ing.protein, 0);
    const newCarbs = updatedIngredients.reduce((sum, ing) => sum + ing.carbs, 0);
    const newFats = updatedIngredients.reduce((sum, ing) => sum + ing.fats, 0);

    const updatedRecipe: RecipeData = {
        ...recipeData,
        ingredients: updatedIngredients,
        totalCalories: newTotalCalories,
        protein: newProtein,
        carbs: newCarbs,
        fats: newFats,
    };
    
    setRecipeData(updatedRecipe);
    
    // Treat edited recipe as a new history entry
    setHistory(prevHistory => {
      const newHistory = [updatedRecipe, ...prevHistory].slice(0, 5);
      try {
        localStorage.setItem('recipeHistory', JSON.stringify(newHistory));
      } catch (err) {
          console.error("Failed to save history to localStorage:", err);
      }
      return newHistory;
    });
  };

  const handleClear = () => {
    setImage(null);
    setRecipeData(null);
    setError(null);
    setIsLoading(false);
    setUploaderKey(Date.now());
  }

  const handleClearHistory = () => {
    setHistory([]);
    try {
        localStorage.removeItem('recipeHistory');
    } catch (err) {
        console.error("Failed to clear history from localStorage:", err);
    }
  };

  const handleSelectHistoryItem = (recipe: RecipeData) => {
    setRecipeData(recipe);
    setImage(null);
    setError(null);
    setIsLoading(false);
    setUploaderKey(Date.now()); // Reset the uploader component
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <Header />
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        <ImageUploader 
          key={uploaderKey}
          onImageUpload={handleImageUpload}
          onAnalyze={handleAnalyzeClick}
          onClear={handleClear}
          hasImage={!!image}
          isLoading={isLoading}
        />

        {isLoading && <Spinner />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        
        {!isLoading && !error && recipeData && (
          <CalorieDisplay data={recipeData} onUpdateIngredients={handleUpdateIngredients} />
        )}
        
        {!isLoading && !error && !recipeData && <WelcomeMessage />}

        {!isLoading && !error && (
            <HistoryDisplay 
              history={history} 
              onClearHistory={handleClearHistory}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
        )}
      </main>
      <footer className="text-center text-slate-500 mt-12 text-sm">
        <p>&copy; 2024 Calorie Estimator. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;