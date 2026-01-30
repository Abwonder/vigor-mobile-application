import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Button } from '../../../../components/specialist/Button';
import { Input } from '../../../../components/specialist/Input';
import { Dropdown } from '../../../../components/specialist/Dropdown';
import { ProgressIndicator } from '../../../../components/specialist/ProgressIndicator';
import { GenderRadioGroup } from '../../../../components/specialist/GenderRadioGroup';

import { Country, State } from 'country-state-city';
import { useEffect } from 'react';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'not-say' | null>(
    null,
  );
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');

  // Get all countries from library
  const countries = Country.getAllCountries().map((country) => ({
    label: country.name,
    value: country.isoCode,
  }));

  // Get states based on selected country
  const states = country
    ? State.getStatesOfCountry(country).map((state) => ({
        label: state.name,
        value: state.isoCode,
      }))
    : [];

  useEffect(() => {
    // Auto-detect country based on IP
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          setCountry(data.country_code);
        }
      } catch (error) {
        console.log('Error detecting country:', error);
      }
    };

    detectCountry();
  }, []);

  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1).padStart(2, '0'),
  }));

  const years = Array.from({ length: 100 }, (_, i) => ({
    label: String(2024 - i),
    value: String(2024 - i),
  }));

  const isFormValid =
    firstName.length > 0 &&
    lastName.length > 0 &&
    birthMonth.length > 0 &&
    birthDay.length > 0 &&
    birthYear.length > 0 &&
    gender !== null &&
    country.length > 0 &&
    state.length > 0;

  const handleNext = () => {
    if (isFormValid) {
      console.log('Personal info:', {
        firstName,
        lastName,
        dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        country,
        state,
      });
      router.push('/specialist/onboarding/specialist/add-photo');
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
            <ProgressIndicator currentStep={2} totalSteps={2} />

            <Text style={styles.title}>
              Tell us about yourself,{' '}
              <Text style={styles.titleGray}>
                we'll use this to set up your provider profile.
              </Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <Input
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <Input
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Dropdown
                    placeholder="Month"
                    value={birthMonth}
                    options={months}
                    onValueChange={setBirthMonth}
                  />
                </View>
                <View style={styles.dateFieldSmall}>
                  <Dropdown
                    placeholder="Day"
                    value={birthDay}
                    options={days}
                    onValueChange={setBirthDay}
                  />
                </View>
                <View style={styles.dateFieldSmall}>
                  <Dropdown
                    placeholder="Year"
                    value={birthYear}
                    options={years}
                    onValueChange={setBirthYear}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <GenderRadioGroup value={gender} onChange={setGender} />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Country of Residence</Text>
                <Dropdown
                  placeholder="Select country"
                  value={country}
                  options={countries}
                  onValueChange={(val) => {
                    setCountry(val);
                    setState(''); // Reset state when country changes
                  }}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>State</Text>
                <Dropdown
                  placeholder="Select state"
                  value={state}
                  options={states}
                  onValueChange={setState}
                />
              </View>
            </View>
            <View style={styles.footer}>
              <Button
                title="Next"
                onPress={handleNext}
                disabled={!isFormValid}
                variant="primary"
              />
            </View>
          </View>
        </ScrollView>
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
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 32,
    lineHeight: 28,
  },
  titleGray: {
    fontWeight: 'normal',
    color: Colors.light.textGray,
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
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateField: {
    flex: 2,
  },
  dateFieldSmall: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
});
