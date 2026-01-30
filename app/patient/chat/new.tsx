import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, User } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  profile_picture_url: string | null;
}

export default function NewConversationScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, email, user_type, profile_picture_url',
        )
        .neq('id', user.id);

      if (profiles) {
        setUsers(profiles);
        setFilteredUsers(profiles);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
    setFilteredUsers(filtered);
  };

  const createConversation = async (otherUserId: string) => {
    if (!currentUserId || creating) return;

    setCreating(true);

    try {
      const { data: existingParticipant } = await supabase
        .from('conversation_participants')
        .select(
          `
          conversation_id,
          conversations!inner (
            id
          )
        `,
        )
        .eq('user_id', currentUserId);

      if (existingParticipant) {
        for (const participant of existingParticipant) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (otherParticipant) {
            const otherUser = users.find((u) => u.id === otherUserId);
            const displayName =
              `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim();
            const userTypeLabel =
              otherUser?.user_type === 'provider'
                ? 'Healthcare Provider'
                : 'Patient';

            router.replace({
              pathname: '/chat/[id]',
              params: {
                id: participant.conversation_id,
                name: displayName,
                userType: userTypeLabel,
              },
            });
            return;
          }
        }
      }

      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError || !newConversation) {
        throw convError;
      }

      const { error: participant1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConversation.id,
          user_id: currentUserId,
        });

      if (participant1Error) {
        throw participant1Error;
      }

      const { error: participant2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConversation.id,
          user_id: otherUserId,
        });

      if (participant2Error) {
        throw participant2Error;
      }

      const otherUser = users.find((u) => u.id === otherUserId);
      const displayName =
        `${otherUser?.first_name || ''} ${otherUser?.last_name || ''}`.trim();
      const userTypeLabel =
        otherUser?.user_type === 'provider' ? 'Healthcare Provider' : 'Patient';

      router.replace({
        pathname: '/chat/[id]',
        params: {
          id: newConversation.id,
          name: displayName,
          userType: userTypeLabel,
        },
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const renderUser = ({ item }: { item: UserProfile }) => {
    const displayName =
      `${item.first_name || ''} ${item.last_name || ''}`.trim() ||
      'Unknown User';
    const userTypeLabel =
      item.user_type === 'provider' ? 'Healthcare Provider' : 'Patient';

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => createConversation(item.id)}
        disabled={creating}
      >
        <View style={styles.avatarContainer}>
          {item.profile_picture_url ? (
            <Image
              source={{ uri: item.profile_picture_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(item.first_name?.[0] || '?') + (item.last_name?.[0] || '')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userType}>{userTypeLabel}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        <View style={styles.startChatIcon}>
          <User size={20} color="#0EA5E9" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Conversation</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
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
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Conversation</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {creating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.creatingText}>Creating conversation...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userType: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  startChatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  creatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
