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
import { ChevronLeft, Smartphone } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phoneNumber, isSignup, userId, tempEmail, tempPassword } =
    useLocalSearchParams<{
      phoneNumber?: string;
      isSignup?: string;
      userId?: string;
      tempEmail?: string;
      tempPassword?: string;
    }>();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (phoneNumber) {
      setPhone(phoneNumber);
      setCodeSent(true);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (codeSent) {
      const timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent]);

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // For signup flow, use userId from params
      // For profile update flow, get user from session
      let currentUserId: string;

      if (isSignup === 'true' && userId) {
        currentUserId = userId;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to verify your phone');
          return;
        }
        currentUserId = user.id;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-phone-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            userId: currentUserId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send code. Please try again.');
        return;
      }

      setCodeSent(true);
      setResendTimer(45);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // For signup flow, use userId from params
      // For profile update flow, get user from session
      let currentUserId: string;

      if (isSignup === 'true' && userId) {
        currentUserId = userId;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to verify your phone');
          return;
        }
        currentUserId = user.id;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-phone-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            code: fullCode,
            userId: currentUserId,
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Handle direct session returned from Edge Function (The optimized flow)
      if (responseData.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: responseData.session.access_token,
          refresh_token: responseData.session.refresh_token,
        });

        if (sessionError) {
          setError(
            'Verification successful, but failed to start session. Please log in.',
          );
          return;
        }

        // Navigate based on signup context
        if (isSignup === 'true') {
          router.replace('/select-role');
        } else {
          router.replace('/phone-success');
        }
        return;
      }

      // Legacy fallback (if edge function doesn't return session)
      if (isSignup === 'true') {
        // If we have temp credentials, sign in the user
        if (tempEmail && tempPassword) {
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: tempEmail,
              password: tempPassword,
            },
          );

          if (signInError) {
            setError(
              'Phone verified but could not sign in. Please try logging in manually.',
            );
            return;
          }
        }

        // Verify the user is now authenticated
        const {
          data: { user: authenticatedUser },
        } = await supabase.auth.getUser();
        if (!authenticatedUser) {
          setError(
            'Phone verified but session could not be established. Please try logging in.',
          );
          return;
        }

        router.replace('/select-role');
      } else {
        router.replace('/phone-success');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
    await handleSendCode();
  };

  if (!codeSent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isSignup === 'true' ? 'Verify phone number' : 'Verify Phone'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Smartphone size={32} color="#0EA5E9" />
          </View>

          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.description}>
            We'll send you a verification code to confirm your phone number.
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.hint}>
            Include country code (e.g., +1 for US, +234 for Nigeria)
          </Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="+1234567890"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              phone.length >= 10 && styles.sendButtonActive,
            ]}
            onPress={handleSendCode}
            disabled={loading || phone.length < 10}
          >
            {loading ? (
              <ActivityIndicator color="#9CA3AF" />
            ) : (
              <Text
                style={[
                  styles.sendButtonText,
                  phone.length >= 10 && styles.sendButtonTextActive,
                ]}
              >
                Send Code
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isSignup === 'true' ? 'Verify phone number' : 'Verify Phone'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Smartphone size={32} color="#0EA5E9" />
          <View style={styles.codeIcon}>
            <Text style={styles.codeIconText}>* * *</Text>
          </View>
        </View>

        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.description}>
          We've sent a 6-digit code to <Text style={styles.phone}>{phone}</Text>
          {'\n'}Enter it below to continue.
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
            Didn't get the code?{' '}
            {resendTimer > 0 ? (
              <Text style={styles.resendLinkDisabled}>
                Resend in{' '}
                {String(Math.floor(resendTimer / 60)).padStart(2, '0')}:
                {String(resendTimer % 60).padStart(2, '0')}
              </Text>
            ) : (
              <Text style={styles.resendLink}>Resend Code</Text>
            )}
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
  phone: {
    fontWeight: '600',
    color: '#111827',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F9FAFB',
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
    width: 48,
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
  sendButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  sendButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextActive: {
    color: '#FFFFFF',
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
