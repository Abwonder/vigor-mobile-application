import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';

const CATEGORIES = [
  'Account',
  'Billing',
  'Medical',
  'Technical',
  'Appointments',
  'Other',
];
const PRIORITIES = [
  { value: 'low', label: 'Low - General inquiry' },
  { value: 'medium', label: 'Medium - Issue affecting use' },
  { value: 'high', label: 'High - Urgent issue' },
];

export default function SubmitTicketScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to submit a ticket');
        return;
      }

      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        status: 'open',
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your support ticket has been submitted. Our team will respond within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error('Error submitting ticket:', error);
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
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
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Ticket</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>How can we help?</Text>
        <Text style={styles.sectionDescription}>
          Describe your issue and our support team will get back to you within
          24 hours.
        </Text>

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief description of your issue"
          placeholderTextColor="#9CA3AF"
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
        />

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text
            style={[
              styles.pickerButtonText,
              !category && styles.placeholderText,
            ]}
          >
            {category || 'Select a category'}
          </Text>
          <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.pickerContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.pickerOption}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    category === cat && styles.pickerOptionTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Priority</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPriorityPicker(!showPriorityPicker)}
        >
          <Text style={styles.pickerButtonText}>
            {PRIORITIES.find((p) => p.value === priority)?.label}
          </Text>
          <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {showPriorityPicker && (
          <View style={styles.pickerContainer}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={styles.pickerOption}
                onPress={() => {
                  setPriority(p.value);
                  setShowPriorityPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    priority === p.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please describe your issue in detail..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          maxLength={2000}
        />

        <Text style={styles.charCount}>{message.length}/2000 characters</Text>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
    color: '#0EA5E9',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 150,
  },
  charCount: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
