import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  error?: string;
  isSuccess?: boolean;
  label?: string;
  rightIcon?: React.ReactNode;
}

export const Input = ({
  error,
  isSuccess,
  label,
  style,
  rightIcon,
  ...props
}: InputProps) => {
  let borderColor = 'transparent';
  let backgroundColor = Colors.light.inputBackground;

  if (error) {
    borderColor = Colors.light.error;
    backgroundColor = '#FFF0F0'; // Light red tint
  } else if (isSuccess) {
    borderColor = Colors.light.success;
    backgroundColor = '#F0FFF4'; // Light green tint
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
            borderWidth: error || isSuccess ? 1 : 0,
          },
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.light.textGray}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    height: '100%',
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.light.error,
    marginLeft: 4,
  },
});
