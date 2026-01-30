import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronRight, Edit3 } from "lucide-react-native";

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconWrapper}>{icon}</View>
    <View style={styles.menuTextContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
    <ChevronRight color="#C7C7CC" size={20} />
  </TouchableOpacity>
);

interface ProfileSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  onEdit?: () => void;
}

export const ProfileSectionHeader: React.FC<ProfileSectionHeaderProps> = ({
  icon,
  title,
  onEdit,
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      {icon}
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
    {onEdit && (
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Edit3 color="#1C1C1E" size={20} />
      </TouchableOpacity>
    )}
  </View>
);

interface SummaryInfoRowProps {
  label: string;
  value: string;
  isBoldValue?: boolean;
}

export const SummaryInfoRow: React.FC<SummaryInfoRowProps> = ({
  label,
  value,
  isBoldValue,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, isBoldValue && styles.boldValue]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0052CC", // Primary brand color used in designs for headers
  },
  editButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#8E8E93",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1C1C1E",
    textAlign: "right",
    flex: 2,
  },
  boldValue: {
    fontWeight: "600",
  },
});
