import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { CodeInput } from '../../../components/specialist/CodeInput';

const VALID_CODE = '448459'; // Demo code
const TIMER_DURATION = 45; // seconds

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);

  // Email from previous screen (in real app, would come from route params or state)
  const email = 'Ameliahart@email.com';

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

  const handleVerify = () => {
    const enteredCode = code.join('');
    if (enteredCode === VALID_CODE) {
      console.log('Code verified!');
      router.push('/specialist/auth/email-verified');
    } else {
      console.log('Invalid code');
      // TODO: Show error
    }
  };

  const handleResend = () => {
    if (canResend) {
      console.log('Resending code...');
      setTimer(TIMER_DURATION);
      setCanResend(false);
      setCode(Array(6).fill(''));
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
          title="Verify code"
          onPress={handleVerify}
          disabled={!isCodeComplete}
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
