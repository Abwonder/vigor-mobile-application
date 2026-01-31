import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { CodeInput } from '../../../components/specialist/CodeInput';
import { supabase } from '../../../lib/supabase';

const TIMER_DURATION = 45; // seconds

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email || '',
        token: enteredCode,
        type: 'email',
      });

      if (error) {
        Alert.alert('Verification Failed', 'Invalid code. Please try again.');
        setCode(Array(6).fill(''));
        return;
      }

      if (data.session) {
        // Update tracking
        await supabase.from('registration_tracking').upsert(
          {
            email: email,
            status: 'verified',
            current_step: 'completed',
            user_id: data.session.user.id,
          },
          { onConflict: 'email' },
        );

        router.push('/specialist/auth/email-verified');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (canResend && email) {
      setCode(Array(6).fill(''));
      setCanResend(false);
      setTimer(TIMER_DURATION);

      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });

        if (error) {
          Alert.alert('Error', 'Failed to resend code');
        } else {
          Alert.alert('Sent', 'Verification code resent successfully');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Verify Email',
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

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.mailIcon}>
            <Mail size={32} color="#fff" />
          </View>
          {/* Decorative dots */}
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
          </View>
        </View>

        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.subtitle}>
          We've sent a code to <Text style={styles.email}>{email}</Text>
          {'\n'}Enter it below to verify your email.
        </Text>

        <CodeInput code={code} onCodeChange={setCode} />

        <Button
          title={loading ? 'Verifying...' : 'Verify code'}
          onPress={handleVerify}
          disabled={!isCodeComplete || loading}
          variant="primary"
        />

        <TouchableOpacity
          style={styles.resendLink}
          onPress={handleResend}
          disabled={!canResend}
        >
          <Text
            style={[styles.resendText, !canResend && styles.resendTextDisabled]}
          >
            Didn't get the email?{' '}
            {canResend ? (
              <Text style={styles.resendTextBold}>Resend Code</Text>
            ) : (
              `Resend in ${formatTime(timer)}`
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  mailIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dotsDecoration: {
    flexDirection: 'row',
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
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  email: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  resendLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: Colors.light.textGray,
  },
  resendTextBold: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
