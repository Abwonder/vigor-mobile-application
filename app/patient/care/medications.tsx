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
import { ChevronLeft, Pill, Calendar, User, Plus } from 'lucide-react-native';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
}

export default function MedicationsScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'discontinued'>(
    'active',
  );
  const [activeMedications, setActiveMedications] = useState<Medication[]>([]);
  const [discontinuedMedications, setDiscontinuedMedications] = useState<
    Medication[]
  >([]);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: active } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      const { data: discontinued } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['discontinued', 'completed'])
        .order('start_date', { ascending: false });

      if (active) setActiveMedications(active);
      if (discontinued) setDiscontinuedMedications(discontinued);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'discontinued':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const displayMedications =
    activeTab === 'active' ? activeMedications : discontinuedMedications;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medications</Text>
        <TouchableOpacity onPress={() => router.push('/care/medications/add')}>
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}
          >
            Active ({activeMedications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discontinued' && styles.activeTab]}
          onPress={() => setActiveTab('discontinued')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'discontinued' && styles.activeTabText,
            ]}
          >
            Discontinued ({discontinuedMedications.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {displayMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Pill size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>
              No {activeTab === 'active' ? 'Active' : 'Discontinued'}{' '}
              Medications
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? 'You have no active medications at the moment'
                : 'No discontinued medications to display'}
            </Text>
          </View>
        ) : (
          displayMedications.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(medication.status)}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(medication.status) },
                    ]}
                  >
                    {medication.status}
                  </Text>
                </View>
              </View>

              <View style={styles.medicationDetails}>
                <View style={styles.dosageRow}>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Dosage</Text>
                    <Text style={styles.dosageValue}>{medication.dosage}</Text>
                  </View>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Frequency</Text>
                    <Text style={styles.dosageValue}>
                      {medication.frequency}
                    </Text>
                  </View>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>Route</Text>
                    <Text style={styles.dosageValue}>{medication.route}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <User size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Prescribed by: {medication.prescriber}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Started:{' '}
                    {new Date(medication.start_date).toLocaleDateString()}
                  </Text>
                </View>

                {medication.end_date && (
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Ended:{' '}
                      {new Date(medication.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {medication.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{medication.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  medicationDetails: {
    gap: 12,
  },
  dosageRow: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dosageItem: {
    flex: 1,
    gap: 4,
  },
  dosageLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  dosageValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
