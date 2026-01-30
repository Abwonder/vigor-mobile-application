import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Bell, FileText, Eye, MessageSquare, MessageCircle, FileStack, Activity, Sparkles } from 'lucide-react-native';

interface UserSettings {
  id: string;
  user_id: string;
  consultation_reminders: boolean;
  prescription_refill_reminders: boolean;
  billing_subscription_updates: boolean;
  general_updates: boolean;
  text_message_updates: boolean;
  sponsor_can_view_emr: boolean;
  sponsor_can_manage_health: boolean;
  save_consultation_chats: boolean;
  auto_clear_chats: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data);
        } else {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!settings) return;

    setUpdating(true);
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ [key]: value })
        .eq('user_id', settings.user_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
      setSettings(settings);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load settings</Text>
      </View>
    );
  }

  const notificationSettings = [
    {
      icon: Bell,
      title: 'Consultation reminders',
      description: 'Alert me before my consultations start.',
      key: 'consultation_reminders' as keyof UserSettings,
      value: settings.consultation_reminders,
    },
    {
      icon: FileText,
      title: 'Prescription refill reminders',
      description: "Notify me when it's time to refill medication.",
      key: 'prescription_refill_reminders' as keyof UserSettings,
      value: settings.prescription_refill_reminders,
    },
    {
      icon: Eye,
      title: 'Billing & subscription updates',
      description: 'Updates on payments, renewals, and invoices.',
      key: 'billing_subscription_updates' as keyof UserSettings,
      value: settings.billing_subscription_updates,
    },
    {
      icon: MessageSquare,
      title: 'General updates & announcements',
      description: 'Messages about service changes or downtime.',
      key: 'general_updates' as keyof UserSettings,
      value: settings.general_updates,
    },
    {
      icon: MessageCircle,
      title: 'Text message update',
      description: 'Real time text message',
      key: 'text_message_updates' as keyof UserSettings,
      value: settings.text_message_updates,
    },
  ];

  const privacySettings = [
    {
      icon: FileStack,
      title: 'My sponsor can view my EMR',
      description: 'Allow sponsor to see my medical records, prescriptions, and test results.',
      key: 'sponsor_can_view_emr' as keyof UserSettings,
      value: settings.sponsor_can_view_emr,
    },
    {
      icon: Activity,
      title: 'My sponsor can manage my health',
      description: 'Allow sponsor to book consultations, approve prescriptions, and handle care decisions on my behalf.',
      key: 'sponsor_can_manage_health' as keyof UserSettings,
      value: settings.sponsor_can_manage_health,
    },
    {
      icon: MessageCircle,
      title: 'Save consultation chats on device',
      description: 'Keep past consultation chats stored on this phone.',
      key: 'save_consultation_chats' as keyof UserSettings,
      value: settings.save_consultation_chats,
    },
    {
      icon: Sparkles,
      title: 'Auto-clear chats after 30 days',
      description: 'Automatically delete stored chats after 30 days.',
      key: 'auto_clear_chats' as keyof UserSettings,
      value: settings.auto_clear_chats,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        {notificationSettings.map((item, index) => (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <item.icon size={24} color="#374151" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={(value) => updateSetting(item.key, value)}
              trackColor={{ false: '#D1D5DB', true: '#4ADE80' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
              disabled={updating}
            />
          </View>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Privacy</Text>

        {privacySettings.map((item, index) => (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <item.icon size={24} color="#374151" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={(value) => updateSetting(item.key, value)}
              trackColor={{ false: '#D1D5DB', true: '#4ADE80' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
              disabled={updating}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
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
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleSpacing: {
    marginTop: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    gap: 12,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  settingContent: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
