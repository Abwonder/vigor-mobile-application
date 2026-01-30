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
import { TrendingUp, MapPin, AlertTriangle, Send } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import DashboardHeader from '../../../components/specialist/DashboardHeader';
import { supabase } from '../../../lib/supabase';

interface SymptomCluster {
  id: string;
  region: any;
  symptom_type: string;
  case_count: number;
  date_range: any;
  severity_distribution: any;
}

export default function Analytics() {
  const [clusters, setClusters] = useState<SymptomCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    fetchSymptomClusters();
  }, []);

  const fetchSymptomClusters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('symptom_clusters')
        .select('*')
        .order('case_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setClusters(data || []);
    } catch (error) {
      console.error('Error fetching symptom clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkAlert = (clusterId: string) => {
    // TODO: Implement bulk alert modal
    console.log('Send bulk alert for cluster:', clusterId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader userName="Public Health Analytics" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSymptomClusters}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Geographic Symptom Clusters</Text>
          <Text style={styles.headerSubtitle}>
            Monitor symptom patterns across regions
          </Text>
        </View>

        {/* Clusters */}
        {clusters.length === 0 ? (
          <View style={styles.emptyState}>
            <TrendingUp size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No symptom clusters detected</Text>
            <Text style={styles.emptySubtext}>
              Clusters will appear when multiple cases are reported in the same
              region
            </Text>
          </View>
        ) : (
          clusters.map((cluster) => (
            <View key={cluster.id} style={styles.clusterCard}>
              {/* Alert Badge */}
              {cluster.case_count >= 10 && (
                <View style={styles.alertBadge}>
                  <AlertTriangle size={14} color="#EF4444" />
                  <Text style={styles.alertText}>High Volume</Text>
                </View>
              )}

              {/* Cluster Info */}
              <View style={styles.clusterHeader}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{cluster.case_count}</Text>
                  <Text style={styles.countLabel}>cases</Text>
                </View>
                <View style={styles.clusterInfo}>
                  <Text style={styles.symptomType}>{cluster.symptom_type}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.locationText}>
                      {cluster.region?.city || 'Unknown'},{' '}
                      {cluster.region?.state || ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Severity Distribution */}
              {cluster.severity_distribution && (
                <View style={styles.severitySection}>
                  <Text style={styles.severityTitle}>Severity Breakdown:</Text>
                  <View style={styles.severityBars}>
                    {Object.entries(cluster.severity_distribution).map(
                      ([severity, count]: [string, any]) => (
                        <View key={severity} style={styles.severityBar}>
                          <Text style={styles.severityLabel}>
                            {severity}: {count}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => handleSendBulkAlert(cluster.id)}
                >
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.alertButtonText}>Send Bulk Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Summary Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Summary Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{clusters.length}</Text>
              <Text style={styles.statLabel}>Active Clusters</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {clusters.reduce((sum, c) => sum + c.case_count, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Cases</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSection: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  clusterCard: {
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
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  countText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  clusterInfo: {
    flex: 1,
  },
  symptomType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  severitySection: {
    marginBottom: 12,
  },
  severityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  severityBars: {
    gap: 4,
  },
  severityBar: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
  },
  severityLabel: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  alertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    paddingHorizontal: 40,
  },
});
