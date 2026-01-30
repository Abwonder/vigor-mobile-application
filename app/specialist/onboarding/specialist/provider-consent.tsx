import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Button } from '../../../../components/specialist/Button';
import { ProgressIndicator } from '../../../../components/specialist/ProgressIndicator';
import { ConsentCheckbox } from '../../../../components/specialist/ConsentCheckbox';

export default function ProviderConsentScreen() {
  const router = useRouter();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGoToDashboard = () => {
    if (agreedToTerms) {
      console.log('Onboarding complete! Navigate to dashboard');
      // TODO: Navigate to main app/dashboard
      router.replace('/specialist/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTintColor: Colors.light.text,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ProgressIndicator currentStep={4} totalSteps={4} />

          <Text style={styles.title}>Provider Informed Consent</Text>

          <Text style={styles.subtitle}>
            By joining Vigor, you confirm and agree that:
          </Text>

          <View style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                I confirm that the details I've shared about myself (bio,
                license, experience) are accurate, and that I'm a qualified
                healthcare professional authorized to provide care.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                I agree to use Vigor responsibly to deliver safe and
                confidential care, and I consent to my data being processed in
                line with the privacy policy.
              </Text>
            </View>
          </View>

          <ConsentCheckbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
          />
          <View style={styles.footer}>
            <Button
              title="Go to dashboard"
              onPress={handleGoToDashboard}
              disabled={!agreedToTerms}
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  bulletContainer: {
    marginBottom: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bullet: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
});
