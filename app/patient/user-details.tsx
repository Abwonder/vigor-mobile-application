import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const generateDays = () =>
  Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
};

export default function UserDetailsScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !month || !day || !year || !gender) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in first');
        return;
      }

      const monthIndex = months.indexOf(month) + 1;
      const dateOfBirth = `${year}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          gender: gender.toLowerCase(),
          role: role || 'service_user',
        })
        .eq('id', user.id);

      if (updateError) {
        setError('Failed to save details. Please try again.');
        return;
      }

      router.push({
        pathname: '/upload-photo',
        params: { role: role || 'service_user' },
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Just a few details to tailor your VigorCare experience from the start.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g Alex"
          placeholderTextColor="#9CA3AF"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g Sonya"
          placeholderTextColor="#9CA3AF"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Date of Birth</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={[styles.dateText, !month && styles.placeholderText]}>
              {month || 'Month'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDayPicker(!showDayPicker)}
          >
            <Text style={[styles.dateText, !day && styles.placeholderText]}>
              {day || 'Day'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowYearPicker(!showYearPicker)}
          >
            <Text style={[styles.dateText, !year && styles.placeholderText]}>
              {year || 'Year'}
            </Text>
          </TouchableOpacity>
        </View>

        {showMonthPicker && (
          <View style={styles.picker}>
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {months.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.pickerItem}
                  onPress={() => {
                    setMonth(m);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showDayPicker && (
          <View style={styles.picker}>
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {generateDays().map((d) => (
                <TouchableOpacity
                  key={d}
                  style={styles.pickerItem}
                  onPress={() => {
                    setDay(d);
                    setShowDayPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showYearPicker && (
          <View style={styles.picker}>
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {generateYears().map((y) => (
                <TouchableOpacity
                  key={y}
                  style={styles.pickerItem}
                  onPress={() => {
                    setYear(y);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Male' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('Male')}
          >
            <View
              style={[styles.radio, gender === 'Male' && styles.radioActive]}
            />
            <Text
              style={[
                styles.genderText,
                gender === 'Male' && styles.genderTextActive,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Female' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('Female')}
          >
            <View
              style={[styles.radio, gender === 'Female' && styles.radioActive]}
            />
            <Text
              style={[
                styles.genderText,
                gender === 'Female' && styles.genderTextActive,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Other' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('Other')}
          >
            <View
              style={[styles.radio, gender === 'Other' && styles.radioActive]}
            />
            <Text
              style={[
                styles.genderText,
                gender === 'Other' && styles.genderTextActive,
              ]}
            >
              Rather not say
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationColumn}>
            <Text style={styles.label}>Country of Residence</Text>
            <View style={styles.countryInput}>
              <Text style={styles.flag}>🇳🇬</Text>
              <Text style={styles.countryText}>Select coun...</Text>
            </View>
          </View>

          <View style={styles.locationColumn}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="Select state"
              placeholderTextColor="#9CA3AF"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            firstName &&
              lastName &&
              month &&
              day &&
              year &&
              gender &&
              styles.nextButtonActive,
          ]}
          onPress={handleSubmit}
          disabled={
            loading ||
            !firstName ||
            !lastName ||
            !month ||
            !day ||
            !year ||
            !gender
          }
        >
          {loading ? (
            <ActivityIndicator color="#9CA3AF" />
          ) : (
            <Text
              style={[
                styles.nextButtonText,
                firstName &&
                  lastName &&
                  month &&
                  day &&
                  year &&
                  gender &&
                  styles.nextButtonTextActive,
              ]}
            >
              Next
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '33%',
    backgroundColor: '#0EA5E9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 28,
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
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 15,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    maxHeight: 200,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#111827',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderButtonActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  radioActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#0EA5E9',
    borderWidth: 6,
  },
  genderText: {
    fontSize: 15,
    color: '#6B7280',
  },
  genderTextActive: {
    color: '#0EA5E9',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  locationColumn: {
    flex: 1,
  },
  countryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  nextButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  nextButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  nextButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
});
