import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronLeft,
  Bell,
  FileText,
  Banknote,
  MessageSquare,
  Smartphone,
  MessageCircle,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  SettingRow,
  SettingSection,
} from '../../../components/specialist/SettingComponents';

export default function SettingsScreen() {
  const router = useRouter();

  // Notification States
  const [consultationReminders, setConsultationReminders] = useState(true);
  const [prescriptionReminders, setPrescriptionReminders] = useState(false);
  const [billingUpdates, setBillingUpdates] = useState(true);
  const [generalUpdates, setGeneralUpdates] = useState(true);
  const [textUpdates, setTextUpdates] = useState(true);

  // Privacy States
  const [saveChats, setSaveChats] = useState(true);
  const [autoClear, setAutoClear] = useState(true);

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SettingSection title="Notifications">
          <SettingRow
            icon={<Bell color="#495057" size={22} />}
            title="Consultation reminders"
            subtitle="Alert me before my consultations start."
            isEnabled={consultationReminders}
            onToggle={setConsultationReminders}
          />
          <SettingRow
            icon={<FileText color="#495057" size={22} />}
            title="Prescription refill reminders"
            subtitle="Notify me when it's time to refill medication."
            isEnabled={prescriptionReminders}
            onToggle={setPrescriptionReminders}
          />
          <SettingRow
            icon={<Banknote color="#495057" size={22} />}
            title="Billing & subscription updates"
            subtitle="Updates on payments, renewals, and invoices."
            isEnabled={billingUpdates}
            onToggle={setBillingUpdates}
          />
          <SettingRow
            icon={<MessageCircle color="#495057" size={22} />}
            title="General updates & announcements"
            subtitle="Messages about service changes or downtime."
            isEnabled={generalUpdates}
            onToggle={setGeneralUpdates}
          />
          <SettingRow
            icon={<Smartphone color="#495057" size={22} />}
            title="Text message update"
            subtitle="Real time text message"
            isEnabled={textUpdates}
            onToggle={setTextUpdates}
          />
        </SettingSection>

        <SettingSection title="Privacy">
          <SettingRow
            icon={<MessageSquare color="#495057" size={22} />}
            title="Save consultation chats on device"
            subtitle="Keep past consultation chats stored on this phone."
            isEnabled={saveChats}
            onToggle={setSaveChats}
          />
          <SettingRow
            icon={<Sparkles color="#495057" size={22} />}
            title="Auto-clear chats after 30 days"
            subtitle="Automatically delete stored chats after 30 days."
            isEnabled={autoClear}
            onToggle={setAutoClear}
          />
        </SettingSection>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  scrollContent: {
    paddingTop: 10,
  },
});
