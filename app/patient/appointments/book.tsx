import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  location: string;
}

interface TimeSlot {
  time: string;
  duration: number;
}

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { providerId, providerType } = useLocalSearchParams();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [consultationType, setConsultationType] = useState('');
  const [showConsultationTypes, setShowConsultationTypes] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState('');
  const [reason, setReason] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const consultationTypes = [
    'General Consultation',
    'Follow-up',
    'Prescription Renewal',
    'Test Review',
    'Specialist Consultation',
    'One-off Urgent Call',
  ];

  const timeSlots: TimeSlot[] = [
    { time: '10:30 am', duration: 25 },
    { time: '11:00 am', duration: 10 },
    { time: '2:00 pm', duration: 25 },
    { time: '3:00 pm', duration: 25 },
  ];

  const modes = [
    { value: 'video', label: 'Video Call' },
    { value: 'audio', label: 'Audio Call' },
    { value: 'chat', label: 'Chat' },
  ];

  useEffect(() => {
    loadProvider();
  }, [providerId, providerType]);

  const loadProvider = async () => {
    try {
      if (providerType === 'specialist') {
        const { data, error } = await supabase
          .from('specialists')
          .select('id, full_name, specialty')
          .eq('id', providerId)
          .single();

        if (error) throw error;
        if (data) {
          setProvider({
            id: data.id,
            name: `Dr. ${data.full_name}`,
            specialty: data.specialty,
            location: 'Abuja, Nigeria (WAT · GMT+1)',
          });
        }
      } else {
        const { data, error } = await supabase
          .from('nurses')
          .select('id, name, title')
          .eq('id', providerId)
          .single();

        if (error) throw error;
        if (data) {
          setProvider({
            id: data.id,
            name: `Nurse ${data.name}`,
            specialty: data.title,
            location: 'Abuja, Nigeria (WAT · GMT+1)',
          });
        }
      }
    } catch (error) {
      console.error('Error loading provider:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  const handleContinue = () => {
    if (!consultationType) {
      Alert.alert('Required', 'Please select a consultation type');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Required', 'Please select a date');
      return;
    }
    if (!selectedTimeSlot) {
      Alert.alert('Required', 'Please select a time slot');
      return;
    }
    if (!selectedMode) {
      Alert.alert('Required', 'Please select a mode of consultation');
      return;
    }

    setShowSummary(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const appointmentData = {
        user_id: user.id,
        ...(providerType === 'specialist'
          ? { specialist_id: providerId, nurse_id: null }
          : { nurse_id: providerId, specialist_id: null }),
        provider_type: providerType,
        consultation_type: consultationType,
        appointment_date: selectedDate?.toISOString().split('T')[0],
        appointment_time: selectedTimeSlot?.time.replace(/\s*(am|pm)/, ' $1'),
        duration_minutes: selectedTimeSlot?.duration,
        mode: selectedMode,
        reason: reason || null,
        status: 'pending',
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      Alert.alert('Success', 'Appointment booked successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowSummary(false);
            router.replace('/(tabs)/appointments');
          },
        },
      ]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {provider && (
          <View style={styles.providerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{provider.name.charAt(0)}</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>
                {provider.name} ({provider.specialty})
              </Text>
              <Text style={styles.providerLocation}>{provider.location}</Text>
            </View>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.label}>Consultation Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowConsultationTypes(!showConsultationTypes)}
          >
            <Text
              style={
                consultationType
                  ? styles.dropdownValueText
                  : styles.dropdownPlaceholder
              }
            >
              {consultationType || 'Select a Consultation Type'}
            </Text>
            {showConsultationTypes ? (
              <ChevronUp size={20} color="#00D9FF" />
            ) : (
              <ChevronDown size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {showConsultationTypes && (
            <View style={styles.dropdownMenu}>
              {consultationTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setConsultationType(type);
                    setShowConsultationTypes(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Consultation Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={selectedDate ? styles.dateText : styles.datePlaceholder}
            >
              {selectedDate ? formatDate(selectedDate) : 'DD / MM / YYYY'}
            </Text>
            <CalendarIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Consultation Time</Text>
          <View style={styles.timeSlotGrid}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot?.time === slot.time &&
                    styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <View
                  style={[
                    styles.timeSlotRadio,
                    selectedTimeSlot?.time === slot.time &&
                      styles.timeSlotRadioSelected,
                  ]}
                >
                  {selectedTimeSlot?.time === slot.time && (
                    <View style={styles.timeSlotRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTimeSlot?.time === slot.time &&
                      styles.timeSlotTextSelected,
                  ]}
                >
                  {slot.time} · {slot.duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load more time</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Mode of Consultation</Text>
          <View style={styles.modeGrid}>
            {modes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.modeOption,
                  selectedMode === mode.value && styles.modeOptionSelected,
                ]}
                onPress={() => setSelectedMode(mode.value)}
              >
                <View
                  style={[
                    styles.modeRadio,
                    selectedMode === mode.value && styles.modeRadioSelected,
                  ]}
                >
                  {selectedMode === mode.value && (
                    <View style={styles.modeRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.modeText,
                    selectedMode === mode.value && styles.modeTextSelected,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Reason (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add a short note for the doctor (optional)"
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButtonContainer}
        >
          <LinearGradient
            colors={['#00D9FF', '#0099FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showDatePicker && (
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleDateSelect}
        />
      )}

      {showSummary && provider && selectedDate && selectedTimeSlot && (
        <AppointmentSummaryModal
          visible={showSummary}
          onClose={() => setShowSummary(false)}
          onConfirm={handleConfirmBooking}
          provider={provider}
          consultationType={consultationType}
          date={selectedDate}
          timeSlot={selectedTimeSlot}
          mode={selectedMode}
          reason={reason}
          submitting={submitting}
        />
      )}
    </View>
  );
}

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

function DatePickerModal({ visible, onClose, onSelect }: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDone = () => {
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>{monthName}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronLeft
                size={24}
                color="#111827"
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !date && styles.calendarDayEmpty,
                  selectedDate &&
                    date &&
                    date.toDateString() === selectedDate.toDateString() &&
                    styles.calendarDaySelected,
                ]}
                disabled={!date}
                onPress={() => date && setSelectedDate(date)}
              >
                {date && (
                  <Text
                    style={[
                      styles.calendarDayText,
                      selectedDate &&
                        date.toDateString() === selectedDate.toDateString() &&
                        styles.calendarDayTextSelected,
                    ]}
                  >
                    {date.getDate().toString().padStart(2, '0')}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface AppointmentSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  provider: Provider;
  consultationType: string;
  date: Date;
  timeSlot: TimeSlot;
  mode: string;
  reason?: string;
  submitting: boolean;
}

function AppointmentSummaryModal({
  visible,
  onClose,
  onConfirm,
  provider,
  consultationType,
  date,
  timeSlot,
  mode,
  reason,
  submitting,
}: AppointmentSummaryModalProps) {
  const formatDate = (d: Date) => {
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const modeLabel =
    {
      video: 'Video Call',
      audio: 'Audio Call',
      chat: 'Chat',
    }[mode] || mode;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.summaryModal}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Appointment Summary</Text>
            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Text style={styles.summaryClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.summaryProviderAvatar}>
              <Text style={styles.summaryProviderAvatarText}>
                {provider.name.charAt(0)}
              </Text>
            </View>

            <Text style={styles.summaryProviderName}>{provider.name}</Text>
            <Text style={styles.summaryProviderSpecialty}>
              {provider.specialty}
            </Text>
            <Text style={styles.summaryProviderLocation}>
              {provider.location}
            </Text>

            <View style={styles.summaryConsultationBadge}>
              <Text style={styles.summaryConsultationBadgeText}>
                {consultationType}
              </Text>
              <Text style={styles.summaryUltraCare}>✓ Ultra Care</Text>
            </View>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Consultation Type</Text>
                <Text style={styles.summaryValue}>{consultationType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDate(date)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {timeSlot.time} · {timeSlot.duration} min (Your time: 4:30 am
                  EST)
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode</Text>
                <Text style={styles.summaryValue}>{modeLabel}</Text>
              </View>
              {reason && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Reason</Text>
                  <Text style={styles.summaryValue}>{reason}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.summaryActions}>
            <TouchableOpacity
              onPress={onConfirm}
              style={styles.confirmButtonContainer}
              disabled={submitting}
            >
              <LinearGradient
                colors={['#00D9FF', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>
                  {submitting ? 'Booking...' : 'Confirm and Book'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.editButtonText}>Edit Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 20,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00D9FF',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0284C7',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  providerLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  dropdownValueText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datePlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  dateText: {
    fontSize: 15,
    color: '#111827',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00D9FF',
    borderWidth: 2,
  },
  timeSlotRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotRadioSelected: {
    borderColor: '#00D9FF',
  },
  timeSlotRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D9FF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeSlotTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  loadMoreButton: {
    marginTop: 16,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00D9FF',
  },
  modeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeOptionSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#00D9FF',
    borderWidth: 2,
  },
  modeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeRadioSelected: {
    borderColor: '#00D9FF',
  },
  modeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D9FF',
  },
  modeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modeTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
  },
  continueButtonContainer: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDaySelected: {
    backgroundColor: '#00D9FF',
    borderRadius: 50,
  },
  calendarDayText: {
    fontSize: 15,
    color: '#111827',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00D9FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D9FF',
  },
  summaryModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    maxHeight: '90%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  summaryClose: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  summaryProviderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  summaryProviderAvatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#0284C7',
  },
  summaryProviderName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryProviderSpecialty: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryProviderLocation: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryConsultationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryConsultationBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryUltraCare: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  summaryDetails: {
    paddingHorizontal: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  summaryActions: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  confirmButtonContainer: {
    marginBottom: 12,
  },
  confirmButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D9FF',
  },
});
