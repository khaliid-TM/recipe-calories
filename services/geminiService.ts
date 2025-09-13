import { GoogleGenAI, Type } from "@google/genai";
import type { RecipeData, Ingredient } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const INGREDIENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "The name of the ingredient.",
    },
    quantity: {
      type: Type.STRING,
      description: "The quantity of the ingredient (e.g., '1 cup', '100g').",
    },
    calories: {
      type: Type.INTEGER,
      description: "Estimated calories for this ingredient's portion in the dish.",
    },
    protein: {
      type: Type.INTEGER,
      description: "Estimated protein in grams for this ingredient's portion.",
    },
    carbs: {
      type: Type.INTEGER,
      description: "Estimated carbohydrates in grams for this ingredient's portion.",
    },
    fats: {
      type: Type.INTEGER,
      description: "Estimated fat in grams for this ingredient's portion.",
    },
  },
  required: ["name", "quantity", "calories", "protein", "carbs", "fats"],
};


const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "The name of the dish identified in the image.",
    },
    ingredients: {
      type: Type.ARRAY,
      description: "A list of the primary ingredients for this dish, including their individual nutritional breakdown.",
      items: INGREDIENT_SCHEMA,
    },
    totalCalories: {
      type: Type.INTEGER,
      description: "The estimated total calorie count for the dish. This should be the sum of calories from all ingredients.",
    },
    protein: {
      type: Type.INTEGER,
      description: "Estimated total protein in grams for a single serving. This should be the sum of protein from all ingredients.",
    },
    carbs: {
      type: Type.INTEGER,
      description: "Estimated total carbohydrates in grams for a single serving. This should be the sum of carbs from all ingredients.",
    },
    fats: {
      type: Type.INTEGER,
      description: "Estimated total fat in grams for a single serving. This should be the sum of fats from all ingredients.",
    },
  },
  required: ["recipeName", "ingredients", "totalCalories", "protein", "carbs", "fats"],
};

export const getRecipeFromImage = async (base64ImageData: string, mimeType: string): Promise<RecipeData> => {
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: "Analyze the food in this image. Provide a likely recipe name and an estimated total nutritional breakdown (calories, protein, carbs, fats) for a single serving. Also, provide a list of key ingredients. For *each* ingredient, provide its name, quantity, and its own estimated nutritional breakdown (calories, protein, carbs, fats). The total nutritional values for the dish should be the sum of the individual ingredient values. Respond in JSON format according to the provided schema.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
        temperature: 0.2,
        seed: 42,
      },
    });

    const jsonString = response.text;
    const parsedData = JSON.parse(jsonString);

    // Basic validation
    if (
      !parsedData.recipeName ||
      !Array.isArray(parsedData.ingredients) ||
      !parsedData.ingredients.every((ing: any) =>
          typeof ing.name === 'string' &&
          typeof ing.quantity === 'string' &&
          typeof ing.calories === 'number' &&
          typeof ing.protein === 'number' &&
          typeof ing.carbs === 'number' &&
          typeof ing.fats === 'number'
      ) ||
      typeof parsedData.totalCalories !== 'number' ||
      typeof parsedData.protein !== 'number' ||
      typeof parsedData.carbs !== 'number' ||
      typeof parsedData.fats !== 'number'
    ) {
      throw new Error("Received malformed data from the API.");
    }

    return parsedData as RecipeData;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get recipe information from the image. The AI model may be unable to process this request.");
  }
};

export const getNutritionForIngredient = async (ingredientText: string): Promise<Ingredient> => {
    const textPart = {
        text: `Provide an estimated nutritional breakdown (calories, protein, carbs, fats) for the following food item: "${ingredientText}". Respond in JSON format according to the provided schema. The ingredient name in the response should be a cleaned-up version of the user's input, and the response should include the quantity from the query (e.g., if the query is '1 cup rice', the quantity should be '1 cup').`,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: INGREDIENT_SCHEMA,
                temperature: 0.2,
            },
        });
        
        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        if (
            typeof parsedData.name !== 'string' ||
            typeof parsedData.quantity !== 'string' ||
            typeof parsedData.calories !== 'number' ||
            typeof parsedData.protein !== 'number' ||
            typeof parsedData.carbs !== 'number' ||
            typeof parsedData.fats !== 'number'
        ) {
            throw new Error("Received malformed data for ingredient from the API.");
        }
        
        return parsedData as Ingredient;

    } catch (error) {
        console.error("Gemini API call for single ingredient failed:", error);
        throw new Error("Failed to get nutritional information for the ingredient.");
    }
};