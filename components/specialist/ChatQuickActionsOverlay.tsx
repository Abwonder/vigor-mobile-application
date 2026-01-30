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

interface ChatQuickActionsOverlayProps {
  visible: boolean;
  onClose: () => void;
  onActionSelect: (action: string) => void;
}

const ToolkitAction = ({
  icon,
  title,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const ChatQuickActionsOverlay: React.FC<ChatQuickActionsOverlayProps> = ({
  visible,
  onClose,
  onActionSelect,
}) => {
  const actions = [
    {
      id: "photo",
      title: "Upload Photo/Video",
      icon: <Camera color="#00E5FF" size={28} />,
    },
    {
      id: "test",
      title: "Upload Test Result",
      icon: <TestTube2 color="#0099FF" size={28} />,
    },
    {
      id: "triage",
      title: "Triage / New Symptoms",
      icon: <MessageSquarePlus color="#00D09E" size={28} />,
    },
    {
      id: "prescription",
      title: "Upload Prescription",
      icon: <FileText color="#1EBDFF" size={28} />,
    },
    {
      id: "refill",
      title: "Request Refill",
      icon: <ClipboardCheck color="#00D09E" size={28} />,
    },
    {
      id: "vitals",
      title: "Share Vitals",
      icon: <Activity color="#00D09E" size={28} />,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#8E8E93" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>Quick Actions</Text>
          <Text style={styles.subtitle}>
            Information shared goes directly to you EMR
          </Text>

          <View style={styles.grid}>
            {actions.map((action, index) => (
              <ToolkitAction
                key={index}
                {...action}
                onPress={() => {
                  onActionSelect(action.id);
                  onClose();
                }}
              />
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  actionItem: {
    width: (width - 120) / 3,
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    color: "#1C1C1E",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default ChatQuickActionsOverlay;
