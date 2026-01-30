import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, Camera, FlaskConical, MessageCircleMore, Pill, FileText, Activity } from 'lucide-react-native';

interface AudioQuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function AudioQuickActionsModal({ visible, onClose, onAction }: AudioQuickActionsModalProps) {
  const actions = [
    {
      id: 'upload-photo',
      title: 'Upload\nPhoto/Video',
      icon: Camera,
      color: '#06B6D4',
    },
    {
      id: 'upload-test',
      title: 'Upload Test\nResult',
      icon: FlaskConical,
      color: '#06B6D4',
    },
    {
      id: 'triage',
      title: 'Triage / New\nSymptoms',
      icon: MessageCircleMore,
      color: '#06B6D4',
    },
    {
      id: 'upload-prescription',
      title: 'Upload\nPrescription',
      icon: Pill,
      color: '#06B6D4',
    },
    {
      id: 'request-refill',
      title: 'Request Refill',
      icon: FileText,
      color: '#06B6D4',
    },
    {
      id: 'share-vitals',
      title: 'Share Vitals',
      icon: Activity,
      color: '#06B6D4',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Quick Actions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={28} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Information shared goes directly to you EMR</Text>

          <View style={styles.actionsGrid}>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionButton}
                  onPress={() => {
                    onAction(action.id);
                    onClose();
                  }}
                >
                  <View style={styles.iconContainer}>
                    <Icon size={40} color={action.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#D1D5DB',
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
