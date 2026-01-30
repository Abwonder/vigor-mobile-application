import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Button } from '../../../../components/specialist/Button';
import { Input } from '../../../../components/specialist/Input';
import { Dropdown } from '../../../../components/specialist/Dropdown';
import { ProgressIndicator } from '../../../../components/specialist/ProgressIndicator';
import { supabase } from '../../../../lib/supabase';

export default function ProfessionalDetailsScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('specialist');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [credentials, setCredentials] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role) setUserRole(profile.role);
      }
    };
    fetchUserRole();
  }, []);

  const isPHP = userRole === 'public_health';

  const professionalTitles = isPHP
    ? [
        { label: 'Public Health Officer', value: 'public_health_officer' },
        { label: 'Epidemiologist', value: 'epidemiologist' },
        { label: 'Health Policy Analyst', value: 'health_policy_analyst' },
        {
          label: 'Community Health Specialist',
          value: 'community_health_specialist',
        },
      ]
    : [
        { label: 'Doctor', value: 'doctor' },
        { label: 'Nurse', value: 'nurse' },
        { label: 'Therapist', value: 'therapist' },
        { label: 'Pharmacist', value: 'pharmacist' },
        { label: 'Physiotherapist', value: 'physiotherapist' },
      ];

  const specialties = isPHP
    ? [
        { label: 'Epidemiology', value: 'epidemiology' },
        { label: 'Health Policy', value: 'health_policy' },
        { label: 'Community Medicine', value: 'community_medicine' },
        { label: 'Biostatistics', value: 'biostatistics' },
        { label: 'Environmental Health', value: 'environmental_health' },
        { label: 'Global Health', value: 'global_health' },
      ]
    : [
        { label: 'Cardiology', value: 'cardiology' },
        { label: 'General Practice', value: 'general-practice' },
        { label: 'Pediatrics', value: 'pediatrics' },
        { label: 'Dermatology', value: 'dermatology' },
        { label: 'Psychiatry', value: 'psychiatry' },
        { label: 'Orthopedics', value: 'orthopedics' },
      ];

  const isFormValid =
    professionalTitle.length > 0 &&
    specialty.length > 0 &&
    credentials.length > 0 &&
    licenseNumber.length > 0 &&
    yearsOfExperience.length > 0;

  const handleNext = () => {
    if (isFormValid) {
      console.log('Professional details:', {
        professionalTitle,
        specialty,
        credentials,
        licenseNumber,
        yearsOfExperience,
      });
      router.push('/specialist/onboarding/specialist/personal-info');
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
            <ProgressIndicator currentStep={1} totalSteps={2} />

            <Text style={styles.title}>
              Your professional details,{' '}
              <Text style={styles.titleGray}>
                {isPHP
                  ? 'this helps build trust in your public health expertise.'
                  : 'this helps patients and sponsors trust your expertise.'}
              </Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Professional title</Text>
              <Dropdown
                placeholder="doctor, nurse, therapist..."
                value={professionalTitle}
                options={professionalTitles}
                onValueChange={setProfessionalTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Specialty</Text>
              <Dropdown
                placeholder="e.g. cardiology, general practice"
                value={specialty}
                options={specialties}
                onValueChange={setSpecialty}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {isPHP ? 'Public Health Degree' : 'Credentials'}
              </Text>
              <Input
                placeholder={
                  isPHP ? 'e.g. MPH, DrPH, MSc' : 'e.g. MBBS, FWACP, PhD'
                }
                value={credentials}
                onChangeText={setCredentials}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {isPHP
                  ? 'Public Health License Number'
                  : 'Medical License Number'}
              </Text>
              <Input
                placeholder={isPHP ? 'PH License ID' : 'License ID'}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Years of experience</Text>
              <Input
                placeholder="e.g. 8"
                value={yearsOfExperience}
                onChangeText={setYearsOfExperience}
                keyboardType="number-pad"
              />
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
  footer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
});
