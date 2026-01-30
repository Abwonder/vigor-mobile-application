import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useEffect, useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  FileText,
  TestTube2,
  Activity,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationBell } from '../../components/NotificationBell';
import { NotificationsModal } from '../../components/NotificationsModal';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadNotificationCount();

    const interval = setInterval(() => {
      checkCompletedTimers();
      loadNotificationCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(userProfile);

      const { data: health } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setHealthProfile(health);

      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true });
      setAppointments(upcomingAppointments || []);

      const { data: activeMeds } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);
      setMedications(activeMeds || []);
    }
  };

  const getProfileCompletion = () => {
    if (!healthProfile) return 0;
    let completed = 0;
    if (healthProfile.allergies?.length > 0) completed++;
    if (healthProfile.conditions?.length > 0) completed++;
    if (healthProfile.surgical_history?.length > 0) completed++;
    if (healthProfile.family_history?.length > 0) completed++;
    if (healthProfile.immunizations?.length > 0) completed++;
    return completed;
  };

  const loadNotificationCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [notificationsResult, timersResult] = await Promise.all([
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false),
        supabase
          .from('triage_timers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active'),
      ]);

      const totalCount =
        (notificationsResult.count || 0) + (timersResult.count || 0);
      setNotificationCount(totalCount);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const checkCompletedTimers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: timers } = await supabase
        .from('triage_timers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('end_time', new Date().toISOString());

      if (timers && timers.length > 0) {
        for (const timer of timers) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'triage_complete',
            title: 'Triage Assessment Complete',
            message: `Your triage for ${timer.symptom_name} has been completed. Tap to view results.`,
            data: { sessionId: timer.session_id },
          });

          await supabase
            .from('triage_timers')
            .update({ status: 'completed' })
            .eq('id', timer.id);
        }

        loadNotificationCount();
      }
    } catch (error) {
      console.error('Error checking completed timers:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {profile?.profile_photo_url ? (
                <Image
                  source={{ uri: profile.profile_photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profile?.first_name?.[0] || 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.greeting}>
                  Hi, {profile?.first_name || 'there'}!
                </Text>
                <Text style={styles.subtitle}>How do you feel today?</Text>
              </View>
            </View>
            <NotificationBell
              count={notificationCount}
              onPress={() => setShowNotificationsModal(true)}
              color="#9CA3AF"
              size={22}
            />
          </View>

          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/find-care')}
          >
            <Search size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>
              What's your symptom? (e.g., fever, chest pain)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* PROFILE BANNER */}
          {getProfileCompletion() < 5 && (
            <TouchableOpacity
              style={styles.profileBanner}
              onPress={() => setShowProfileModal(true)}
            >
              <View style={styles.profileBannerLeft}>
                <Text style={styles.profileProgress}>
                  {getProfileCompletion() || 1}/5
                </Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.profileText}>Complete your profile</Text>
              </View>
              <X size={18} color="#007AFF" />
            </TouchableOpacity>
          )}

          {/* HERO CARD (DOCTOR) */}
          <LinearGradient
            colors={['#007AFF', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.careCard}
          >
            <View style={styles.careCardContent}>
              <Text style={styles.careCardTitle}>
                Do you need care{'\n'}immediately?
              </Text>
              <TouchableOpacity style={styles.careButton}>
                <Text style={styles.careButtonText}>Talk to someone →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ACTIONS GRID */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Calendar size={22} color="#0284C7" />
              </View>
              <Text style={styles.actionTitle}>Book{'\n'}Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <FileText size={22} color="#16A34A" />
              </View>
              <Text style={styles.actionTitle}>
                Request{'\n'}prescription refill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <TestTube2 size={22} color="#0284C7" />
              </View>
              <Text style={styles.actionTitle}>Upload{'\n'}Test Results</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Activity size={22} color="#16A34A" />
              </View>
              <Text style={styles.actionTitle}>Share Vitals</Text>
            </TouchableOpacity>
          </View>

          {/* UPCOMING APPOINTMENTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming appointment</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Book appointment</Text>
              </TouchableOpacity>
            </View>

            {appointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={24} color="#9CA3AF" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>
                  You don't have any{'\n'}appointments scheduled
                </Text>
              </View>
            ) : (
              appointments.map((apt) => (
                <View key={apt.id} style={styles.appointmentCard}>
                  <Text style={styles.appointmentDate}>
                    {new Date(apt.appointment_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.appointmentProvider}>
                    {apt.consultation_type}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* ACTIVE MEDICATION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Medication</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Add medication</Text>
              </TouchableOpacity>
            </View>

            {medications.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.pillIconContainer}>
                  <FileText size={20} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyText}>
                  You don't have any medications{'\n'}listed. Add one to stay on
                  track.
                </Text>
              </View>
            ) : (
              medications.map((med) => (
                <View key={med.id} style={styles.medicationCard}>
                  <Text style={styles.medicationName}>
                    {med.medication_name}
                  </Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL (Logic Unchanged) */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Flexible options for individuals, families, and sponsors.
            </Text>

            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity style={styles.profileOption}>
                <View style={styles.profileOptionIcon}>
                  <Activity size={24} color="#007AFF" />
                </View>
                <View style={styles.profileOptionContent}>
                  <Text style={styles.profileOptionTitle}>Allergies</Text>
                  <Text style={styles.profileOptionDescription}>
                    Allergies, conditions, surgeries, vitals...
                  </Text>
                </View>
                <View style={styles.checkbox} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNotificationCountChange={setNotificationCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray main background
  },
  header: {
    backgroundColor: '#F9FAFB',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  notificationButton: {
    padding: 8,
    backgroundColor: '#F3F4F6', // Light gray bubble for bell
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  // PROFILE BANNER
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE', // Light blue background
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  profileBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#7DD3FC',
  },
  profileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0284C7',
  },

  // HERO CARD
  careCard: {
    height: 100, // Fixed height for consistency
    borderRadius: 20,
    // padding: 0,
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative', // Vital for absolute positioning of image
    overflow: 'hidden',
  },
  careCardContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center', // Center content vertically
    padding: 24, // Add padding back to the content container only
  },
  careCardTitle: {
    fontSize: 15,
    // fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 11,
    lineHeight: 15,
  },
  careButton: {
    backgroundColor: '#01FEB0', // Neon green/teal
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  careButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0084BB',
  },
  doctorImage: {
    width: 250,
    height: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: -10,
    zIndex: 1,
  },

  // ACTIONS GRID
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 5,
    width: '48%', // approx half width
    flexDirection: 'row', // Icon left, text right
    alignItems: 'center',
    gap: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 18,
  },

  // SECTIONS & EMPTY STATES
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },

  // Empty State Styling to match Gray Box
  emptyState: {
    backgroundColor: '#F3F4F6', // Light gray background
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  pillIconContainer: {
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Logic/Data Cards (Styles kept just in case data loads)
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  appointmentDate: { fontSize: 14, fontWeight: '600', color: '#111827' },
  appointmentProvider: { fontSize: 16, fontWeight: '500', color: '#111827' },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  medicationName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  medicationDosage: { fontSize: 14, color: '#6B7280' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  modalScroll: { maxHeight: 500 },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileOptionContent: { flex: 1 },
  profileOptionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  profileOptionDescription: { fontSize: 13, color: '#6B7280' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
});
