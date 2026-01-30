import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  ChevronLeft,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
} from 'lucide-react-native';

interface CareTeamMember {
  id: string;
  type: string;
  name: string;
  specialty: string | null;
  organization: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_primary: boolean;
  notes: string | null;
}

export default function CareTeamScreen() {
  const [loading, setLoading] = useState(true);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);

  useEffect(() => {
    loadCareTeam();
  }, []);

  const loadCareTeam = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('care_team')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) setCareTeam(data);
    } catch (error) {
      console.error('Error loading care team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'primary_physician':
        return 'Primary Physician';
      case 'specialist':
        return 'Specialist';
      case 'hospital':
        return 'Hospital';
      default:
        return 'Other';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'primary_physician':
        return '#4CAF50';
      case 'specialist':
        return '#2196F3';
      case 'hospital':
        return '#FF9800';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Team</Text>
        <TouchableOpacity onPress={() => router.push('/care/care-team/add')}>
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {careTeam.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Care Team Members</Text>
            <Text style={styles.emptyText}>
              Add your doctors and healthcare providers to keep track of your
              care team
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/care/care-team/add')}
            >
              <Text style={styles.addButtonText}>Add Team Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          careTeam.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberTitleRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {member.is_primary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: `${getTypeColor(member.type)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        { color: getTypeColor(member.type) },
                      ]}
                    >
                      {getTypeLabel(member.type)}
                    </Text>
                  </View>
                </View>
              </View>

              {member.specialty && (
                <View style={styles.detailRow}>
                  <User size={16} color="#666" />
                  <Text style={styles.detailText}>{member.specialty}</Text>
                </View>
              )}

              {member.organization && (
                <View style={styles.detailRow}>
                  <Building size={16} color="#666" />
                  <Text style={styles.detailText}>{member.organization}</Text>
                </View>
              )}

              {member.phone && (
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={() => handleCall(member.phone!)}
                >
                  <Phone size={16} color="#007AFF" />
                  <Text style={[styles.detailText, styles.linkText]}>
                    {member.phone}
                  </Text>
                </TouchableOpacity>
              )}

              {member.email && (
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={() => handleEmail(member.email!)}
                >
                  <Mail size={16} color="#007AFF" />
                  <Text style={[styles.detailText, styles.linkText]}>
                    {member.email}
                  </Text>
                </TouchableOpacity>
              )}

              {member.address && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.detailText}>{member.address}</Text>
                </View>
              )}

              {member.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{member.notes}</Text>
                </View>
              )}
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberInfo: {
    flex: 1,
    gap: 8,
  },
  memberTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  primaryBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 13,
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
  linkText: {
    color: '#007AFF',
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
    color: '#1A1A1A',
    lineHeight: 20,
  },
});
