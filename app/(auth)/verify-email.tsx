import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Handle paste - if multiple characters are entered
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6);
      const newCode = [...code];

      // Fill boxes with pasted digits
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }

      setCode(newCode);

      // Focus the last filled box or the next empty one
      const nextEmptyIndex = newCode.findIndex((d) => d === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (digits.length === 6) {
        inputRefs.current[5]?.focus();
        verifyCode(newCode.join(''));
      }

      return;
    }

    // Handle single character input
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && newCode.length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: fullCode,
        type: 'email',
      });

      if (error) {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.session) {
        // Update registration tracking
        try {
          await supabase.from('registration_tracking').upsert(
            {
              email: email,
              status: 'verified',
              current_step: 'completed',
              user_id: data.session.user.id,
            },
            { onConflict: 'email' },
          );
        } catch (e) {
          console.warn(e);
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (
          profile?.role === 'specialist' ||
          profile?.role === 'public_health'
        ) {
          router.replace('/specialist/onboarding/specialist/personal-info');
        } else if (profile?.role === 'sponsor') {
          router.replace({
            pathname: '/patient/user-details',
            params: { role: 'sponsor' },
          });
        } else if (profile?.role === 'service_user') {
          router.replace({
            pathname: '/patient/user-details',
            params: { role: 'service_user' },
          });
        } else {
          router.replace('/patient/email-success');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendTimer(45);
    setError('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError('Failed to resend code. Please try again.');
        console.error('Resend error', error);
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
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
        <Text style={styles.headerTitle}>Verify Email</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={32} color="#0EA5E9" />
          <View style={styles.codeIcon}>
            <Text style={styles.codeIconText}>* * *</Text>
          </View>
        </View>

        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.description}>
          We've sent a code to <Text style={styles.email}>{email}</Text>
          {'\n'}Enter it below to verify your email.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            code.every((d) => d !== '') && styles.verifyButtonActive,
          ]}
          onPress={handleVerify}
          disabled={loading || !code.every((d) => d !== '')}
        >
          {loading ? (
            <ActivityIndicator color="#9CA3AF" />
          ) : (
            <Text
              style={[
                styles.verifyButtonText,
                code.every((d) => d !== '') && styles.verifyButtonTextActive,
              ]}
            >
              Verify code
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0}
          style={styles.resendContainer}
        >
          <Text style={styles.resendText}>
            Didn't get the email?{' '}
            <Text
              style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled,
              ]}
            >
              Resend in {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:
              {String(resendTimer % 60).padStart(2, '0')}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  codeIcon: {
    marginTop: 8,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeIconText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: '#111827',
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 40,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  codeInputFilled: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  codeInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  verifyButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  verifyButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },
});
