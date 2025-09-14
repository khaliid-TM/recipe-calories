import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Analyses</Text>
        <TouchableOpacity style={styles.clearButton} onPress={onClearHistory}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.historyList} nestedScrollEnabled>
        {history.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.historyItem}
            onPress={() => onSelectHistoryItem(item)}
          >
            <Text style={styles.recipeName} numberOfLines={1}>{item.recipeName}</Text>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieValue}>{item.totalCalories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cbd5e1',
  },
  clearButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22d3ee',
    flex: 1,
    marginRight: 16,
  },
  calorieInfo: {
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  calorieUnit: {
    fontSize: 12,
    color: '#94a3b8',
  },
});