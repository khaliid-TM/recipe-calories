import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
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
  const [image, setImage] = useState<{ uri: string; base64: string; mimeType: string; } | null>(null);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RecipeData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('recipeHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Failed to load history from AsyncStorage:", err);
    }
  };

  const saveHistory = async (newHistory: RecipeData[]) => {
    try {
      await AsyncStorage.setItem('recipeHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to save history to AsyncStorage:", err);
    }
  };

  const handleImageUpload = useCallback((imageData: { uri: string; base64: string; mimeType: string; }) => {
    setImage(imageData);
    setRecipeData(null);
    setError(null);
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

      const newHistory = [data, ...history].slice(0, 5);
      setHistory(newHistory);
      await saveHistory(newHistory);

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

  const handleUpdateIngredients = async (updatedIngredients: Ingredient[]) => {
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
    
    const newHistory = [updatedRecipe, ...history].slice(0, 5);
    setHistory(newHistory);
    await saveHistory(newHistory);
  };

  const handleClear = () => {
    setImage(null);
    setRecipeData(null);
    setError(null);
    setIsLoading(false);
  };

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem('recipeHistory');
    } catch (err) {
      console.error("Failed to clear history from AsyncStorage:", err);
    }
  };

  const handleSelectHistoryItem = (recipe: RecipeData) => {
    setRecipeData(recipe);
    setImage(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        
        <ImageUploader 
          onImageUpload={handleImageUpload}
          onAnalyze={handleAnalyzeClick}
          onClear={handleClear}
          hasImage={!!image}
          isLoading={isLoading}
          imageUri={image?.uri}
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Calorie Estimator. Powered by Google Gemini.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default App;