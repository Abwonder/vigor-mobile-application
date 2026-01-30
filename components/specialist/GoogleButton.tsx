import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleButton = ({
  onPress,
  disabled = false,
}: GoogleButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {/* Google Icon SVG - simplified version */}
        <View style={styles.googleIcon}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
      </View>
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4A4A4A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
    gap: 12,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  iconContainer: {
    width: 20,
    height: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4285F4",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
