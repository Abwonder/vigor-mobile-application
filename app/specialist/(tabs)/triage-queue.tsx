import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Clock, AlertCircle, User, MapPin } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import DashboardHeader from '../../../components/specialist/DashboardHeader';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

interface TriageCase {
  id: string;
  patient_id: string;
  symptoms: any[];
  severity_level: 'low' | 'medium' | 'high' | 'emergency';
  patient_notes: string;
  created_at: string;
  patient_location: any;
  status: string;
}

export default function TriageQueueDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing'>(
    'pending',
  );

  useEffect(() => {
    fetchTriageCases();
  }, [filter]);

  const fetchTriageCases = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('triage_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending_php');
      } else if (filter === 'reviewing') {
        query = query.eq('status', 'reviewing');
      }

      const { data, error } = await query;
      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching triage cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#0EA5E9';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getSeverityLabel = (severity: string) => {
    return severity?.charAt(0).toUpperCase() + severity?.slice(1) || 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader userName="PHP Dashboard" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'pending' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}
          >
            Pending ({cases.filter((c) => c.status === 'pending_php').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'reviewing' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('reviewing')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'reviewing' && styles.filterTextActive,
            ]}
          >
            Reviewing ({cases.filter((c) => c.status === 'reviewing').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All Cases
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTriageCases} />
        }
      >
        {cases.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No triage cases at the moment</Text>
            <Text style={styles.emptySubtext}>
              New patient symptom submissions will appear here
            </Text>
          </View>
        ) : (
          cases.map((caseItem) => (
            <TouchableOpacity
              key={caseItem.id}
              style={styles.caseCard}
              onPress={() => {
                // Navigate to case detail
                router.push(`/specialist/triage/${caseItem.id}`);
              }}
            >
              {/* Severity Badge */}
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      getSeverityColor(caseItem.severity_level) + '20',
                  },
                ]}
              >
                <View
                  style={[
                    styles.severityDot,
                    {
                      backgroundColor: getSeverityColor(
                        caseItem.severity_level,
                      ),
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.severityText,
                    { color: getSeverityColor(caseItem.severity_level) },
                  ]}
                >
                  {getSeverityLabel(caseItem.severity_level)}
                </Text>
              </View>

              {/* Patient Info */}
              <View style={styles.caseHeader}>
                <User size={16} color="#6B7280" />
                <Text style={styles.patientId}>
                  Patient #{caseItem.patient_id.slice(0, 8)}
                </Text>
              </View>

              {/* Symptoms */}
              <Text style={styles.symptomsTitle}>Symptoms:</Text>
              <Text style={styles.symptomsText} numberOfLines={2}>
                {caseItem.symptoms
                  ?.map((s: any) => s.name || s.type)
                  .join(', ') || 'No symptoms listed'}
              </Text>

              {/* Footer */}
              <View style={styles.caseFooter}>
                <View style={styles.footerItem}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.footerText}>
                    {new Date(caseItem.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {caseItem.patient_location && (
                  <View style={styles.footerItem}>
                    <MapPin size={14} color="#8E8E93" />
                    <Text style={styles.footerText}>
                      {caseItem.patient_location.city || 'Unknown'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  symptomsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  caseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
});
