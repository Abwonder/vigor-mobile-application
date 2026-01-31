import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

function GoogleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.1713 8.36788H17.5001V8.33329H10.0001V11.6666H14.7096C14.0225 13.6069 12.1763 15 10.0001 15C7.23882 15 5.00007 12.7612 5.00007 9.99996C5.00007 7.23871 7.23882 4.99996 10.0001 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1859 2.52204 12.1951 1.66663 10.0001 1.66663C5.39799 1.66663 1.66675 5.39788 1.66675 9.99996C1.66675 14.602 5.39799 18.3333 10.0001 18.3333C14.6022 18.3333 18.3334 14.602 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36788Z"
        fill="#FFC107"
      />
      <Path
        d="M2.6275 6.12121L5.36542 8.12913C6.10625 6.29496 7.90042 4.99996 10.0004 4.99996C11.2750 4.99996 12.4346 5.48079 13.3175 6.26621L15.6746 3.90913C14.1862 2.52204 12.1954 1.66663 10.0004 1.66663C6.79917 1.66663 4.02334 3.47371 2.6275 6.12121Z"
        fill="#FF3D00"
      />
      <Path
        d="M10.0001 18.3333C12.1526 18.3333 14.1088 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0864 15.0008 10.0001 15C7.83257 15 5.99215 13.6179 5.29882 11.6891L2.58215 13.783C3.96049 16.4816 6.76132 18.3333 10.0001 18.3333Z"
        fill="#4CAF50"
      />
      <Path
        d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3355 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z"
        fill="#1976D2"
      />
    </Svg>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const [signupMode, setSignupMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Clean inputs
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Update tracking
  const updateRegistrationTracking = async (
    field: 'email' | 'phone',
    value: string,
    status: string,
    step: string,
    userId?: string,
  ) => {
    try {
      await supabase.from('registration_tracking').upsert(
        {
          [field]: value,
          user_type: role || 'service_user',
          status,
          current_step: step,
          user_id: userId,
          metadata: { last_attempt: new Date().toISOString() },
        },
        { onConflict: field },
      );
    } catch (e) {
      console.warn('Tracking update failed', e);
    }
  };

  const checkExistingUser = async () => {
    if (signupMode === 'email') {
      try {
        const { data: tracking } = await supabase
          .from('registration_tracking')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (tracking) {
          if (tracking.status === 'verified') {
            return { exists: true, verified: true };
          }
          return { exists: true, verified: false };
        }
      } catch (e) {}
    }
    return { exists: false, verified: false };
  };

  const handleGoogleSignIn = async () => {
    try {
      setErrors({});

      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          setErrors({
            general:
              'Google sign-in is not configured. Please check GOOGLE_OAUTH_SETUP.md for instructions.',
          });
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        setGoogleLoading(true);

        const redirectUrl = Linking.createURL('/select-role');

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: false,
          },
        });

        if (error) {
          setErrors({ general: error.message });
          setGoogleLoading(false);
          return;
        }

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl,
          );

          if (result.type === 'success' && result.url) {
            const url = result.url;
            const hashParams = url.split('#')[1];
            const searchParams = url.split('?')[1];
            const params = new URLSearchParams(hashParams || searchParams);

            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              const { data: session } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              if (session.user) {
                await updateRegistrationTracking(
                  'email',
                  session.user.email || '',
                  'verified',
                  'completed',
                  session.user.id,
                );
              }

              router.replace('/select-role');
            }
          }
          setGoogleLoading(false);
        }
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Google sign-in failed' });
      setGoogleLoading(false);
    }
  };

  const validatePassword = (pass: string) => {
    const errors: string[] = [];
    if (pass.length < 6) errors.push('At least 6 characters');
    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass))
      errors.push('Upper and lowercase characters');
    if (!/[0-9!@#$%^&*]/.test(pass))
      errors.push('At least one number or symbol');
    return errors;
  };

  const handlePhoneSignUp = async () => {
    setErrors({});

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({ password: passwordErrors.join(', ') });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = cleanPhone.startsWith('+')
        ? cleanPhone
        : `+${cleanPhone}`;

      // Track attempt
      await updateRegistrationTracking(
        'phone',
        formattedPhone,
        'pending',
        'signup',
      );

      // Create account with phone-based email using Gmail + addressing
      const sanitizedPhone = formattedPhone.replace(/[^0-9]/g, '');
      const tempEmail = `vigorcare+${sanitizedPhone}@gmail.com`;

      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: {
            phone: formattedPhone,
            signup_method: 'phone',
            role: role || 'service_user',
          },
        },
      });

      if (error) {
        // Check if duplicate
        if (error.message.includes('already registered')) {
          setErrors({
            general: 'This phone number is already registered. Please log in.',
          });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      if (data.user) {
        await updateRegistrationTracking(
          'phone',
          formattedPhone,
          'pending',
          'verification',
          data.user.id,
        );

        // Send OTP to phone
        const { error: otpError } = await supabase.functions.invoke(
          'send-phone-code',
          {
            body: { phoneNumber: formattedPhone, userId: data.user.id },
          },
        );

        if (otpError) {
          console.error('OTP Error', otpError);
        }

        // Navigate to phone verification
        router.push({
          pathname: '/verify-phone',
          params: {
            phoneNumber: formattedPhone,
            isSignup: 'true',
            userId: data.user.id,
            tempEmail: tempEmail,
            tempPassword: password,
          },
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'An error occurred during signup',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (signupMode === 'phone') {
      return handlePhoneSignUp();
    }

    setErrors({});

    if (!cleanEmail) {
      setErrors({ email: 'Email is required' });
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({ password: passwordErrors.join(', ') });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      // Track attempt
      await updateRegistrationTracking(
        'email',
        cleanEmail,
        'pending',
        'signup',
      );

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: {
            role: role || 'service_user',
          },
        },
      });

      if (error) {
        // Smart handling for existing users
        if (
          error.message &&
          (error.message.includes('already registered') ||
            error.message.includes('User already registered'))
        ) {
          // Check tracking status
          const { verified } = await checkExistingUser();

          if (verified) {
            Alert.alert(
              'Account Exists',
              'This email is already registered and verified. Please log in.',
              [
                { text: 'Log In', onPress: () => router.push('/login') },
                { text: 'Cancel', style: 'cancel' },
              ],
            );
          } else {
            Alert.alert(
              'Account Exists',
              'This email is registered but not verified. We will send a new code.',
              [
                {
                  text: 'Verify Now',
                  onPress: async () => {
                    // Resend OTP
                    const { error: resendError } = await supabase.auth.resend({
                      type: 'signup',
                      email: cleanEmail,
                    });

                    if (!resendError) {
                      router.push({
                        pathname: '/verify-email',
                        params: { email: cleanEmail },
                      });
                    } else {
                      setErrors({ general: resendError.message });
                    }
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ],
            );
          }
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      if (data.user) {
        await updateRegistrationTracking(
          'email',
          cleanEmail,
          'pending',
          'verification',
          data.user.id,
        );

        router.push({
          pathname: '/verify-email',
          params: { email: cleanEmail },
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'An error occurred during signup',
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidationChecks = [
    { text: 'At least 6 characters', valid: password.length >= 6 },
    {
      text: 'Upper and lowercase characters',
      valid: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      text: 'At least one number or symbol',
      valid: /[0-9!@#$%^&*]/.test(password),
    },
  ];

  const isFormValid =
    signupMode === 'email'
      ? email.trim().length > 0 &&
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9!@#$%^&*]/.test(password) &&
        password === confirmPassword
      : phone.trim().length >= 10 &&
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9!@#$%^&*]/.test(password) &&
        password === confirmPassword;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create an account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Start getting the care you or your loved one deserves.
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <GoogleIcon />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        <Text style={styles.label}>Phone or Email</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              signupMode === 'email' && styles.toggleButtonActive,
            ]}
            onPress={() => setSignupMode('email')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                signupMode === 'email' && styles.toggleButtonTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              signupMode === 'phone' && styles.toggleButtonActive,
            ]}
            onPress={() => setSignupMode('phone')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                signupMode === 'phone' && styles.toggleButtonTextActive,
              ]}
            >
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {signupMode === 'email' ? (
          <>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.hint}>
              Include country code (e.g., +1 for US, +234 for Nigeria)
            </Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="+1234567890"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </>
        )}

        <Text style={styles.label}>
          {signupMode === 'phone' ? 'Password' : 'New password'}
        </Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="e.g. MySecurePass123!"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <Text style={styles.label}>
          {signupMode === 'phone' ? 'Confirm password' : 'Confirm new password'}
        </Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm new password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <Text style={styles.mismatchText}>Passwords do not match</Text>
        )}

        <View style={styles.validationContainer}>
          {passwordValidationChecks.map((check, index) => (
            <View key={index} style={styles.validationRow}>
              <View
                style={[
                  styles.checkbox,
                  check.valid && password.length > 0 && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.validationText}>{check.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            isFormValid && styles.createButtonActive,
            loading && styles.createButtonDisabled,
          ]}
          onPress={handleSignUp}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.createButtonText,
                isFormValid && styles.createButtonTextActive,
              ]}
            >
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={googleLoading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModal}>
            <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <Path
                d="M20 40C20 50 25 55 35 58L45 42L35 22C25 25 20 30 20 40Z"
                fill="#00BCD4"
              />
              <Path
                d="M45 38L35 58C45 60 50 58 56 52C62 46 64 40 60 30L45 38Z"
                fill="#0EA5E9"
              />
            </Svg>
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 28,
  },
  googleButton: {
    backgroundColor: '#4B5563',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  mismatchText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 16,
    marginTop: -8,
  },
  validationContainer: {
    marginBottom: 24,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  validationText: {
    fontSize: 13,
    color: '#4B5563',
  },
  createButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    opacity: 0.6,
  },
  createButtonActive: {
    opacity: 1,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextActive: {
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
