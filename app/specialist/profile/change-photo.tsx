import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ChevronLeft, Image as ImageIcon, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChangePhotoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change photo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Photo Preview */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=400&h=400&auto=format&fit=crop',
            }}
            style={styles.avatar}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={() => router.push('/specialist/profile/crop-photo')}
          >
            <ImageIcon color="#007AFF" size={24} />
            <Text style={styles.sourceButtonText}>Upload photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceButton}
            onPress={() => router.push('/specialist/profile/crop-photo')}
          >
            <Camera color="#007AFF" size={24} />
            <Text style={styles.sourceButtonText}>Take photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            console.log('Saving Photo Changes...');
            router.back();
          }}
        >
          <LinearGradient
            colors={['#00C6FF', '#0072FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sourceButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
