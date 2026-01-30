import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ConsentCheckbox = ({
  checked,
  onChange,
}: ConsentCheckboxProps) => {
  const handleProviderTermsPress = () => {
    // TODO: Open provider terms
    console.log('Open provider terms');
  };

  const handlePrivacyPolicyPress = () => {
    // TODO: Open privacy policy
    console.log('Open privacy policy');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={16} color="#fff" strokeWidth={3} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          I confirm my details are accurate, that I am authorized to provide
          care, and I agree to Vigor's{' '}
          <Text
            style={styles.link}
            onPress={(e) => {
              e.stopPropagation();
              handleProviderTermsPress();
            }}
          >
            Provider terms
          </Text>
          , and{' '}
          <Text
            style={styles.link}
            onPress={(e) => {
              e.stopPropagation();
              handlePrivacyPolicyPress();
            }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  link: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
