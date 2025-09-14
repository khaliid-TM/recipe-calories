import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error:</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
  },
});