import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { Input } from '../../../components/specialist/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

const VALID_CODE = 'SPN-002349';

export default function AccessCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Reset states when code changes
    if (code.length === 0) {
      setError(undefined);
      setIsSuccess(false);
      return;
    }

    // Auto-validate logic (simulated)
    // Real app would likely wait for button press or debounce this
    if (code === VALID_CODE) {
      setIsSuccess(true);
      setError(undefined);
    } else if (code.length >= VALID_CODE.length && code !== VALID_CODE) {
      // Only show error if length matches/exceeds to avoid annoying typing errors
      // OR if the user deliberately typed something else.
      // For this demo, we'll clear success if it doesn't match
      setIsSuccess(false);
    }
  }, [code]);

  const handleValidation = () => {
    if (code === VALID_CODE) {
      setIsSuccess(true);
      setError(undefined);
      console.log('Navigate to Create Account');
      router.push('/specialist/auth/create-account');
    } else {
      setError(
        "Invalid code. Make sure you're entering the invite code we shared with you.",
      );
      setIsSuccess(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Access code',
          headerTitleAlign: 'center', // Centers the title
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.light.text,
          },
          headerShadowVisible: false,
          headerTintColor: Colors.light.text,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Lock size={48} color={Colors.light.primary} />
            {/* Dots decoration placeholder underneath if needed, usually SVG */}
            <View style={styles.dotsDecoration}>
              <View
                style={[styles.dot, { backgroundColor: Colors.light.primary }]}
              />
              <View
                style={[styles.dot, { backgroundColor: Colors.light.primary }]}
              />
              <View
                style={[styles.dot, { backgroundColor: Colors.light.primary }]}
              />
              <View
                style={[styles.dot, { backgroundColor: Colors.light.primary }]}
              />
              <View
                style={[styles.dot, { backgroundColor: Colors.light.primary }]}
              />
            </View>
          </View>

          <Text style={styles.title}>Enter Your Access Code</Text>
          <Text style={styles.subtitle}>
            Use the code you received from the VIGOR team to activate your
            account.
          </Text>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Access Code"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError(undefined); // Clear error on type
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              error={error}
              isSuccess={isSuccess}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleValidation}
            disabled={code.length === 0}
            variant="primary"
          />

          <TouchableOpacity
            style={styles.supportLink}
            onPress={() => {
              Alert.alert(
                'Contact Support',
                'Please email support@vigorcare.com or call +1 (555) 123-4567 for assistance with your access code.',
                [{ text: 'OK' }],
              );
            }}
          >
            <Text style={styles.supportText}>
              Didn't get a code? Contact support
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
    // Aligning left as per screenshot design (typically left aligned or centered depending on exact variant, screenshot shows left)
    alignItems: 'flex-start',
  },
  dotsDecoration: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textGray,
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  supportLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  supportText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
