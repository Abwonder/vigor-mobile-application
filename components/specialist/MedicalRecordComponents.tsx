import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Pencil } from "lucide-react-native";

interface RecordSectionProps {
  icon: React.ReactNode;
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
}

export const RecordSection: React.FC<RecordSectionProps> = ({
  icon,
  title,
  onEdit,
  children,
  isFirst,
}) => (
  <View style={[styles.sectionContainer, isFirst && styles.firstSection]}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Pencil color="#1C1C1E" size={18} />
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface DetailRowSmallProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export const DetailRowSmall: React.FC<DetailRowSmallProps> = ({
  label,
  value,
  isLast,
}) => (
  <View style={[styles.detailRow, !isLast && styles.detailBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface ListRowProps {
  title: string;
  subtitle?: string;
  date?: string;
  isLast?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  date,
  isLast,
}) => (
  <View style={[styles.listRow, !isLast && styles.detailBorder]}>
    <View style={styles.listRowInfo}>
      <Text style={styles.listRowTitle}>{title}</Text>
      {subtitle && <Text style={styles.listRowSubtitle}>{subtitle}</Text>}
    </View>
    {date && <Text style={styles.listRowDate}>{date}</Text>}
  </View>
);

export const SoapNoteCard = ({
  label,
  content,
  date,
}: {
  label: string;
  content: string;
  date: string;
}) => (
  <View style={styles.soapCard}>
    <View style={styles.soapHeader}>
      <Text style={styles.soapLabel}>{label}</Text>
      <Text style={styles.soapDate}>{date}</Text>
    </View>
    <Text style={styles.soapContent}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  firstSection: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#004080",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  detailLabel: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "right",
    flex: 1.5,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  listRowInfo: {
    flex: 1,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  listRowSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
  listRowDate: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  soapCard: {
    paddingVertical: 12,
  },
  soapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  soapLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  soapDate: {
    fontSize: 13,
    color: "#8E8E93",
  },
  soapContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#48484A",
  },
});
