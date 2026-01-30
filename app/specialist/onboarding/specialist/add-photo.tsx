import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../../constants/Colors';
import { Button } from '../../../../components/specialist/Button';
import { ProgressIndicator } from '../../../../components/specialist/ProgressIndicator';
import { PhotoUploadButtons } from '../../../../components/specialist/PhotoUploadButtons';

export default function AddPhotoScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // TODO: Get actual user name from previous screens or context
  const userInitials = 'AH'; // Amelia Hart

  const requestPermissions = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      // Navigate to crop screen
      router.push({
        pathname: '/specialist/onboarding/specialist/crop-photo',
        params: { imageUri: uri },
      });
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your camera.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      // Navigate to crop screen
      router.push({
        pathname: '/specialist/onboarding/specialist/crop-photo',
        params: { imageUri: uri },
      });
    }
  };

  const handleNext = () => {
    if (photoUri) {
      router.push('/specialist/onboarding/specialist/provider-consent');
    }
  };

  const handleSkip = () => {
    router.push('/specialist/onboarding/specialist/provider-consent');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTintColor: Colors.light.text,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ProgressIndicator currentStep={3} totalSteps={4} />

          <Text style={styles.title}>
            Add your photo,{' '}
            <Text style={styles.titleGray}>
              patients and sponsors will see this on your profile.
            </Text>
          </Text>

          <View style={styles.photoContainer}>
            <View style={styles.photoCircle}>
              {photoUri ? (
                <Text>Photo</Text>
              ) : (
                <Text style={styles.initials}>{userInitials}</Text>
              )}
            </View>
          </View>

          <PhotoUploadButtons
            onUpload={handleUploadPhoto}
            onTakePhoto={handleTakePhoto}
          />

          <View style={styles.footer}>
            <Button
              title="Next"
              onPress={handleNext}
              disabled={!photoUri}
              variant="primary"
            />
            <TouchableOpacity style={styles.skipLink} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 32,
    lineHeight: 28,
  },
  titleGray: {
    fontWeight: 'normal',
    color: Colors.light.textGray,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 72,
    fontWeight: '600',
    color: Colors.light.text,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  skipLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
