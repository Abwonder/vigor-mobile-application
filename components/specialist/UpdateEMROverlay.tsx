import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  X,
  ChevronRight,
  Activity,
  Users,
  FileText,
  TestTube2,
  Pill,
  Heart,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

interface UpdateEMROverlayProps {
  visible: boolean;
  onClose: () => void;
}

const EMRUpdateItem = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <ChevronRight color="#8E8E93" size={20} />
  </TouchableOpacity>
);

const UpdateEMROverlay: React.FC<UpdateEMROverlayProps> = ({
  visible,
  onClose,
}) => {
  const sections = [
    {
      id: "health",
      title: "Health Record",
      subtitle: "Allergies, conditions, surgeries, vitals, and his...",
      icon: <Activity color="#00E5FF" size={24} />,
    },
    {
      id: "careteam",
      title: "Care Team",
      subtitle: "All staff and specialists managing your care.",
      icon: <Users color="#00D09E" size={24} />,
    },
    {
      id: "careplan",
      title: "Active Care Plan",
      subtitle: "All staff and specialists managing your care.",
      icon: <FileText color="#007AFF" size={24} />,
    },
    {
      id: "tests",
      title: "Tests & Results",
      subtitle: "Lab work, scans, and results.",
      icon: <TestTube2 color="#00D09E" size={24} />,
    },
    {
      id: "meds",
      title: "Medications (Active)",
      subtitle: "Current prescriptions and dosages.",
      icon: <Pill color="#00D09E" size={24} />,
    },
    {
      id: "reports",
      title: "Reports & Documents",
      subtitle: "Referrals, discharge notes, and other doc...",
      icon: <FileText color="#007AFF" size={24} />,
    },
    {
      id: "status",
      title: "Care Status",
      subtitle: "Current status and duration of care.",
      icon: <Heart color="#00E5FF" size={24} />,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Update Patient EMR</Text>
              <Text style={styles.subtitle}>
                Flexible options for individuals, families, and sponsors.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#1C1C1E" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {sections.map((section) => (
              <EMRUpdateItem
                key={section.id}
                {...section}
                onPress={() => {
                  console.log(`Update ${section.title}`);
                  onClose();
                }}
              />
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
});

export default UpdateEMROverlay;
