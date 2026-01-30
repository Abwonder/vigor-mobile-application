import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface CodeInputProps {
  code: string[];
  onCodeChange: (code: string[]) => void;
  length?: number;
}

export const CodeInput = ({
  code,
  onCodeChange,
  length = 6,
}: CodeInputProps) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.slice(-1);

    if (!/^\d*$/.test(digit)) return; // Only numbers

    const newCode = [...code];
    newCode[index] = digit;
    onCodeChange(newCode);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.input, code[index] && styles.inputFilled]}
          value={code[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 24,
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F9F9F9',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  inputFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: '#fff',
  },
});
