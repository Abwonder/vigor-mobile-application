import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface GenderRadioGroupProps {
  value: 'male' | 'female' | 'not-say' | null;
  onChange: (value: 'male' | 'female' | 'not-say') => void;
}

export const GenderRadioGroup = ({
  value,
  onChange,
}: GenderRadioGroupProps) => {
  const options = [
    { label: 'Male', value: 'male' as const },
    { label: 'Female', value: 'female' as const },
    { label: 'Rather not say', value: 'not-say' as const },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            value === option.value && styles.optionSelected,
          ]}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.radio,
              value === option.value && styles.radioSelected,
            ]}
          >
            {value === option.value && (
              <Check size={14} color="#fff" strokeWidth={3} />
            )}
          </View>
          <Text
            style={[
              styles.label,
              value === option.value && styles.labelSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    gap: 8,
  },
  optionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#E6F3FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.textGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
  },
  labelSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
