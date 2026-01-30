import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  Heart,
  Users,
  Package,
  FileText,
  Pill,
  FileCheck,
  Activity,
  ChevronRight,
} from 'lucide-react-native';

interface HealthRecordSummary {
  allergiesCount: number;
  conditionsCount: number;
  surgeriesCount: number;
}

interface CareTeamSummary {
  primaryPhysician: string | null;
  specialistsCount: number;
  hospital: string | null;
}

interface ActiveCarePackage {
  id: string;
  name: string;
  currentStage: string;
  startDate: string;
}

interface TestSummary {
  upcomingCount: number;
  latestTest: string | null;
}

interface MedicationSummary {
  activeCount: number;
  latestMedication: string | null;
}

interface DocumentSummary {
  count: number;
  latestDocument: string | null;
}

interface CareStatusInfo {
  status: string;
  duration: string;
  lastUpdate: string;
}

export default function CareScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [healthRecord, setHealthRecord] = useState<HealthRecordSummary>({
    allergiesCount: 0,
    conditionsCount: 0,
    surgeriesCount: 0,
  });
  const [careTeam, setCareTeam] = useState<CareTeamSummary>({
    primaryPhysician: null,
    specialistsCount: 0,
    hospital: null,
  });
  const [activeCarePackage, setActiveCarePackage] =
    useState<ActiveCarePackage | null>(null);
  const [tests, setTests] = useState<TestSummary>({
    upcomingCount: 0,
    latestTest: null,
  });
  const [medications, setMedications] = useState<MedicationSummary>({
    activeCount: 0,
    latestMedication: null,
  });
  const [documents, setDocuments] = useState<DocumentSummary>({
    count: 0,
    latestDocument: null,
  });
  const [careStatus, setCareStatus] = useState<CareStatusInfo | null>(null);

  useEffect(() => {
    loadCareData();
  }, []);

  const loadCareData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);

      await Promise.all([
        loadHealthRecordSummary(user.id),
        loadCareTeamSummary(user.id),
        loadActiveCarePackage(user.id),
        loadTestsSummary(user.id),
        loadMedicationsSummary(user.id),
        loadDocumentsSummary(user.id),
        loadCareStatus(user.id),
      ]);
    } catch (error) {
      console.error('Error loading care data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthRecordSummary = async (userId: string) => {
    const [allergies, conditions, surgeries] = await Promise.all([
      supabase
        .from('allergies')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('conditions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('surgical_history')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    setHealthRecord({
      allergiesCount: allergies.count || 0,
      conditionsCount: conditions.count || 0,
      surgeriesCount: surgeries.count || 0,
    });
  };

  const loadCareTeamSummary = async (userId: string) => {
    const { data: team } = await supabase
      .from('care_team')
      .select('*')
      .eq('user_id', userId);

    const primary = team?.find((t) => t.is_primary);
    const specialists = team?.filter((t) => t.type === 'specialist') || [];
    const hospital = team?.find((t) => t.type === 'hospital');

    setCareTeam({
      primaryPhysician: primary?.name || null,
      specialistsCount: specialists.length,
      hospital: hospital?.name || null,
    });
  };

  const loadActiveCarePackage = async (userId: string) => {
    const { data } = await supabase
      .from('care_packages')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setActiveCarePackage({
        id: data.id,
        name: data.name,
        currentStage: data.current_stage || 'In Progress',
        startDate: data.start_date,
      });
    }
  };

  const loadTestsSummary = async (userId: string) => {
    const { data: upcoming } = await supabase
      .from('tests_and_results')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true });

    const { data: latest } = await supabase
      .from('tests_and_results')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setTests({
      upcomingCount: upcoming?.length || 0,
      latestTest: latest?.test_name || null,
    });
  };

  const loadMedicationsSummary = async (userId: string) => {
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setMedications({
      activeCount: data?.length || 0,
      latestMedication: data?.[0]?.name || null,
    });
  };

  const loadDocumentsSummary = async (userId: string) => {
    const { data, count } = await supabase
      .from('medical_documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false });

    setDocuments({
      count: count || 0,
      latestDocument: data?.[0]?.title || null,
    });
  };

  const loadCareStatus = async (userId: string) => {
    const { data } = await supabase
      .from('care_status')
      .select('*')
      .eq('user_id', userId)
      .order('last_update', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCareStatus({
        status: data.status,
        duration: data.duration || 'N/A',
        lastUpdate: new Date(data.last_update).toLocaleDateString(),
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.header}>Your Care</Text>
        <Text style={styles.subheader}>
          Complete overview of your health records and care
        </Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/care/health-record')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Heart size={24} color="#FF6B6B" />
              </View>
              <ChevronRight size={20} color="#999" />
            </View>
            <Text style={styles.cardTitle}>Health Record</Text>
            <View style={styles.cardStats}>
              <Text style={styles.statText}>
                {healthRecord.allergiesCount} Allergies
              </Text>
              <Text style={styles.statSeparator}>•</Text>
              <Text style={styles.statText}>
                {healthRecord.conditionsCount} Conditions
              </Text>
              <Text style={styles.statSeparator}>•</Text>
              <Text style={styles.statText}>
                {healthRecord.surgeriesCount} Surgeries
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/care/care-team')}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#E8F5E9' }]}>
                <Users size={24} color="#4CAF50" />
              </View>
              <ChevronRight size={20} color="#999" />
            </View>
            <Text style={styles.cardTitle}>Care Team</Text>
            <View style={styles.cardDetails}>
              {careTeam.primaryPhysician && (
                <Text style={styles.detailText}>
                  Dr. {careTeam.primaryPhysician}
                </Text>
              )}
              <Text style={styles.detailSubtext}>
                {careTeam.specialistsCount} Specialists
                {careTeam.hospital && ` • ${careTeam.hospital}`}
              </Text>
            </View>
          </TouchableOpacity>

          {activeCarePackage && (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push(`/care/care-package/${activeCarePackage.id}`)
              }
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Package size={24} color="#2196F3" />
                </View>
                <ChevronRight size={20} color="#999" />
              </View>
              <Text style={styles.cardTitle}>Active Care Package</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>{activeCarePackage.name}</Text>
                <Text style={styles.detailSubtext}>
                  Stage: {activeCarePackage.currentStage}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/care/tests')}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#FFF3E0' }]}>
                <FileCheck size={24} color="#FF9800" />
              </View>
              <ChevronRight size={20} color="#999" />
            </View>
            <Text style={styles.cardTitle}>Tests & Results</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>
                {tests.upcomingCount} Upcoming Tests
              </Text>
              {tests.latestTest && (
                <Text style={styles.detailSubtext}>
                  Latest: {tests.latestTest}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/care/medications')}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#F3E5F5' }]}>
                <Pill size={24} color="#9C27B0" />
              </View>
              <ChevronRight size={20} color="#999" />
            </View>
            <Text style={styles.cardTitle}>Medications (Active)</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>
                {medications.activeCount} Active Medications
              </Text>
              {medications.latestMedication && (
                <Text style={styles.detailSubtext}>
                  Latest: {medications.latestMedication}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/care/documents')}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#FBE9E7' }]}>
                <FileText size={24} color="#FF5722" />
              </View>
              <ChevronRight size={20} color="#999" />
            </View>
            <Text style={styles.cardTitle}>Reports & Documents</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>{documents.count} Documents</Text>
              {documents.latestDocument && (
                <Text style={styles.detailSubtext}>
                  Latest: {documents.latestDocument}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {careStatus && (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push('/care/status')}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: '#E1F5FE' }]}>
                  <Activity size={24} color="#03A9F4" />
                </View>
                <ChevronRight size={20} color="#999" />
              </View>
              <Text style={styles.cardTitle}>Care Status</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>
                  {careStatus.status.replace(/_/g, ' ')}
                </Text>
                <Text style={styles.detailSubtext}>
                  {careStatus.duration} • Last updated: {careStatus.lastUpdate}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  statSeparator: {
    fontSize: 14,
    color: '#CCC',
    marginHorizontal: 8,
  },
  cardDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  detailSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
