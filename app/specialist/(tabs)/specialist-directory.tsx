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
  ActivityIndicator,
} from 'react-native';
import { User, CheckCircle, Circle } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import DashboardHeader from '../../../components/specialist/DashboardHeader';
import { supabase } from '../../../lib/supabase';

interface Specialist {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  is_online: boolean;
  years_experience: number;
}

interface SpecialistDirectoryProps {
  caseId?: string;
  onAssign?: (specialistId: string) => void;
}

export default function SpecialistDirectory({
  caseId,
  onAssign,
}: SpecialistDirectoryProps) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    null,
  );
  const [assigning, setAssigning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online'>('online');

  useEffect(() => {
    fetchSpecialists();
  }, [filter]);

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('specialists')
        .select('*')
        .order('is_online', { ascending: false })
        .order('years_experience', { ascending: false });

      if (filter === 'online') {
        query = query.eq('is_online', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSpecialists(data || []);
    } catch (error) {
      console.error('Error fetching specialists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSpecialist || !caseId) return;

    setAssigning(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/assign-specialist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            caseId,
            specialistId: selectedSpecialist,
            phpId: user?.id,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to assign specialist');

      if (onAssign) {
        onAssign(selectedSpecialist);
      }
    } catch (error) {
      console.error('Error assigning specialist:', error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader userName="Specialist Directory" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'online' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('online')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'online' && styles.filterTextActive,
            ]}
          >
            Online ({specialists.filter((s) => s.is_online).length})
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
            All Specialists
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSpecialists} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : specialists.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No specialists available</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'online'
                ? 'No specialists are currently online'
                : 'No specialists registered yet'}
            </Text>
          </View>
        ) : (
          specialists.map((specialist) => (
            <TouchableOpacity
              key={specialist.id}
              style={[
                styles.specialistCard,
                selectedSpecialist === specialist.user_id &&
                  styles.specialistCardSelected,
              ]}
              onPress={() => setSelectedSpecialist(specialist.user_id)}
            >
              {/* Selection Indicator */}
              <View style={styles.selectionIndicator}>
                {selectedSpecialist === specialist.user_id ? (
                  <CheckCircle size={24} color={Colors.light.primary} />
                ) : (
                  <Circle size={24} color="#C7C7CC" />
                )}
              </View>

              {/* Specialist Info */}
              <View style={styles.specialistInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.specialistName}>
                    {specialist.full_name}
                  </Text>
                  {specialist.is_online && (
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.specialtyText}>{specialist.specialty}</Text>
                <Text style={styles.experienceText}>
                  {specialist.years_experience} years experience
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Assign Button (only show if caseId provided) */}
      {caseId && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.assignButton,
              (!selectedSpecialist || assigning) && styles.assignButtonDisabled,
            ]}
            onPress={handleAssign}
            disabled={!selectedSpecialist || assigning}
          >
            {assigning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.assignButtonText}>
                Assign & Notify Specialist
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  specialistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialistCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  selectionIndicator: {
    marginRight: 12,
  },
  specialistInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  specialtyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  experienceText: {
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  assignButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  assignButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
