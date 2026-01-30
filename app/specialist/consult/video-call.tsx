import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  RotateCw,
  Briefcase,
  PhoneOff,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import MedicalToolkitOverlay from '../../../components/specialist/MedicalToolkitOverlay';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isToolkitVisible, setIsToolkitVisible] = useState(false);

  const endCall = () => {
    router.replace('/consult/call-ended');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Patient View (Main Content - Placeholder image of doctor for simulation) */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1000',
        }}
        style={styles.mainVideo}
      />

      {/* PiP View (Specialist View) */}
      <View style={styles.pipContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/300?u=sonya' }}
          style={styles.pipVideo}
        />
        {isMuted && (
          <View style={styles.pipOverlay}>
            <MicOff color="#FFFFFF" size={14} />
          </View>
        )}
      </View>

      {/* Top Info (Optional but helpful for realism) */}
      <SafeAreaView style={styles.topInfo}>
        <Text style={styles.callingText}>Calling...</Text>
      </SafeAreaView>

      {/* Bottom Controls */}
      <SafeAreaView style={styles.controlsContainer}>
        <View style={styles.controlsBackground}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isVideoOff && styles.controlButtonActive,
            ]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? (
              <VideoOff color="#EB5757" size={24} />
            ) : (
              <Video color="#FFFFFF" size={24} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff color="#EB5757" size={24} />
            ) : (
              <Mic color="#FFFFFF" size={24} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButtonLarge}
            onPress={() => setIsToolkitVisible(true)}
          >
            <Briefcase color="#1C1C1E" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <RotateCw color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
            <PhoneOff color="#FFFFFF" size={24} fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <MedicalToolkitOverlay
        visible={isToolkitVisible}
        onClose={() => setIsToolkitVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainVideo: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  pipContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 100,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#1C1C1E',
  },
  pipVideo: {
    flex: 1,
  },
  pipOverlay: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 8,
  },
  topInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  callingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  controlsBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 40,
    gap: 12,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  controlButtonLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  endCallButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EB5757',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
