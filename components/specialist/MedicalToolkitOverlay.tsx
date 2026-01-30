import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import {
  Camera,
  TestTube2,
  MessageSquarePlus,
  FileText,
  ClipboardCheck,
  Activity,
  X,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

interface MedicalToolkitOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const ToolkitAction = ({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={[styles.iconContainer, { backgroundColor: "#FFFFFF" }]}>
      {icon}
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const MedicalToolkitOverlay: React.FC<MedicalToolkitOverlayProps> = ({
  visible,
  onClose,
}) => {
  const actions = [
    { title: "Upload Photo/Video", icon: <Camera color="#00E5FF" size={28} /> },
    {
      title: "Upload Test Result",
      icon: <TestTube2 color="#0099FF" size={28} />,
    },
    {
      title: "Triage / New Symptoms",
      icon: <MessageSquarePlus color="#00D09E" size={28} />,
    },
    {
      title: "Upload Prescription",
      icon: <FileText color="#00E5FF" size={28} />,
    },
    {
      title: "Request Refill",
      icon: <ClipboardCheck color="#00D09E" size={28} />,
    },
    { title: "Share Vitals", icon: <Activity color="#00D09E" size={28} /> },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>Quick Actions</Text>
          <Text style={styles.subtitle}>
            Information shared goes directly to patient EMR
          </Text>

          <View style={styles.grid}>
            {actions.map((action, index) => (
              <ToolkitAction key={index} {...action} color="#0099FF" />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    backgroundColor: "#3A3A3C",
    borderRadius: 24,
    padding: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#C7C7CC",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  actionItem: {
    width: (width - 120) / 3, // 3 column grid with padding
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default MedicalToolkitOverlay;
