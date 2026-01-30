import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FormInput,
  FormDropdown,
} from '../../../components/specialist/FormComponents';

export default function EditProfileScreen() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState('Sonya');
  const [lastName, setLastName] = useState('Queen');
  const [gender, setGender] = useState('Female');
  const [email, setEmail] = useState('sonyaqueen@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('08063904219');

  // DOB State
  const [birthMonth, setBirthMonth] = useState('February');
  const [birthDay, setBirthDay] = useState('12');
  const [birthYear, setBirthYear] = useState('1964');

  // Location State
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');

  // UI State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isFormValid =
    firstName &&
    lastName &&
    gender &&
    email &&
    phoneNumber &&
    birthMonth &&
    birthDay &&
    birthYear &&
    country &&
    state;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FormInput
            label="First Name"
            placeholder="Sonya"
            value={firstName}
            onChangeText={setFirstName}
          />

          <FormInput
            label="Last Name"
            placeholder="Queen"
            value={lastName}
            onChangeText={setLastName}
          />

          <FormDropdown
            label="Gender"
            placeholder="Select gender"
            value={gender}
            options={['Male', 'Female', 'Other']}
            onSelect={setGender}
            isOpen={openDropdown === 'gender'}
            onToggle={() => toggleDropdown('gender')}
          />

          <FormInput
            label="Email address"
            placeholder="sonyaqueen@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <FormInput
            label="Phone number"
            placeholder="08063904219"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {/* Date of Birth Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dobRow}>
              <TouchableOpacity
                style={styles.dobSelector}
                onPress={() => toggleDropdown('month')}
              >
                <Text style={styles.dobValue}>{birthMonth}</Text>
                <ChevronDown color="#8E8E93" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dobSelector}
                onPress={() => toggleDropdown('day')}
              >
                <Text style={styles.dobValue}>{birthDay}</Text>
                <ChevronDown color="#8E8E93" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dobSelector}
                onPress={() => toggleDropdown('year')}
              >
                <Text style={styles.dobValue}>{birthYear}</Text>
                <ChevronDown color="#8E8E93" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Country and State Section */}
          <View style={styles.dualRow}>
            <View style={{ flex: 1.2 }}>
              <FormDropdown
                label="Country of Residence"
                placeholder="Select country"
                value={country}
                options={['Nigeria', 'Ghana', 'Kenya', 'South Africa']}
                onSelect={setCountry}
                isOpen={openDropdown === 'country'}
                onToggle={() => toggleDropdown('country')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormDropdown
                label="State"
                placeholder="Select state"
                value={state}
                options={['Lagos', 'Abuja', 'Kano', 'Oyo']}
                onSelect={setState}
                isOpen={openDropdown === 'state'}
                onToggle={() => toggleDropdown('state')}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Button */}
      <View style={styles.footer}>
        {isFormValid ? (
          <TouchableOpacity
            onPress={() => {
              console.log('Saving Profile...');
              router.back();
            }}
          >
            <LinearGradient
              colors={['#00C6FF', '#0072FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledButton}>
            <Text style={styles.disabledButtonText}>Save Changes</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48484A',
    marginBottom: 8,
  },
  dobRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dobSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dobValue: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  dualRow: {
    flexDirection: 'row',
    gap: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    color: '#C7C7CC',
    fontSize: 16,
    fontWeight: '600',
  },
});
