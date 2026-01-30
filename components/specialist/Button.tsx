import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary
    ? disabled
      ? '#A0D1F5' // Faded blue for disabled state
      : Colors.light.primary
    : 'transparent';

  const textColor = isPrimary ? '#fff' : Colors.light.primary;
  const borderColor = isPrimary ? 'transparent' : Colors.light.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor, borderColor, borderWidth: isPrimary ? 0 : 1 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25, // Fully rounded pills as per Vigor design
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
