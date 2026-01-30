import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[styles.step, index < currentStep && styles.stepActive]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  stepActive: {
    backgroundColor: Colors.light.primary,
  },
});
