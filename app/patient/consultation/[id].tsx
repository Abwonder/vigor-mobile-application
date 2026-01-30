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
import { ChevronLeft, Phone, Video, Plus } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import SpecialistAssignmentCard from '../../../components/SpecialistAssignmentCard';
import DoctorRequestVitalsCard from '../../../components/DoctorRequestVitalsCard';
import QuickActionsModal from '../../../components/QuickActionsModal';
import { initiateVideoCall } from '../../../lib/videoConsultation';

interface Message {
  id: string;
  type:
    | 'user'
    | 'provider'
    | 'system'
    | 'specialist_card'
    | 'waiting'
    | 'consultation_live'
    | 'consultation_ended'
    | 'missed_call'
    | 'vitals_request';
  content: string;
  created_at: string;
  is_mine: boolean;
  metadata?: {
    doctorName?: string;
    doctorSpecialty?: string;
    doctorCredentials?: string;
    callTime?: string;
  };
}

interface ConsultationData {
  id: string;
  status: string;
  provider_type: 'nurse' | 'specialist';
  specialty: string | null;
  provider: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
  } | null;
}

export default function ConsultationChatScreen() {
  const router = useRouter();
  const { id, providerName, providerType, specialty } = useLocalSearchParams<{
    id: string;
    providerName: string;
    providerType: string;
    specialty: string;
  }>();

  const [consultation, setConsultation] = useState<ConsultationData | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [startingCall, setStartingCall] = useState(false);
  const [activeCallStatus, setActiveCallStatus] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      loadConsultation();
      loadMessages();
      loadCallStatus();
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (activeCallStatus === 'connected' && callStartTime) {
      callTimerRef.current = setInterval(() => {
        const start = new Date(callStartTime).getTime();
        const now = new Date().getTime();
        const duration = Math.floor((now - start) / 1000);
        setCallDuration(duration);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [activeCallStatus, callStartTime]);

  const loadCallStatus = async () => {
    try {
      const { data } = await supabase
        .from('consultations')
        .select('call_status, call_connected_at')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setActiveCallStatus(data.call_status);
        if (data.call_connected_at) {
          setCallStartTime(data.call_connected_at);
        }
      }
    } catch (error) {
      console.error('Error loading call status:', error);
    }
  };

  const loadConsultation = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('consultations')
        .select(
          `
          id,
          status,
          provider_type,
          specialty,
          provider_id,
          conversation_id
        `,
        )
        .eq('id', id)
        .single();

      if (data) {
        // Check if current user is the provider
        setIsProvider(data.provider_id === user.id);

        let providerData = null;
        if (data.provider_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_picture_url')
            .eq('id', data.provider_id)
            .single();

          providerData = profile;
        }

        setConsultation({
          ...data,
          provider: providerData,
        });
      }
    } catch (error) {
      console.error('Error loading consultation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: consultationData } = await supabase
        .from('consultations')
        .select('conversation_id, status, provider_type')
        .eq('id', id)
        .single();

      if (!consultationData?.conversation_id) {
        const mockMessages: Message[] = [];

        if (consultationData?.provider_type === 'nurse') {
          mockMessages.push({
            id: '1',
            type: 'provider',
            content:
              "Hello, I've reviewed your symptoms and I think it's best for you to speak with a specialist who can take a closer look.",
            created_at: new Date().toISOString(),
            is_mine: false,
          });

          if (consultationData.status === 'waiting_for_provider') {
            mockMessages.push({
              id: '2',
              type: 'system',
              content: 'You have been connected with a Cardiologist',
              created_at: new Date().toISOString(),
              is_mine: false,
            });

            mockMessages.push({
              id: '3',
              type: 'specialist_card',
              content: '',
              created_at: new Date().toISOString(),
              is_mine: false,
            });

            mockMessages.push({
              id: '4',
              type: 'user',
              content: 'Thank you.',
              created_at: new Date().toISOString(),
              is_mine: true,
            });
          }
        } else if (consultationData?.provider_type === 'specialist') {
          mockMessages.push({
            id: '1',
            type: 'provider',
            content: 'Hello! I reviewed your case.',
            created_at: new Date().toISOString(),
            is_mine: false,
          });

          mockMessages.push({
            id: '2',
            type: 'provider',
            content:
              "Okay, that's important. Do you currently check your blood pressure at home?",
            created_at: new Date().toISOString(),
            is_mine: false,
          });

          mockMessages.push({
            id: '3',
            type: 'user',
            content: 'Yes, I have a machine at home.',
            created_at: new Date().toISOString(),
            is_mine: true,
          });

          mockMessages.push({
            id: '4',
            type: 'provider',
            content:
              'Good. Could you share your most recent readings with me so I can review them as part of your assessment?',
            created_at: new Date().toISOString(),
            is_mine: false,
          });

          mockMessages.push({
            id: '5',
            type: 'vitals_request',
            content: '',
            created_at: new Date().toISOString(),
            is_mine: false,
          });

          if (consultationData.status === 'waiting_for_provider') {
            mockMessages.push({
              id: '6',
              type: 'waiting',
              content: 'Waiting for doctor to join',
              created_at: new Date().toISOString(),
              is_mine: false,
            });
          }
        }

        setMessages(mockMessages);
        setLoading(false);
        return;
      }

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', consultationData.conversation_id)
        .order('created_at', { ascending: true });

      if (messagesData) {
        const formattedMessages: Message[] = messagesData.map((msg) => ({
          id: msg.id,
          type: msg.sender_id === user.id ? 'user' : 'provider',
          content: msg.content,
          created_at: msg.created_at,
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

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_mine: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setSending(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatCallDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}Sec`;
  };

  const handleStartVideoCall = async () => {
    if (startingCall) return;

    setStartingCall(true);

    try {
      const result = await initiateVideoCall(id);

      if (result.success) {
        // Navigate to video consultation screen
        router.push(`/video-consultation/${id}`);
      } else {
        Alert.alert('Error', result.error || 'Failed to start video call');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      Alert.alert('Error', 'Failed to start video call');
    } finally {
      setStartingCall(false);
    }
  };

  const handleStartAudioCall = async () => {
    try {
      // Update consultation call status
      await supabase
        .from('consultations')
        .update({
          call_status: 'ringing',
          call_type: 'audio_only',
          call_initiated_at: new Date().toISOString(),
          call_initiated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id);

      // Navigate to audio consultation screen
      router.push(`/audio-consultation/${id}`);
    } catch (error) {
      console.error('Error starting audio call:', error);
      Alert.alert('Error', 'Failed to start audio call');
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

  const handleShareVitals = () => {
    setShowQuickActions(false);
    Alert.alert('Share Vitals', 'Vitals sharing feature coming soon');
  };

  const handleUploadPhoto = () => {
    setShowQuickActions(false);
    Alert.alert('Upload Photo', 'Photo upload feature coming soon');
  };

  const handleUploadTestResult = () => {
    setShowQuickActions(false);
    Alert.alert('Upload Test Result', 'Test result upload feature coming soon');
  };

  const handleNewSymptoms = () => {
    setShowQuickActions(false);
    router.push('/find-care');
  };

  const handleUploadPrescription = () => {
    setShowQuickActions(false);
    Alert.alert(
      'Upload Prescription',
      'Prescription upload feature coming soon',
    );
  };

  const handleRequestRefill = () => {
    setShowQuickActions(false);
    Alert.alert('Request Refill', 'Refill request feature coming soon');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.content}</Text>
        </View>
      );
    }

    if (item.type === 'waiting') {
      return (
        <View style={styles.waitingMessageContainer}>
          <Text style={styles.waitingMessage}>{item.content}</Text>
        </View>
      );
    }

    if (item.type === 'consultation_live') {
      return (
        <View style={styles.consultationLiveContainer}>
          <Text style={styles.consultationLiveMessage}>{item.content}</Text>
        </View>
      );
    }

    if (item.type === 'consultation_ended') {
      return (
        <View style={styles.consultationEndedContainer}>
          <Text style={styles.consultationEndedMessage}>{item.content}</Text>
        </View>
      );
    }

    if (item.type === 'missed_call') {
      return (
        <View style={styles.missedCallCard}>
          <View style={styles.missedCallHeader}>
            <Phone size={20} color="#EF4444" strokeWidth={2} />
            <Text style={styles.missedCallTitle}>Missed Consultation</Text>
            <Text style={styles.missedCallTime}>
              {item.metadata?.callTime || '9:00 AM'}
            </Text>
          </View>

          <View style={styles.missedCallDoctorInfo}>
            <View style={styles.missedCallAvatar}>
              <Text style={styles.missedCallAvatarText}>
                {item.metadata?.doctorName?.charAt(0) || 'D'}
              </Text>
            </View>
            <View style={styles.missedCallDoctorText}>
              <Text style={styles.missedCallDoctorName}>
                {item.metadata?.doctorName || 'Dr. Amelia Hart'}
              </Text>
              <Text style={styles.missedCallDoctorSpecialty}>
                {item.metadata?.doctorSpecialty || 'Cardiologist'}
                {item.metadata?.doctorCredentials
                  ? `(${item.metadata.doctorCredentials})`
                  : '(MBBS, FWACP)'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.rescheduleButton}>
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'specialist_card') {
      return (
        <SpecialistAssignmentCard
          specialistId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          specialistName="Dr. Amelia Hart"
          specialty="Cardiologist"
          credentials="MBBS, FWACP"
          onStartConsultation={() => {}}
        />
      );
    }

    if (item.type === 'vitals_request') {
      return <DoctorRequestVitalsCard onShareVitals={handleShareVitals} />;
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.is_mine
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
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
        <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B4D8" />
        </View>
      </View>
    );
  }

  const displayName = providerName || 'Healthcare Provider';
  const subtitle =
    providerType === 'nurse'
      ? 'Public Health Professional'
      : specialty
        ? `Cardiologist (MBBS, FWACP)`
        : 'Specialist';

  const isNurse = consultation?.provider_type === 'nurse';
  const statusText = isNurse ? 'On duty – Ready to Assist' : '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {consultation?.provider?.profile_picture_url ? (
            <Image
              source={{ uri: consultation.provider.profile_picture_url }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{displayName[0]}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{displayName}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleStartAudioCall}
            disabled={startingCall}
          >
            <Phone size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleStartVideoCall}
            disabled={startingCall}
          >
            {startingCall ? (
              <ActivityIndicator size="small" color="#0EA5E9" />
            ) : (
              <Video size={24} color="#000" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {activeCallStatus === 'connected' && (
        <View style={styles.liveCallBanner}>
          <Text style={styles.liveCallText}>
            Live Consultation{' '}
            {callStartTime
              ? new Date(callStartTime)
                  .toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                  .toUpperCase()
              : ''}{' '}
            -{' '}
            {new Date()
              .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
              .toUpperCase()}
          </Text>
          <Text style={styles.liveCallDuration}>
            {formatCallDuration(callDuration)}
          </Text>
        </View>
      )}

      {statusText && !activeCallStatus && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}

      <View style={styles.chatBackground}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setShowQuickActions(true)}
        >
          <Plus size={24} color="#666" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Text Message"
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
      </View>

      <QuickActionsModal
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onUploadPhoto={handleUploadPhoto}
        onUploadTestResult={handleUploadTestResult}
        onNewSymptoms={handleNewSymptoms}
        onUploadPrescription={handleUploadPrescription}
        onRequestRefill={handleRequestRefill}
        onShareVitals={handleShareVitals}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#F5F5F5',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  callButton: {
    padding: 4,
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  liveCallBanner: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveCallText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  liveCallDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  statusBanner: {
    backgroundColor: '#E0F7FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#E5E5E5',
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myMessage: {
    backgroundColor: '#0099FF',
  },
  otherMessage: {
    backgroundColor: '#FFF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMessage: {
    backgroundColor: '#D1D5DB',
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  waitingMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  waitingMessage: {
    backgroundColor: '#FFF',
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  consultationLiveContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  consultationLiveMessage: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    fontWeight: '500',
  },
  consultationEndedContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  consultationEndedMessage: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    fontWeight: '500',
  },
  missedCallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missedCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  missedCallTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  missedCallTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  missedCallDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  missedCallAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedCallAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  missedCallDoctorText: {
    flex: 1,
  },
  missedCallDoctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  missedCallDoctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  rescheduleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
  },
});
