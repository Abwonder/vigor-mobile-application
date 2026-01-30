import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  ChevronLeft,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  TrendingUp,
  Heart,
} from 'lucide-react-native';

interface PatientDetails {
  id: string;
  patient_name: string;
  patient_email: string;
  relationship_type: string;
  is_paying: boolean;
  started_at: string;
  current_plan_name?: string;
  current_plan_price?: number;
}

interface UpcomingAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
}

interface SubscriptionInfo {
  plan_name: string;
  status: string;
  expires_at: string;
}

export default function SponsoredPatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );

  useEffect(() => {
    loadPatientDetails();
  }, [id]);

  const loadPatientDetails = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sponsorshipData } = await supabase
        .from('sponsorships')
        .select(
          `
          *,
          subscription_plans:subscription_plan_id (name, price_monthly)
        `,
        )
        .eq('sponsor_id', user.id)
        .eq('patient_id', id)
        .maybeSingle();

      if (sponsorshipData) {
        setPatient({
          id: sponsorshipData.patient_id,
          patient_name: sponsorshipData.patient_name,
          patient_email: sponsorshipData.patient_email,
          relationship_type: sponsorshipData.relationship_type,
          is_paying: sponsorshipData.is_paying,
          started_at: sponsorshipData.started_at,
          current_plan_name: sponsorshipData.subscription_plans?.name,
          current_plan_price: sponsorshipData.subscription_plans?.price_monthly,
        });
      }

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .limit(3);

      setAppointments(appointmentsData || []);

      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('subscription_plans(name), status, expires_at')
        .eq('user_id', id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionData) {
        setSubscription({
          plan_name: subscriptionData.subscription_plans?.name || 'N/A',
          status: subscriptionData.status,
          expires_at: subscriptionData.expires_at,
        });
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPatientDetails();
  };

  const handlePayForPlan = () => {
    router.push(`/sponsor-payment/${id}`);
  };

  const handleUpgradePlan = () => {
    router.push(`/sponsor-payment/${id}?action=upgrade`);
  };

  const handleRequestResults = () => {
    console.log('Request medical results');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Patient not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backToListButton}
        >
          <Text style={styles.backToListText}>Back to List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient.patient_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.patientName}>{patient.patient_name}</Text>
          <Text style={styles.patientRelation}>
            {patient.relationship_type}
          </Text>
          {patient.is_paying && (
            <View style={styles.payingBadge}>
              <Text style={styles.payingBadgeText}>Active Sponsor</Text>
            </View>
          )}
        </View>

        {subscription && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={20} color="#0EA5E9" />
              <Text style={styles.cardTitle}>Current Care Plan</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan</Text>
                <Text style={styles.infoValue}>{subscription.plan_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, styles.activeStatus]}>
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expires</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.expires_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {patient.is_paying && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradePlan}
              >
                <TrendingUp size={18} color="#0EA5E9" />
                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!patient.is_paying && subscription && (
          <View style={styles.notPayingCard}>
            <Text style={styles.notPayingText}>
              Another sponsor is currently paying for this patient's care plan.
            </Text>
            <TouchableOpacity
              style={styles.takeOverButton}
              onPress={handlePayForPlan}
            >
              <CreditCard size={18} color="#FFFFFF" />
              <Text style={styles.takeOverButtonText}>Take Over Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {!subscription && (
          <View style={styles.noPlanCard}>
            <Text style={styles.noPlanText}>
              This patient doesn't have an active care plan yet.
            </Text>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handlePayForPlan}
            >
              <CreditCard size={18} color="#FFFFFF" />
              <Text style={styles.subscribeButtonText}>
                Subscribe for Patient
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color="#0EA5E9" />
            <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          </View>
          <View style={styles.cardContent}>
            {appointments.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            ) : (
              appointments.map((apt) => (
                <View key={apt.id} style={styles.appointmentItem}>
                  <View>
                    <Text style={styles.appointmentType}>
                      {apt.consultation_type}
                    </Text>
                    <Text style={styles.appointmentDate}>
                      {new Date(apt.appointment_date).toLocaleDateString()} at{' '}
                      {apt.appointment_time}
                    </Text>
                  </View>
                  <View style={styles.appointmentStatus}>
                    <Text style={styles.statusText}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color="#0EA5E9" />
            <Text style={styles.cardTitle}>Health Records</Text>
          </View>
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleRequestResults}
            >
              <Activity size={18} color="#6B7280" />
              <Text style={styles.actionItemText}>Request Test Results</Text>
              <ChevronLeft
                size={18}
                color="#9CA3AF"
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Sponsorship Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Started</Text>
            <Text style={styles.infoValue}>
              {new Date(patient.started_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {patient.patient_email || 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  backToListButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  patientHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  patientRelation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  payingBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  payingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  activeStatus: {
    color: '#10B981',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  notPayingCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notPayingText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 20,
  },
  takeOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  takeOverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noPlanCard: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noPlanText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appointmentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  appointmentStatus: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
});
