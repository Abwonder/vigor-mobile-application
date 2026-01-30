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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');

      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          setError(
            'Google sign-in is not configured. Please check GOOGLE_OAUTH_SETUP.md for instructions.',
          );
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        setGoogleLoading(true);

        const redirectUrl = Linking.createURL('/(tabs)');

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: false,
          },
        });

        if (error) {
          setError(error.message);
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
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                const { data: profile } = await supabase
                  .from('user_profiles')
                  .select('role')
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (profile?.role) {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/select-role');
                }
              }
            }
          }
          setGoogleLoading(false);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  const isPhoneNumber = (input: string) => {
    const phoneRegex = /^[+\d\s()-]+$/;
    return phoneRegex.test(input) && input.replace(/\D/g, '').length >= 10;
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let email = emailOrPhone.trim();

      if (isPhoneNumber(emailOrPhone)) {
        const cleanPhone = emailOrPhone.replace(/\D/g, '');

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (profileError || !profile) {
          setError('No account found with this phone number');
          setLoading(false);
          return;
        }

        if (!profile.email) {
          setError('Unable to login with phone number');
          setLoading(false);
          return;
        }

        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        // Fetch role to redirect correctly
        const { data: profile, error: roleError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (roleError || !profile?.role) {
          // Fallback to role selection if no role found
          router.replace('/select-role');
          return;
        }

        // Dashboard redirection logic
        if (profile.role === 'specialist' || profile.role === 'public_health') {
          router.replace('/specialist');
        } else if (profile.role === 'sponsor') {
          // If there's a specific /sponsor dashboard, use it, otherwise /(tabs) for now
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome back</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Log in to access your health dashboard or manage care for others.
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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Phone or Email</Text>
        <TextInput
          style={[styles.input, isEmailFocused && styles.inputFocused]}
          placeholder="Sonya.layer99.design"
          placeholderTextColor="#9CA3AF"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          autoCapitalize="none"
          keyboardType="default"
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />

        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.passwordContainer,
            isPasswordFocused && styles.passwordContainerFocused,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New to VigorCare? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Create an account</Text>
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
    fontSize: 17,
    color: '#9CA3AF',
    marginLeft: 80,
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
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
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
    borderColor: '#E5E7EB',
    outlineStyle: 'none',
  },
  inputFocused: {
    borderColor: '#0EA5E9',
    borderWidth: 2,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordContainerFocused: {
    borderColor: '#0EA5E9',
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    outlineStyle: 'none',
  },
  eyeButton: {
    padding: 4,
  },
  forgotButton: {
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  loginButton: {
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
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  signupText: {
    fontSize: 15,
    color: '#6B7280',
  },
  signupLink: {
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
