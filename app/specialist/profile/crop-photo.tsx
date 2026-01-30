import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function CropPhotoScreen() {
  const router = useRouter();
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

  // Animated styles for the image
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${straightenValue}deg` },
      ] as any,
    };
  });

  const handleSavePhoto = () => {
    // Logic to save transformations
    console.log("Saving photo with transforms:", {
      straighten: straightenValue,
      scale: scale.value,
    });
    router.back();
  };

  const handleUndoChanges = () => {
    setStraightenValue(0);
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
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
          <Text style={styles.headerTitle}>Crop photo</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.cropContainer}>
            <View style={styles.imageWrapper}>
              <GestureDetector gesture={composedGestures}>
                <Animated.Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=600&h=600&auto=format&fit=crop",
                  }}
                  style={[styles.image, animatedStyle]}
                  resizeMode="cover"
                />
              </GestureDetector>

              {/* Circular Overlay with Grid */}
              <View style={styles.overlay} pointerEvents="none">
                <View style={styles.circle}>
                  <View style={styles.gridRow} />
                  <View style={styles.gridRow} />
                  <View style={styles.gridCol} />
                  <View style={styles.gridCol} />
                </View>
              </View>
            </View>
          </View>

          {/* Straighten Control */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Straighten</Text>
              <Text style={styles.sliderValue}>
                {Math.round(straightenValue)}%
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-45}
              maximumValue={45}
              value={straightenValue}
              onValueChange={setStraightenValue}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#C7C7CC"
              thumbTintColor="#007AFF"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleSavePhoto}
            >
              <LinearGradient
                colors={["#00C6FF", "#0072FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.undoButton}
              onPress={handleUndoChanges}
            >
              <Text style={styles.undoButtonText}>Undo changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#495057",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cropContainer: {
    width: width - 40,
    height: width - 40,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#E5E5EA",
    marginBottom: 40,
  },
  imageWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#E5E5EA",
  },
  image: {
    width: "120%",
    height: "120%",
    position: "absolute",
    alignSelf: "center",
    top: "-10%", // Center the oversized image
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(73, 80, 87, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  circle: {
    width: width - 80,
    height: width - 80,
    borderRadius: (width - 80) / 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  gridRow: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginVertical: (width - 80) / 6,
  },
  gridCol: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: (width - 80) / 6,
  },
  sliderSection: {
    marginBottom: 40,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 15,
    color: "#495057",
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 15,
    color: "#495057",
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
  },
  saveButtonWrapper: {
    flex: 1,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  undoButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  undoButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
