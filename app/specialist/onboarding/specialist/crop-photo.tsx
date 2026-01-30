import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../../../constants/Colors';
import { Button } from '../../../../components/specialist/Button';
import { ProgressIndicator } from '../../../../components/specialist/ProgressIndicator';

function CropPhotoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;

  const [straightenValue, setStraightenValue] = useState(0);

  // Shared values for gestures (Zoom only)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pinch Gesture - Zoom only
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      // Constraint: Min scale 1, Max scale 5
      const nextScale = savedScale.value * e.scale;
      scale.value = Math.max(1, Math.min(nextScale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Combine gestures (Zoom only)
  const composedGestures = pinchGesture;

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${straightenValue}deg` },
      ] as any,
    };
  });

  const handleSavePhoto = () => {
    // TODO: Apply transformations using expo-image-manipulator
    console.log('Saving photo with transforms:', {
      straighten: straightenValue,
      scale: scale.value,
    });
    router.push('/specialist/onboarding/specialist/provider-consent');
  };

  const handleUndoChanges = () => {
    // Reset React state
    setStraightenValue(0);
    // Reset Reanimated values
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Crop photo',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 16,
              fontWeight: '600',
              color: Colors.light.text,
            },
            headerShadowVisible: false,
            headerTintColor: Colors.light.text,
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
          }}
        />

        <View style={styles.content}>
          <ProgressIndicator currentStep={3} totalSteps={4} />

          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <GestureDetector gesture={composedGestures}>
                <Animated.Image
                  source={{ uri: imageUri }}
                  style={[styles.image, animatedStyle]}
                  resizeMode="cover"
                />
              </GestureDetector>
              <View style={styles.cropOverlay} pointerEvents="none">
                <View style={styles.cropCircle}>
                  <View style={styles.gridLineVerticalLeft} />
                  <View style={styles.gridLineVerticalRight} />
                  <View style={styles.gridLineHorizontalTop} />
                  <View style={styles.gridLineHorizontalBottom} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Straighten</Text>
              <Text style={styles.sliderValue}>
                {Math.round(straightenValue)}°
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-45}
              maximumValue={45}
              value={straightenValue}
              onValueChange={setStraightenValue}
              minimumTrackTintColor={Colors.light.primary}
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor={Colors.light.primary}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                title="Save photo"
                onPress={handleSavePhoto}
                variant="primary"
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button
                title="Undo changes"
                onPress={handleUndoChanges}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    maxHeight: 400,
    position: 'relative',
    backgroundColor: '#808080',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cropOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cropCircle: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'solid',
    position: 'relative',
  },
  gridLineVerticalLeft: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridLineVerticalRight: {
    position: 'absolute',
    left: '66.66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridLineHorizontalTop: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridLineHorizontalBottom: {
    position: 'absolute',
    top: '66.66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  controlsContainer: {
    marginBottom: 24,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  sliderValue: {
    fontSize: 14,
    color: Colors.light.textGray,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: Colors.light.background,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});
export default CropPhotoScreen;
