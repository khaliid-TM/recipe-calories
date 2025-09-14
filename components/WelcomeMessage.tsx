import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WelcomeMessage: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>How it works</Text>
            <View style={styles.stepContainer}>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>1.</Text>
                    <Text style={styles.stepText}>Upload a clear picture of a single dish.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>2.</Text>
                    <Text style={styles.stepText}>Tap the "Estimate Calories" button.</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepNumber}>3.</Text>
                    <Text style={styles.stepText}>Our AI will analyze the food and provide an estimated calorie count along with key ingredients.</Text>
                </View>
            </View>
            <Text style={styles.disclaimer}>
                Please note: The calorie count is an AI-generated estimate and should be used for informational purposes only.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#cbd5e1',
        textAlign: 'center',
        marginBottom: 16,
    },
    stepContainer: {
        marginBottom: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stepNumber: {
        color: '#22d3ee',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 12,
        minWidth: 20,
    },
    stepText: {
        color: '#94a3b8',
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
    },
    disclaimer: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});