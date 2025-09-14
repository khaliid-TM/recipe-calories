import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import type { RecipeData, Ingredient } from '../types';
import { getNutritionForIngredient } from '../services/geminiService';

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

  useEffect(() => {
    setEditedIngredients([...data.ingredients]);
    setIsEditing(false);
  }, [data]);
  
  const handleRemoveIngredient = (indexToRemove: number) => {
    setEditedIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyzeIngredient = async () => {
    const { name, quantity } = newIngredient;
    if (name.trim() === '' || quantity.trim() === '') {
        Alert.alert('Error', 'Please enter both a quantity and an ingredient name.');
        return;
    }
    const query = `${quantity} ${name}`;

    setIsAnalyzingIngredient(true);
    try {
        const nutritionData = await getNutritionForIngredient(query);
        setNewIngredient(nutritionData);
    } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsAnalyzingIngredient(false);
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() === '' || newIngredient.quantity.trim() === '' || newIngredient.calories <= 0) {
      Alert.alert('Error', 'Please analyze an ingredient with a quantity before adding.');
      return;
    }
    setEditedIngredients(prev => [...prev, newIngredient]);
    setNewIngredient(initialNewIngredientState);
  };

  const handleSaveChanges = () => {
    onUpdateIngredients(editedIngredients);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedIngredients([...data.ingredients]);
    setIsEditing(false);
    setNewIngredient(initialNewIngredientState);
  };

  const displayIngredients = isEditing ? editedIngredients : data.ingredients;

  return (
    <View style={styles.container}>
      <Text style={styles.recipeName}>{data.recipeName}</Text>
      
      <View style={styles.calorieSection}>
        <Text style={styles.calorieLabel}>Estimated Calories</Text>
        <Text style={styles.calorieValue}>{data.totalCalories}</Text>
        <Text style={styles.calorieUnit}>kcal</Text>
      </View>

      <View style={styles.macroContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>{data.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{data.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fats</Text>
          <Text style={styles.macroValue}>{data.fats}g</Text>
        </View>
      </View>

      <View style={styles.ingredientsSection}>
        <View style={styles.ingredientsHeader}>
          <Text style={styles.ingredientsTitle}>Ingredients Breakdown</Text>
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.ingredientsList} nestedScrollEnabled>
          {displayIngredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
              </View>
              <View style={styles.ingredientNutrition}>
                <Text style={styles.nutritionText}>{ingredient.calories} cal</Text>
                <Text style={styles.nutritionText}>P: {ingredient.protein}g</Text>
                <Text style={styles.nutritionText}>C: {ingredient.carbs}g</Text>
                <Text style={styles.nutritionText}>F: {ingredient.fats}g</Text>
              </View>
              {isEditing && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveIngredient(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {isEditing && (
          <View style={styles.addIngredientSection}>
            <Text style={styles.addIngredientTitle}>Add Ingredient</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Quantity (e.g., 1 cup)"
                placeholderTextColor="#64748b"
                value={newIngredient.quantity}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, quantity: text }))}
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Ingredient name"
                placeholderTextColor="#64748b"
                value={newIngredient.name}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, name: text }))}
              />
            </View>

            <TouchableOpacity
              style={[styles.analyzeIngredientButton, isAnalyzingIngredient && styles.disabledButton]}
              onPress={handleAnalyzeIngredient}
              disabled={isAnalyzingIngredient}
            >
              <Text style={styles.analyzeIngredientButtonText}>
                {isAnalyzingIngredient ? 'Analyzing...' : 'Analyze'}
              </Text>
            </TouchableOpacity>

            <View style={styles.nutritionInputRow}>
              <TextInput
                style={styles.nutritionInput}
                placeholder="Cal"
                placeholderTextColor="#64748b"
                value={newIngredient.calories.toString()}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, calories: Number(text) || 0 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.nutritionInput}
                placeholder="Protein"
                placeholderTextColor="#64748b"
                value={newIngredient.protein.toString()}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, protein: Number(text) || 0 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.nutritionInput}
                placeholder="Carbs"
                placeholderTextColor="#64748b"
                value={newIngredient.carbs.toString()}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, carbs: Number(text) || 0 }))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.nutritionInput}
                placeholder="Fats"
                placeholderTextColor="#64748b"
                value={newIngredient.fats.toString()}
                onChangeText={(text) => setNewIngredient(prev => ({ ...prev, fats: Number(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddIngredient}
            >
              <Text style={styles.addButtonText}>Add Ingredient</Text>
            </TouchableOpacity>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22d3ee',
    textAlign: 'center',
    marginBottom: 24,
  },
  calorieSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 56,
    fontWeight: '800',
    color: 'white',
    lineHeight: 64,
  },
  calorieUnit: {
    fontSize: 16,
    color: '#94a3b8',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ingredientsSection: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 24,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  editButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsList: {
    maxHeight: 300,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#94a3b8',
  },
  ingredientNutrition: {
    alignItems: 'flex-end',
  },
  nutritionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 1,
  },
  removeButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addIngredientSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  addIngredientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  analyzeIngredientButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeIngredientButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  nutritionInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
});