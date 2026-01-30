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
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import DashboardHeader from '../../../components/specialist/DashboardHeader';
import { supabase } from '../../../lib/supabase';

interface SponsorRequest {
  id: string;
  sponsor_id: string;
  patient_id: string;
  request_type: 'medical_history' | 'case_status' | 'consultation_summary';
  request_details: string;
  status: 'pending' | 'approved_php' | 'approved_admin' | 'denied';
  created_at: string;
}

export default function SponsorRequests() {
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sponsor_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching sponsor requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('sponsor_requests')
        .update({
          status: 'approved_php',
          php_id: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('sponsor_requests')
        .update({
          status: 'denied',
          php_id: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'medical_history':
        return 'Medical History';
      case 'case_status':
        return 'Case Status';
      case 'consultation_summary':
        return 'Consultation Summary';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved_php':
      case 'approved_admin':
        return '#10B981';
      case 'denied':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader userName="Sponsor Requests" />

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
            Pending ({requests.filter((r) => r.status === 'pending').length})
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
            All Requests
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRequests} />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No sponsor requests</Text>
            <Text style={styles.emptySubtext}>
              Sponsor access requests will appear here for review
            </Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) + '20' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(request.status) },
                  ]}
                >
                  {request.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {/* Request Type */}
              <Text style={styles.requestType}>
                {getRequestTypeLabel(request.request_type)}
              </Text>

              {/* Patient & Sponsor Info */}
              <View style={styles.infoRow}>
                <User size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  Patient: {request.patient_id.slice(0, 8)}...
                </Text>
              </View>
              <View style={styles.infoRow}>
                <User size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  Sponsor: {request.sponsor_id.slice(0, 8)}...
                </Text>
              </View>

              {/* Request Details */}
              {request.request_details && (
                <Text style={styles.detailsText} numberOfLines={2}>
                  {request.request_details}
                </Text>
              )}

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.footerText}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>

                {/* Action Buttons (only for pending) */}
                {request.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.denyButton}
                      onPress={() => handleDeny(request.id)}
                    >
                      <XCircle size={16} color="#EF4444" />
                      <Text style={styles.denyText}>Deny</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApprove(request.id)}
                    >
                      <CheckCircle size={16} color="#FFFFFF" />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Privacy Notice */}
              {request.status === 'pending' && (
                <View style={styles.privacyNotice}>
                  <Text style={styles.privacyText}>
                    ⚠️ Ensure patient consent is verified before approval
                  </Text>
                </View>
              )}
            </View>
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
  requestCard: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  requestType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailsText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    marginTop: 8,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  denyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  denyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  approveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyNotice: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  privacyText: {
    fontSize: 12,
    color: '#92400E',
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
