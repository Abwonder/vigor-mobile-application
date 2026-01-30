import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {
  Mic,
  MicOff,
  Briefcase,
  PhoneOff,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import MedicalToolkitOverlay from '../../../components/specialist/MedicalToolkitOverlay';

const { width } = Dimensions.get('window');

export default function AudioCallScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'ringing' | 'active'>('ringing');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isToolkitVisible, setIsToolkitVisible] = useState(false);

  useEffect(() => {
    // Simulate answering after 3 seconds
    const ringingTimeout = setTimeout(() => {
      setStatus('active');
    }, 3000);

    return () => clearTimeout(ringingTimeout);
  }, []);

  useEffect(() => {
    let interval: any;
    if (status === 'active') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}mins : ${secs.toString().padStart(2, '0')} Secs`;
  };

  const endCall = () => {
    router.replace('/specialist/consult/call-ended');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Pattern */}
      <ImageBackground
        source={require('../../../assets/vigor-logo.jpeg')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.statusText}>
              {status === 'ringing' ? 'Ringing....' : formatTime(timer)}
            </Text>
          </View>

          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1000',
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>Dr. Amelia Hart</Text>
            <Text style={styles.specialty}>Cardiologist</Text>
          </View>

          <View style={styles.controlsContainer}>
            <View style={styles.controlsBackground}>
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

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isSpeakerOn && styles.controlButtonActive,
                ]}
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? (
                  <Volume2 color="#1C1C1E" size={24} />
                ) : (
                  <Volume2 color="#FFFFFF" size={24} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                <PhoneOff color="#FFFFFF" size={24} fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

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
    backgroundColor: '#1C1C1E',
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.1,
    resizeMode: 'repeat',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -100,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#8E8E93',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlsBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 40,
    gap: 16,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
