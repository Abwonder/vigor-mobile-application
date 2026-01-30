import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  isEnabled,
  onToggle,
}) => (
  <View style={styles.settingRow}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={styles.textWrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <Switch
      trackColor={{ false: "#E9E9EB", true: "#00D68F" }}
      thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
      ios_backgroundColor="#E9E9EB"
      onValueChange={onToggle}
      value={isEnabled}
      style={styles.switch}
    />
  </View>
);

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  switch: {
    transform: [
      { scaleX: Platform.OS === "ios" ? 0.8 : 1 },
      { scaleY: Platform.OS === "ios" ? 0.8 : 1 },
    ],
  },
});
