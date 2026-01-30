import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  Volume2,
  Grid3x3,
} from 'lucide-react-native';
import AudioQuickActionsModal from '../../../components/AudioQuickActionsModal';

const { width } = Dimensions.get('window');

type CallStatus = 'ringing' | 'connected' | 'ended' | 'missed';

interface ProviderInfo {
  id: string;
  full_name: string;
  specialty: string;
  avatar_url?: string;
}

export default function AudioConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConsultationData();
    simulateCallConnection();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  const loadConsultationData = async () => {
    const { data: consultation } = await supabase
      .from('consultations')
      .select(
        `
        *,
        provider:provider_id (
          id,
          user_profiles (full_name, avatar_url)
        )
      `,
      )
      .eq('id', id)
      .maybeSingle();

    if (consultation && consultation.provider) {
      const providerProfile = consultation.provider.user_profiles;
      setProvider({
        id: consultation.provider.id,
        full_name: providerProfile?.full_name || 'Healthcare Provider',
        specialty: consultation.specialty || 'General Practice',
        avatar_url: providerProfile?.avatar_url,
      });
    }
  };

  const simulateCallConnection = () => {
    setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}mins : ${secs.toString().padStart(2, '0')} Secs`;
  };

  const handleEndCall = async () => {
    setCallStatus('ended');

    await supabase
      .from('consultations')
      .update({
        call_status: 'ended',
        video_ended_at: new Date().toISOString(),
      })
      .eq('id', id);

    setTimeout(() => {
      router.back();
    }, 3000);
  };

  const handleCallBack = () => {
    setCallStatus('ringing');
    setCallDuration(0);
    simulateCallConnection();
  };

  const handleClose = () => {
    router.back();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
  };

  if (callStatus === 'ringing') {
    return (
      <View style={styles.container}>
        <View style={styles.medicalPattern} />

        <Text style={styles.statusText}>Ringing....</Text>

        <View style={styles.providerContainer}>
          <View style={styles.avatarContainer}>
            {provider?.avatar_url ? (
              <Image
                source={{ uri: provider.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {provider?.full_name?.charAt(0) || 'D'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.providerName}>
            {provider?.full_name || 'Healthcare Provider'}
          </Text>
          <Text style={styles.providerSpecialty}>
            {provider?.specialty || 'General Practice'}
          </Text>
        </View>

        <View style={styles.callControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <View style={styles.controlIconWhite}>
              {isMuted ? (
                <MicOff size={28} color="#1F2937" strokeWidth={2} />
              ) : (
                <Mic size={28} color="#1F2937" strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlIconWhite}>
              <Video size={28} color="#1F2937" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlIconWhite}>
              <Volume2 size={28} color="#1F2937" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Phone size={28} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (callStatus === 'connected') {
    return (
      <View style={styles.container}>
        <View style={styles.medicalPattern} />

        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>

        <View style={styles.providerContainer}>
          <View style={styles.avatarContainer}>
            {provider?.avatar_url ? (
              <Image
                source={{ uri: provider.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {provider?.full_name?.charAt(0) || 'D'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.providerName}>
            {provider?.full_name || 'Healthcare Provider'}
          </Text>
          <Text style={styles.providerSpecialty}>
            {provider?.specialty || 'General Practice'}
          </Text>
        </View>

        <View style={styles.callControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <View style={styles.controlIconWhite}>
              {isMuted ? (
                <MicOff size={28} color="#1F2937" strokeWidth={2} />
              ) : (
                <Mic size={28} color="#1F2937" strokeWidth={2} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowQuickActions(true)}
          >
            <View style={styles.controlIconWhite}>
              <Grid3x3 size={28} color="#1F2937" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <View style={styles.controlIconWhite}>
              <Volume2 size={28} color="#1F2937" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Phone size={28} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <AudioQuickActionsModal
          visible={showQuickActions}
          onClose={() => setShowQuickActions(false)}
          onAction={handleQuickAction}
        />
      </View>
    );
  }

  if (callStatus === 'ended') {
    return (
      <View style={styles.container}>
        <View style={styles.medicalPattern} />

        <View style={styles.providerContainer}>
          <View style={styles.avatarContainer}>
            {provider?.avatar_url ? (
              <Image
                source={{ uri: provider.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {provider?.full_name?.charAt(0) || 'D'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.providerName}>
            {provider?.full_name || 'Healthcare Provider'}
          </Text>
          <Text style={styles.providerSpecialty}>
            {provider?.specialty || 'General Practice'}
          </Text>

          <Text style={styles.callEndedText}>Call ended</Text>
          <Text style={styles.finalDurationText}>
            {formatDuration(callDuration)}
          </Text>
        </View>

        <View style={styles.endCallActions}>
          <TouchableOpacity
            style={styles.callBackButton}
            onPress={handleCallBack}
          >
            <Phone size={32} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <PhoneOff size={32} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  medicalPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1F2937',
    opacity: 0.3,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  providerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 56,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  providerSpecialty: {
    fontSize: 18,
    fontWeight: '400',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  callEndedText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 40,
    textAlign: 'center',
  },
  finalDurationText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#D1D5DB',
    marginTop: 12,
    textAlign: 'center',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
  },
  controlIconWhite: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 32,
  },
  callBackButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
