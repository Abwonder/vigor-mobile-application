import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Camera, TestTube2, MessageSquare, FileText, Pill, Activity } from 'lucide-react-native';

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadPhoto: () => void;
  onUploadTestResult: () => void;
  onNewSymptoms: () => void;
  onUploadPrescription: () => void;
  onRequestRefill: () => void;
  onShareVitals: () => void;
}

export default function QuickActionsModal({
  visible,
  onClose,
  onUploadPhoto,
  onUploadTestResult,
  onNewSymptoms,
  onUploadPrescription,
  onRequestRefill,
  onShareVitals,
}: QuickActionsModalProps) {
  const actions = [
    {
      id: 'photo',
      icon: Camera,
      label: 'Upload\nPhoto/Video',
      onPress: onUploadPhoto,
      gradient: ['#00D9FF', '#0099FF'],
    },
    {
      id: 'test',
      icon: TestTube2,
      label: 'Upload Test\nResult',
      onPress: onUploadTestResult,
      gradient: ['#00D9FF', '#0099FF'],
    },
    {
      id: 'symptoms',
      icon: MessageSquare,
      label: 'Triage / New\nSymptoms',
      onPress: onNewSymptoms,
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'prescription',
      icon: FileText,
      label: 'Upload\nPrescription',
      onPress: onUploadPrescription,
      gradient: ['#00D9FF', '#0099FF'],
    },
    {
      id: 'refill',
      icon: Pill,
      label: 'Request Refill',
      onPress: onRequestRefill,
      gradient: ['#00D9FF', '#0099FF'],
    },
    {
      id: 'vitals',
      icon: Activity,
      label: 'Share Vitals',
      onPress: onShareVitals,
      gradient: ['#10B981', '#059669'],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Quick Actions</Text>
              <Text style={styles.subtitle}>
                Information shared goes directly to your EMR
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.actionsGrid}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionItem}
                  onPress={action.onPress}
                >
                  <View style={styles.actionIconContainer}>
                    <action.icon size={40} color="#00D9FF" strokeWidth={2} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
  },
  actionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
  },
});
