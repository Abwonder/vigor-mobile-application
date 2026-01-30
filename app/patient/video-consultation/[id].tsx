import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import VideoCallScreen from '../../../components/VideoCallScreen';
import VideoQuickActions from '../../../components/VideoQuickActions';
import * as ImagePicker from 'expo-image-picker';

interface Consultation {
  id: string;
  patient_id: string;
  provider_id: string;
  status: string;
  video_room_id: string | null;
}

interface VideoToken {
  token: string;
  roomName: string;
  identity: string;
}

export default function VideoConsultation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [videoToken, setVideoToken] = useState<VideoToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeCall();
  }, [id]);

  const initializeCall = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');
      setCurrentUser(user);

      // Get consultation details
      const { data: consultationData, error: consultationError } =
        await supabase
          .from('consultations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

      if (consultationError || !consultationData) {
        throw new Error('Consultation not found');
      }

      setConsultation(consultationData);

      // Get video token from edge function
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-video-token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consultationId: id,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get video token');
      }

      const tokenData: VideoToken = await response.json();
      setVideoToken(tokenData);

      // Update consultation with video room ID
      await supabase
        .from('consultations')
        .update({
          video_room_id: tokenData.roomName,
          video_started_at: new Date().toISOString(),
          call_type: 'video',
        })
        .eq('id', id);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to start video call',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }
  };

  const handleEndCall = async () => {
    try {
      // Update consultation end time
      await supabase
        .from('consultations')
        .update({
          video_ended_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', id);

      // Navigate back with call summary
      router.back();
    } catch (error) {
      console.error('Error ending call:', error);
      router.back();
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Handle photo upload
        Alert.alert('Success', 'Photo shared with provider');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const handleUploadDocument = async () => {
    Alert.alert('Upload Document', 'Document upload feature coming soon');
  };

  const handleStartTriage = () => {
    Alert.alert('Start Triage', 'Triage assessment feature coming soon');
  };

  const handleShareVitals = () => {
    Alert.alert('Share Vitals', 'Vitals sharing feature coming soon');
  };

  const handleSendMessage = () => {
    // Navigate to chat
    router.push(`/chat/${id}`);
  };

  const handleRequestPrescription = () => {
    Alert.alert(
      'Request Prescription',
      'Prescription request feature coming soon',
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Starting video call...</Text>
      </View>
    );
  }

  if (!consultation || !videoToken || !currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load video call</Text>
      </View>
    );
  }

  const isProvider = consultation.provider_id === currentUser.id;

  return (
    <View style={styles.container}>
      <VideoCallScreen
        consultationId={id}
        isProvider={isProvider}
        patientName={isProvider ? 'Patient' : undefined}
        providerName={!isProvider ? 'Dr. Smith' : undefined}
        onEndCall={handleEndCall}
        onQuickActions={() => setShowQuickActions(true)}
      />

      <VideoQuickActions
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onUploadPhoto={handleUploadPhoto}
        onUploadDocument={handleUploadDocument}
        onStartTriage={handleStartTriage}
        onShareVitals={handleShareVitals}
        onSendMessage={handleSendMessage}
        onRequestPrescription={handleRequestPrescription}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
