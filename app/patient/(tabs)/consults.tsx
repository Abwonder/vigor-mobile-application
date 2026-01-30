import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

interface Consultation {
  id: string;
  provider_type: 'nurse' | 'specialist';
  status: string;
  created_at: string;
  conversation: {
    id: string;
    last_message: string | null;
    last_message_at: string | null;
  } | null;
  provider: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
    specialty?: string;
    credentials?: string;
  } | null;
}

export default function ConsultsScreen() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'nurse' | 'specialist'>(
    'nurse',
  );

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: consultationsData } = await supabase
        .from('consultations')
        .select(
          `
          id,
          provider_type,
          status,
          specialty,
          created_at,
          conversation_id,
          provider_id,
          conversations (
            id,
            last_message,
            last_message_at
          )
        `,
        )
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (consultationsData) {
        const consultationsWithProviders = await Promise.all(
          consultationsData.map(async (consultation: any) => {
            if (!consultation.provider_id) {
              return {
                ...consultation,
                conversation: consultation.conversations,
                provider: null,
              };
            }

            const { data: providerProfile } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, profile_picture_url')
              .eq('id', consultation.provider_id)
              .single();

            return {
              ...consultation,
              conversation: consultation.conversations,
              provider: providerProfile
                ? {
                    ...providerProfile,
                    specialty: consultation.specialty,
                    credentials: 'MBBS, FWACP',
                  }
                : null,
            };
          }),
        );

        setConsultations(consultationsWithProviders);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const filteredConsultations = consultations.filter(
    (c) => c.provider_type === selectedTab,
  );

  const renderConsultation = ({ item }: { item: Consultation }) => {
    const provider = item.provider;
    if (!provider) return null;

    const displayName =
      item.provider_type === 'nurse'
        ? `${provider.first_name || ''} ${provider.last_name || ''}`.trim()
        : `Dr. ${provider.first_name || ''} ${provider.last_name || ''}`.trim();

    const subtitle =
      item.provider_type === 'nurse'
        ? 'Public Health Professional'
        : provider.specialty
          ? `${provider.specialty}(${provider.credentials})`
          : 'Specialist';

    const lastMessage =
      item.conversation?.last_message || 'Click to start consultation';
    const isClickToStart = !item.conversation?.last_message;
    const isActive =
      item.status === 'active' || item.status === 'waiting_for_provider';

    return (
      <TouchableOpacity
        style={styles.consultationCard}
        onPress={() =>
          router.push({
            pathname: '/consultation/[id]',
            params: {
              id: item.id,
              providerName: displayName,
              providerType: item.provider_type,
              specialty: provider.specialty || '',
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          {provider.profile_picture_url ? (
            <Image
              source={{ uri: provider.profile_picture_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(provider.first_name?.[0] || 'D') +
                  (provider.last_name?.[0] || '')}
              </Text>
            </View>
          )}
          {isActive && <View style={styles.activeIndicator} />}
        </View>

        <View style={styles.consultationInfo}>
          <View style={styles.consultationHeader}>
            <Text style={styles.consultationName}>{displayName}</Text>
            <Text style={styles.consultationTime}>
              {formatTime(
                item.conversation?.last_message_at || item.created_at,
              )}
            </Text>
          </View>

          <Text style={styles.consultationSubtitle}>{subtitle}</Text>

          <Text
            style={[
              styles.lastMessage,
              isClickToStart && styles.clickToStartMessage,
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>

          {isActive && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Consults</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4D8" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consults</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Plus size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'nurse' && styles.activeTab]}
          onPress={() => setSelectedTab('nurse')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'nurse' && styles.activeTabText,
            ]}
          >
            Public Health Nurse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'specialist' && styles.activeTab]}
          onPress={() => setSelectedTab('specialist')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'specialist' && styles.activeTabText,
            ]}
          >
            Assigned Specialist
          </Text>
        </TouchableOpacity>
      </View>

      {filteredConsultations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No consultations yet</Text>
          <Text style={styles.emptyDescription}>
            {selectedTab === 'nurse'
              ? 'Start a consultation with a Public Health Nurse'
              : 'Complete triage to be assigned a specialist'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConsultations}
          renderItem={renderConsultation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F5F5F5',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  activeTab: {
    backgroundColor: '#E0F7FA',
    borderWidth: 2,
    borderColor: '#00B4D8',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#00B4D8',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  consultationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D47E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  consultationInfo: {
    flex: 1,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consultationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  consultationTime: {
    fontSize: 14,
    color: '#999',
  },
  consultationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  clickToStartMessage: {
    fontStyle: 'italic',
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D47E',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
