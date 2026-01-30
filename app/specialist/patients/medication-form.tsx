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
import {
  ChevronLeft,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FormInput,
  FormDropdown,
  DualInput,
  CalendarModal,
} from '../../../components/specialist/FormComponents';

export default function MedicationFormScreen() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('Amoxicillin');
  const [form, setForm] = useState('');
  const [dosage, setDosage] = useState('500');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [dates, setDates] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('Days');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');

  // UI State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isFormValid =
    name && form && dosage && dosageUnit && dates && duration && frequency;

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
        <Text style={styles.headerTitle}>Medication</Text>
        <TouchableOpacity style={styles.plusButton}>
          <Plus color="#1C1C1E" size={24} />
        </TouchableOpacity>
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
            label="Medication Name"
            placeholder="e.g. Amoxicillin"
            value={name}
            onChangeText={setName}
          />

          <FormDropdown
            label="Form / Route"
            placeholder="Select form"
            value={form}
            options={[
              'Tablet',
              'Capsule',
              'Syrup',
              'Injection',
              'Topical',
              'Inhaler',
            ]}
            onSelect={setForm}
            isOpen={openDropdown === 'form'}
            onToggle={() => toggleDropdown('form')}
          />

          <DualInput
            label="Dosage Strength"
            leftValue={dosage}
            leftPlaceholder="e.g. 500"
            onLeftChange={setDosage}
            rightValue={dosageUnit}
            rightPlaceholder="mg"
            rightOptions={['mg', 'g', 'mcg', 'mL', 'IU', '%', 'drops', 'puffs']}
            onRightSelect={setDosageUnit}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start and end date</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setIsCalendarVisible(true)}
            >
              <Text style={[styles.dateText, !dates && styles.placeholderText]}>
                {dates || 'DD / MM / YYYY  -  DD / MM / YYYY'}
              </Text>
              <CalendarIcon color="#8E8E93" size={20} />
            </TouchableOpacity>
          </View>

          <DualInput
            label="Duration"
            leftValue={duration}
            leftPlaceholder="e.g. 7"
            onLeftChange={setDuration}
            rightValue={durationUnit}
            rightPlaceholder="Days"
            rightOptions={['Days', 'Weeks', 'Months', 'Indeterminate']}
            onRightSelect={setDurationUnit}
          />

          <FormDropdown
            label="Frequency"
            placeholder="e.g. Twice daily"
            value={frequency}
            options={[
              'Once daily',
              'Twice daily',
              'Three times daily',
              'Four times daily',
              'Every 6 hours',
              'Every 8 hours',
              'Every 12 hours',
            ]}
            onSelect={setFrequency}
            isOpen={openDropdown === 'frequency'}
            onToggle={() => toggleDropdown('frequency')}
          />

          <FormInput
            label="Instructions / Notes"
            placeholder="e.g. Take after meals, with a glass of water"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Button */}
      <View style={styles.footer}>
        {isFormValid ? (
          <TouchableOpacity
            onPress={() => {
              console.log('Saving Update...');
              router.back();
            }}
          >
            <LinearGradient
              colors={['#00C6FF', '#0072FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Save Update</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.disabledButton}
            onPress={() => {
              // Mocking range selection for demo
              setDates('17/09/2025 - 23/09/2025');
              setDuration('7');
              setForm('Tablet');
              setFrequency('Twice daily');
            }}
          >
            <Text style={styles.disabledButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => {
          setIsCalendarVisible(false);
          setDates('17/09/2025 - 23/09/2025');
        }}
      />
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
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#C7C7CC',
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
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
});
