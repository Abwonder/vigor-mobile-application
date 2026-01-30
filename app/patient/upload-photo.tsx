import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ImagePlus, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function UploadPhotoScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [initials, setInitials] = useState('SQ');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to upload photos');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const handleNext = () => {
    router.push({ pathname: '/consent', params: { role, photo: imageUri || '' } });
  };

  const handleSkip = () => {
    router.push({ pathname: '/consent', params: { role } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegmentInactive} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Upload Your Profile Picture – <Text style={styles.subtitle}>This will appear on your VigorCare account.</Text>
        </Text>

        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUploadPhoto}>
            <ImagePlus size={20} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Upload photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <Camera size={20} color="#0EA5E9" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Take photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !imageUri && styles.nextButtonInactive]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, !imageUri && styles.nextButtonTextInactive]}>
            Next
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  progressSegmentInactive: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  initialsText: {
    fontSize: 72,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  nextButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextInactive: {
    color: '#9CA3AF',
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: '600',
  },
});
