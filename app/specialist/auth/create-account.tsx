import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { Input } from '../../../components/specialist/Input';
import { GoogleButton } from '../../../components/specialist/GoogleButton';
import { PasswordRequirements } from '../../../components/specialist/PasswordRequirements';

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const isPasswordValid =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[\d!@#$%^&*(),.?":{}|<>]/.test(password);

  const isFormValid =
    email.length > 0 && isPasswordValid && password === confirmPassword;

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
    // TODO: Implement Google OAuth
  };

  const handleCreateAccount = () => {
    if (isFormValid) {
      console.log('Creating account with:', email);
      // TODO: Implement account creation
      router.push('/specialist/auth/verify-email');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile setup',
          headerTitleAlign: 'center',
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Create your professional profile with your information, expertise,
              and credentials
            </Text>

            <GoogleButton onPress={handleGoogleSignIn} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone or Email</Text>
              <Input
                placeholder="Enter your preferred info"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New password</Text>
              <Input
                placeholder="e.g. MySecurePass123!"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.light.textGray} />
                    ) : (
                      <Eye size={20} color={Colors.light.textGray} />
                    )}
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm new password</Text>
              <Input
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                error={
                  confirmPassword.length > 0 &&
                  !password.startsWith(confirmPassword)
                    ? 'Passwords do not match'
                    : undefined
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={Colors.light.textGray} />
                    ) : (
                      <Eye size={20} color={Colors.light.textGray} />
                    )}
                  </TouchableOpacity>
                }
              />
            </View>

            <PasswordRequirements password={password} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Create Account"
            onPress={handleCreateAccount}
            disabled={!isFormValid}
            variant="primary"
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => console.log('Navigate to Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextBold}>Log In</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 14,
    color: Colors.light.textGray,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.light.background,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  loginTextBold: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
