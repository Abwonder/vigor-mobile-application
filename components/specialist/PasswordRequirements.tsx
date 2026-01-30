import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({
  password,
}: PasswordRequirementsProps) => {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      isValid: password.length >= 8,
    },
    {
      label: 'Upper and lowercase characters',
      isValid: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      label: 'At least one number or symbol',
      isValid: /[\d!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  return (
    <View style={styles.container}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirement}>
          <View style={[styles.checkbox, req.isValid && styles.checkboxValid]}>
            {req.isValid && <Check size={12} color="#fff" strokeWidth={3} />}
          </View>
          <Text style={styles.label}>{req.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.light.textGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxValid: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  label: {
    fontSize: 14,
    color: Colors.light.textGray,
  },
});
