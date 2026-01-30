import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';

export default function EmailVerifiedScreen() {
  const router = useRouter();

  const handleContinue = () => {
    console.log('Continue to onboarding');
    router.push('/specialist/onboarding/select-user-type');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.successBadge}>
            <BadgeCheck
              size={64}
              color={Colors.light.success}
              strokeWidth={2}
            />
          </View>
        </View>

        <Text style={styles.title}>Email verified successfully</Text>
        <Text style={styles.subtitle}>
          You're all set. Let's complete your account to get started with
          VigorCare.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} variant="primary" />
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
    paddingTop: 80,
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginBottom: 32,
  },
  successBadge: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
