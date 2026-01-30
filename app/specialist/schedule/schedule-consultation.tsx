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
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FormInput,
  FormDropdown,
  CalendarModal,
} from '../../../components/specialist/FormComponents';
import { CheckboxGroup } from '../../../components/specialist/ScheduleComponents';

export default function ScheduleConsultationScreen() {
  const router = useRouter();

  // Form State
  const [availabilityType, setAvailabilityType] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const [dates, setDates] = useState('');
  const [times, setTimes] = useState('');
  const [consultsPerDay, setConsultsPerDay] = useState('');
  const [duration, setDuration] = useState('');
  const [consultType, setConsultType] = useState('');
  const [modes, setModes] = useState<string[]>([]);

  // UI State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleMode = (mode: string) => {
    if (mode === 'All') {
      setModes((prev) =>
        prev.includes('All') ? [] : ['All', 'Audio', 'Video', 'Chat'],
      );
      return;
    }
    setModes((prev) => {
      const newModes = prev.includes(mode)
        ? prev.filter((m) => m !== mode)
        : [...prev, mode];
      if (
        newModes.length === 3 &&
        !newModes.includes('All') &&
        ['Audio', 'Video', 'Chat'].every((m) => newModes.includes(m))
      ) {
        return ['All', 'Audio', 'Video', 'Chat'];
      }
      return newModes.filter((m) => m !== 'All');
    });
  };

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
        <Text style={styles.headerTitle}>Schedule Consultation</Text>
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
          <FormDropdown
            label="Availability Type"
            placeholder="Select type"
            value={availabilityType}
            options={['One-time', 'Recurring', 'Emergency']}
            onSelect={setAvailabilityType}
            isOpen={openDropdown === 'type'}
            onToggle={() => toggleDropdown('type')}
          />

          <CheckboxGroup
            label="Days Available"
            options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            selected={selectedDays}
            onToggle={toggleDay}
          />

          <FormDropdown
            label="Frequency"
            placeholder="e.g Repeat weekly"
            value={frequency}
            options={['Daily', 'Weekly', 'Bi-weekly', 'Monthly']}
            onSelect={setFrequency}
            isOpen={openDropdown === 'freq'}
            onToggle={() => toggleDropdown('freq')}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start and End date</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start and End Time</Text>
            <TouchableOpacity style={styles.dateSelector}>
              <Text style={[styles.dateText, !times && styles.placeholderText]}>
                {times || '00:00 AM/PM  -  00:00 AM/PM'}
              </Text>
              <CalendarIcon color="#8E8E93" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.dualRow}>
            <View style={{ flex: 1 }}>
              <FormDropdown
                label="Consultations per day"
                placeholder="Max 20"
                value={consultsPerDay}
                options={['5', '10', '15', '20', '30']}
                onSelect={setConsultsPerDay}
                isOpen={openDropdown === 'perday'}
                onToggle={() => toggleDropdown('perday')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormDropdown
                label="Duration"
                placeholder="e.g 20min"
                value={duration}
                options={['15 min', '20 min', '30 min', '45 min', '60 min']}
                onSelect={setDuration}
                isOpen={openDropdown === 'duration'}
                onToggle={() => toggleDropdown('duration')}
              />
            </View>
          </View>

          <FormDropdown
            label="Consultation Types"
            placeholder="e.g. Twice daily"
            value={consultType}
            options={['General', 'Follow-up', 'Emergency', 'Test Review']}
            onSelect={setConsultType}
            isOpen={openDropdown === 'consultType'}
            onToggle={() => toggleDropdown('consultType')}
          />

          <CheckboxGroup
            label="Mode of Consultation"
            options={['All', 'Audio', 'Video', 'Chat']}
            selected={modes}
            onToggle={toggleMode}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            console.log('Saving Schedule...');
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
});
