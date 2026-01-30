import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Upload,
  Camera,
  FileText,
  Activity,
  MessageSquare,
  Pill,
  X,
} from 'lucide-react-native';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface VideoQuickActionsProps {
  visible: boolean;
  onClose: () => void;
  onUploadPhoto: () => void;
  onUploadDocument: () => void;
  onStartTriage: () => void;
  onShareVitals: () => void;
  onSendMessage: () => void;
  onRequestPrescription: () => void;
}

export default function VideoQuickActions({
  visible,
  onClose,
  onUploadPhoto,
  onUploadDocument,
  onStartTriage,
  onShareVitals,
  onSendMessage,
  onRequestPrescription,
}: VideoQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'photo',
      title: 'Upload Photo',
      description: 'Share photos or images with your provider',
      icon: <Camera color="#0EA5E9" size={24} />,
      onPress: onUploadPhoto,
    },
    {
      id: 'document',
      title: 'Upload Document',
      description: 'Share test results, reports, or documents',
      icon: <Upload color="#8B5CF6" size={24} />,
      onPress: onUploadDocument,
    },
    {
      id: 'triage',
      title: 'Start Triage',
      description: 'Begin symptom assessment',
      icon: <Activity color="#EC4899" size={24} />,
      onPress: onStartTriage,
    },
    {
      id: 'vitals',
      title: 'Share Vitals',
      description: 'Share your health measurements',
      icon: <Activity color="#10B981" size={24} />,
      onPress: onShareVitals,
    },
    {
      id: 'message',
      title: 'Send Message',
      description: 'Send a text message',
      icon: <MessageSquare color="#F59E0B" size={24} />,
      onPress: onSendMessage,
    },
    {
      id: 'prescription',
      title: 'Request Prescription',
      description: 'Request prescription refill',
      icon: <Pill color="#EF4444" size={24} />,
      onPress: onRequestPrescription,
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    action.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quick Actions</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color="#6b7280" size={24} />
            </TouchableOpacity>
          </View>

          {/* Actions List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>{action.icon}</View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
