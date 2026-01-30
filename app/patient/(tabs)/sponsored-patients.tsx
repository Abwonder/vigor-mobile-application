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
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  User,
} from 'lucide-react-native';

interface SponsoredPatient {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  relationship_type: string;
  status: string;
  is_paying: boolean;
  started_at: string;
  subscription_plan_id: string | null;
}

interface PendingRequest {
  id: string;
  patient_user_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  message: string;
  created_at: string;
}

export default function SponsoredPatientsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sponsoredPatients, setSponsoredPatients] = useState<
    SponsoredPatient[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sponsorCode, setSponsorCode] = useState<string>('');
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get sponsor code
      const { data: sponsorProfile } = await supabase
        .from('sponsors')
        .select('reference_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sponsorProfile) {
        setSponsorCode(sponsorProfile.reference_id);
      }

      // Get sponsored patients
      const { data: patients } = await supabase
        .from('sponsorships')
        .select('*')
        .eq('sponsor_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      setSponsoredPatients(patients || []);

      // Get pending requests
      const { data: requests } = await supabase
        .from('sponsorship_requests')
        .select('*')
        .eq('sponsor_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(requests || []);

      // Calculate stats
      setStats({
        total: patients?.length || 0,
        active: patients?.filter((p) => p.is_paying).length || 0,
        pending: requests?.length || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('sponsorship_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('sponsorship_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handlePatientPress = (patientId: string) => {
    router.push(`/sponsored-patient/${patientId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sponsored Patients</Text>
        <Text style={styles.headerSubtitle}>
          Manage and support your patients
        </Text>
      </View>

      {sponsorCode && (
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <UserPlus size={20} color="#0EA5E9" />
            <Text style={styles.codeTitle}>Your Sponsor Code</Text>
          </View>
          <Text style={styles.codeValue}>{sponsorCode}</Text>
          <Text style={styles.codeHint}>
            Share this code with patients who want you as their sponsor
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>
              Pending Requests ({pendingRequests.length})
            </Text>
          </View>

          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <User size={16} color="#6B7280" />
                  <Text style={styles.requestName}>{request.patient_name}</Text>
                </View>
                <Text style={styles.requestTime}>
                  {new Date(request.created_at).toLocaleDateString()}
                </Text>
              </View>

              {request.patient_email && (
                <Text style={styles.requestEmail}>{request.patient_email}</Text>
              )}

              {request.message && (
                <Text style={styles.requestMessage}>{request.message}</Text>
              )}

              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDeclineRequest(request.id)}
                >
                  <XCircle size={18} color="#EF4444" />
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <CheckCircle size={18} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>
            Sponsored Patients ({sponsoredPatients.length})
          </Text>
        </View>

        {sponsoredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptyText}>
              Share your sponsor code with patients who need support
            </Text>
          </View>
        ) : (
          sponsoredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => handlePatientPress(patient.patient_id)}
            >
              <View style={styles.patientInfo}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {patient.patient_name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.patientDetails}>
                  <Text style={styles.patientName}>{patient.patient_name}</Text>
                  <Text style={styles.patientMeta}>
                    {patient.relationship_type} • Since{' '}
                    {new Date(patient.started_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.patientStatus}>
                {patient.is_paying ? (
                  <View style={styles.payingBadge}>
                    <CheckCircle size={14} color="#10B981" />
                    <Text style={styles.payingText}>Paying</Text>
                  </View>
                ) : (
                  <View style={styles.dormantBadge}>
                    <Text style={styles.dormantText}>Dormant</Text>
                  </View>
                )}
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  codeCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  codeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 4,
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requestTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  declineButton: {
    backgroundColor: '#FEE2E2',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#0EA5E9',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  patientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  payingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  dormantBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dormantText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },
});
