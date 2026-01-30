import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { RadioOption } from '../../../components/specialist/RadioOption';

type UserType = 'specialist' | 'public-health' | null;

export default function SelectUserTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleNext = () => {
    if (selectedType === 'specialist') {
      router.push('/onboarding/specialist/professional-details');
    } else if (selectedType === 'public-health') {
      // TODO: Navigate to public health flow
      console.log('Public Health flow not implemented yet');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Select user type',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.light.textGray,
          },
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
          <Text style={styles.title}>
            How should we set up your provider account?
          </Text>

          <View style={styles.optionsContainer}>
            <RadioOption
              title="Specialist"
              description="Advanced consultations and treatment."
              selected={selectedType === 'specialist'}
              onPress={() => setSelectedType('specialist')}
            />

            <RadioOption
              title="Public Health Professional"
              description="First-level care & assessments."
              selected={selectedType === 'public-health'}
              onPress={() => setSelectedType('public-health')}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedType === null}
          variant="primary"
        />
      </View>
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
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.light.background,
  },
});
