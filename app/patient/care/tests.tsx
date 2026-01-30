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
  ChevronLeft,
  FileCheck,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react-native';

interface Test {
  id: string;
  test_name: string;
  test_type: string;
  scheduled_date: string | null;
  completed_date: string | null;
  status: string;
  ordered_by: string;
  results_summary: string | null;
  notes: string | null;
}

export default function TestsScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>(
    'upcoming',
  );
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<Test[]>([]);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: upcoming } = await supabase
        .from('tests_and_results')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['scheduled', 'pending'])
        .order('scheduled_date', { ascending: true });

      const { data: completed } = await supabase
        .from('tests_and_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_date', { ascending: false });

      if (upcoming) setUpcomingTests(upcoming);
      if (completed) setCompletedTests(completed);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'lab':
        return '#2196F3';
      case 'imaging':
        return '#FF9800';
      case 'diagnostic':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
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

  const displayTests =
    activeTab === 'upcoming' ? upcomingTests : completedTests;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tests & Results</Text>
        <TouchableOpacity onPress={() => router.push('/care/tests/add')}>
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming ({upcomingTests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            Completed ({completedTests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {displayTests.length === 0 ? (
          <View style={styles.emptyState}>
            <FileCheck size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>
              No {activeTab === 'upcoming' ? 'Upcoming' : 'Completed'} Tests
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'You have no scheduled tests at the moment'
                : 'No completed tests to display'}
            </Text>
          </View>
        ) : (
          displayTests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testHeader}>
                <View style={styles.testTitleRow}>
                  <Text style={styles.testName}>{test.test_name}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: `${getTypeColor(test.test_type)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        { color: getTypeColor(test.test_type) },
                      ]}
                    >
                      {test.test_type}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(test.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(test.status) },
                    ]}
                  >
                    {test.status}
                  </Text>
                </View>
              </View>

              <View style={styles.testDetails}>
                {test.scheduled_date && (
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Scheduled:{' '}
                      {new Date(test.scheduled_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {test.completed_date && (
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Completed:{' '}
                      {new Date(test.completed_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ordered by:</Text>
                  <Text style={styles.detailText}>{test.ordered_by}</Text>
                </View>

                {test.results_summary && (
                  <View style={styles.resultsSection}>
                    <Text style={styles.resultsLabel}>Results Summary:</Text>
                    <Text style={styles.resultsText}>
                      {test.results_summary}
                    </Text>
                  </View>
                )}

                {test.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{test.notes}</Text>
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
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  testHeader: {
    marginBottom: 12,
    gap: 8,
  },
  testTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  testDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  resultsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  resultsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  resultsText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
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
