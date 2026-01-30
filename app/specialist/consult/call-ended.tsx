import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Phone, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CallEndedScreen() {
  const router = useRouter();

  const handleRedial = () => {
    router.replace('/specialist/consult/video-call');
  };

  const handleClose = () => {
    router.replace('/specialist/(tabs)/consult');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1000',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Dr. Amelia Hart</Text>
          <Text style={styles.specialty}>Cardiologist</Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.statusLabel}>Call ended</Text>
            <Text style={styles.duration}>23 mins : 45 sec</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.redialButton}
              onPress={handleRedial}
            >
              <Phone color="#FFFFFF" size={28} fill="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X color="#FFFFFF" size={28} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Background Pattern (Simulated) */}
      <View style={styles.backgroundPattern} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E', // Dark background as in design
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
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
    marginBottom: 40,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EB5757',
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 32,
  },
  redialButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EB5757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1C1C1E',
    opacity: 0.05,
    // Note: In a real app we'd use a pattern image here
  },
});
