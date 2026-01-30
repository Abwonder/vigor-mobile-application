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
import { MessageCircle, Plus } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  other_participant: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
    user_type: string;
  } | null;
  unread_count: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(
          `
          conversation_id,
          last_read_at,
          conversations (
            id,
            created_at,
            updated_at,
            last_message,
            last_message_at
          )
        `,
        )
        .eq('user_id', user.id);

      if (!participants) {
        setLoading(false);
        return;
      }

      const conversationsWithParticipants = await Promise.all(
        participants.map(async (p: any) => {
          const conv = p.conversations;

          const { data: otherParticipants } = await supabase
            .from('conversation_participants')
            .select(
              `
              user_id,
              profiles (
                id,
                first_name,
                last_name,
                profile_picture_url,
                user_type
              )
            `,
            )
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .limit(1)
            .single();

          const { data: unreadMessages, count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .gt('created_at', p.last_read_at || new Date(0).toISOString());

          return {
            ...conv,
            other_participant: otherParticipants?.profiles || null,
            unread_count: count || 0,
          };
        }),
      );

      conversationsWithParticipants.sort((a, b) => {
        const dateA = a.last_message_at || a.created_at;
        const dateB = b.last_message_at || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setConversations(conversationsWithParticipants);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          loadConversations();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          loadConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const participant = item.other_participant;
    if (!participant) return null;

    const displayName =
      `${participant.first_name || ''} ${participant.last_name || ''}`.trim() ||
      'Unknown User';
    const userTypeLabel =
      participant.user_type === 'provider' ? 'Healthcare Provider' : 'Patient';

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() =>
          router.push({
            pathname: '/chat/[id]',
            params: {
              id: item.id,
              name: displayName,
              userType: userTypeLabel,
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          {participant.profile_picture_url ? (
            <Image
              source={{ uri: participant.profile_picture_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(participant.first_name?.[0] || '?') +
                  (participant.last_name?.[0] || '')}
              </Text>
            </View>
          )}
          {item.unread_count > 0 && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{displayName}</Text>
            <Text style={styles.conversationTime}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text style={styles.userType}>{userTypeLabel}</Text>
            {item.last_message && (
              <Text
                style={[
                  styles.lastMessage,
                  item.unread_count > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {item.last_message}
              </Text>
            )}
          </View>
        </View>

        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
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
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={() => router.push('/chat/new')}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MessageCircle size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyDescription}>
            Start a conversation with a healthcare provider or patient
          </Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={() => router.push('/chat/new')}
          >
            <Text style={styles.startChatText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationFooter: {
    gap: 4,
  },
  userType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
