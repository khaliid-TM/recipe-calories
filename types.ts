export interface Ingredient {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface RecipeData {
  recipeName: string;
  ingredients: Ingredient[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}