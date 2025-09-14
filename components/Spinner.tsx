import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Spinner: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#22d3ee" />
      <Text style={styles.text}>AI is analyzing your image...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  text: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
});