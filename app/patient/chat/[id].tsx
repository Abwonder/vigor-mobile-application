import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Image as ImageIcon,
} from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachments: {
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
  }[];
  is_mine: boolean;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, userType } = useLocalSearchParams<{
    id: string;
    name: string;
    userType: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) {
      loadMessages();
      subscribeToMessages();
      subscribeToTypingIndicators();
    }
  }, [id]);

  useEffect(() => {
    if (currentUserId && id) {
      markMessagesAsRead();
    }
  }, [messages, currentUserId, id]);

  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: messagesData } = await supabase
        .from('messages')
        .select(
          `
          *,
          message_attachments (
            id,
            file_url,
            file_name,
            file_type
          )
        `,
        )
        .eq('conversation_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (messagesData) {
        const { data: readReceipts } = await supabase
          .from('message_read_receipts')
          .select('message_id')
          .in(
            'message_id',
            messagesData.map((m) => m.id),
          );

        const readMessageIds = new Set(
          readReceipts?.map((r) => r.message_id) || [],
        );

        const formattedMessages: Message[] = messagesData.map((msg) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          is_read: readMessageIds.has(msg.id),
          attachments: msg.message_attachments || [],
          is_mine: msg.sender_id === user.id,
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        () => {
          loadMessages();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts',
        },
        () => {
          loadMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTypingIndicators = () => {
    const channel = supabase
      .channel(`typing_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${id}`,
        },
        async (payload: any) => {
          if (payload.new && payload.new.user_id !== currentUserId) {
            setOtherUserTyping(payload.new.is_typing);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId) return;

    const unreadMessages = messages.filter((m) => !m.is_mine && !m.is_read);

    for (const message of unreadMessages) {
      await supabase.from('message_read_receipts').upsert(
        {
          message_id: message.id,
          user_id: currentUserId,
        },
        { onConflict: 'message_id,user_id' },
      );
    }

    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('user_id', currentUserId);
  };

  const updateTypingIndicator = async (typing: boolean) => {
    if (!currentUserId) return;

    await supabase.from('typing_indicators').upsert(
      {
        conversation_id: id,
        user_id: currentUserId,
        is_typing: typing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id,user_id' },
    );
  };

  const handleInputChange = (text: string) => {
    setNewMessage(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      updateTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingIndicator(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    updateTypingIndicator(false);
    setIsTyping(false);

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: id,
        sender_id: currentUserId,
        content: messageContent,
      });

      if (error) {
        Alert.alert('Error', 'Failed to send message');
        setNewMessage(messageContent);
      } else {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant permission to access your photo library',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleFileUpload(result.assets[0]);
    }
  };

  const handleFileUpload = async (file: any) => {
    if (!currentUserId) return;

    setSending(true);

    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, blob, {
          contentType: file.type || 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('message-attachments').getPublicUrl(filePath);

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: currentUserId,
          content: '[Image]',
        })
        .select()
        .single();

      if (messageError || !messageData) {
        throw messageError;
      }

      await supabase.from('message_attachments').insert({
        message_id: messageData.id,
        file_url: publicUrl,
        file_name: fileName,
        file_type: file.type || 'image/jpeg',
        file_size: file.fileSize || 0,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isImageMessage = item.attachments.length > 0;

    return (
      <View
        style={[
          styles.messageContainer,
          item.is_mine
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {isImageMessage && (
          <View style={styles.imageMessageContainer}>
            {item.attachments.map((attachment) => (
              <Image
                key={attachment.id}
                source={{ uri: attachment.file_url }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {item.content && item.content !== '[Image]' && (
          <View
            style={[
              styles.messageBubble,
              item.is_mine ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.is_mine ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}

        <View
          style={[styles.messageFooter, item.is_mine && styles.myMessageFooter]}
        >
          <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
          {item.is_mine && (
            <View style={styles.readReceipt}>
              {item.is_read ? (
                <CheckCheck size={14} color="#0EA5E9" />
              ) : (
                <Check size={14} color="#9CA3AF" />
              )}
            </View>
          )}
        </View>
      </View>
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
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.headerSubtitle}>{userType}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleImagePick}
          disabled={sending}
        >
          <Paperclip size={20} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={newMessage}
          onChangeText={handleInputChange}
          multiline
          maxLength={1000}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myMessage: {
    backgroundColor: '#0EA5E9',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#111827',
  },
  imageMessageContainer: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  myMessageFooter: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  readReceipt: {
    marginLeft: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    padding: 10,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
