import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface EMRCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  children?: React.ReactNode;
}

export const EMRCard: React.FC<EMRCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  children,
}) => (
  <View style={styles.cardContainer}>
    <TouchableOpacity style={styles.cardHeader} onPress={onPress}>
      <View style={styles.titleRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.titleInfo}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight color="#8E8E93" size={20} />
    </TouchableOpacity>
    {children && <View style={styles.cardContent}>{children}</View>}
  </View>
);

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>{icon}</View>
    <View style={styles.detailInfo}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleInfo: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  cardContent: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  detailValue: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 1,
  },
});
