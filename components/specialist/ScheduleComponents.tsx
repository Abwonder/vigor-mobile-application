import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Calendar, Video, CheckCircle2, Clock } from "lucide-react-native";

interface AppointmentCardProps {
  patient: {
    name: string;
    role: string;
    avatar: string;
  };
  type: string;
  description: string;
  time: string;
  callType: string;
  status: "Confirmed" | "Pending" | "Missed" | "Cancelled";
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  patient,
  type,
  description,
  time,
  callType,
  status,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.patientInfo}>
        <Image source={{ uri: patient.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientRole}>{patient.role}</Text>
        </View>
      </View>
      <View style={styles.statusBadge}>
        <CheckCircle2 color="#34C759" size={16} />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>

    <Text style={styles.type}>{type}</Text>
    <Text style={styles.description}>{description}</Text>

    <View style={styles.footer}>
      <View style={styles.footerItem}>
        <Calendar color="#8E8E93" size={16} />
        <Text style={styles.footerText}>{time}</Text>
      </View>
      <View style={styles.footerItem}>
        <Video color="#8E8E93" size={16} />
        <Text style={styles.footerText}>{callType}</Text>
      </View>
    </View>
  </View>
);

interface DaySelectorProps {
  days: { day: string; date: string; active?: boolean }[];
  onSelect: (date: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.daySelector}
  >
    {days.map((d, i) => (
      <TouchableOpacity
        key={i}
        style={[styles.dayItem, d.active && styles.activeDay]}
        onPress={() => onSelect(d.date)}
      >
        <Text style={[styles.dayName, d.active && styles.activeDayText]}>
          {d.day}
        </Text>
        <Text style={[styles.dayDate, d.active && styles.activeDayText]}>
          {d.date}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export const CheckboxGroup = ({ label, options, selected, onToggle }: any) => (
  <View style={styles.checkboxGroup}>
    {label && <Text style={styles.groupLabel}>{label}</Text>}
    <View style={styles.checkboxRow}>
      {options.map((opt: string) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.checkbox,
            selected.includes(opt) && styles.selectedCheckbox,
          ]}
          onPress={() => onToggle(opt)}
        >
          <View
            style={[styles.box, selected.includes(opt) && styles.activeBox]}
          />
          <Text
            style={[
              styles.boxLabel,
              selected.includes(opt) && styles.activeBoxLabel,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  patientRole: {
    fontSize: 13,
    color: "#8E8E93",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  type: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#3A3A3C",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  daySelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  dayItem: {
    width: 58,
    height: 72,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeDay: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  dayName: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  activeDayText: {
    color: "#007AFF", // Design shows a subtle blue but mostly darker text, I'll use blue for contrast
  },
  checkboxGroup: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#48484A",
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  selectedCheckbox: {
    borderColor: "#007AFF20",
    backgroundColor: "#007AFF05",
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C7C7CC",
  },
  activeBox: {
    backgroundColor: "#FFFFFF",
    borderColor: "#007AFF",
  },
  boxLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  activeBoxLabel: {
    color: "#1C1C1E",
    fontWeight: "500",
  },
});
