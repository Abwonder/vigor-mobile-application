import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { MessageCircle, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StartTriageModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function StartTriageModal({ visible, onClose, onContinue }: StartTriageModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.startModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Triage</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle1}>
              <MessageCircle size={32} color="#FFF" />
            </View>
            <View style={styles.iconCircle2}>
              <MessageCircle size={32} color="#FFF" />
            </View>
          </View>

          <Text style={styles.modalHeading}>
            A Nurse Will Guide You Through{'\n'}Your Symptom Check
          </Text>

          <Text style={styles.modalDescription}>
            Answer a few quick questions so we can review your condition and recommend the right care.
          </Text>

          <TouchableOpacity onPress={onContinue}>
            <LinearGradient
              colors={['#00D9FF', '#0099FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface AssigningModalProps {
  visible: boolean;
}

export function AssigningModal({ visible }: AssigningModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.assigningModalContent}>
          <View style={styles.medicalCrossContainer}>
            <View style={styles.medicalCross}>
              <View style={styles.crossVertical} />
              <View style={styles.crossHorizontal} />
            </View>
          </View>
          <Text style={styles.assigningText}>Assigning you...</Text>
        </View>
      </View>
    </Modal>
  );
}

interface ConditionPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onStartTriage: () => void;
  onChangeCondition: () => void;
  symptomName: string;
  coveragePlan: string;
  userName: string;
  nurseName: string;
}

export function ConditionPreviewModal({
  visible,
  onClose,
  onStartTriage,
  onChangeCondition,
  symptomName,
  coveragePlan,
  userName,
  nurseName
}: ConditionPreviewModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.conditionPreviewContainer}>
        <View style={styles.conditionHeader}>
          <Text style={styles.conditionHeaderTitle}>Start Triage</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.nurseInfoContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.nurseAvatar}
            />
            <View style={styles.nurseDetails}>
              <Text style={styles.nurseName}>{nurseName} from Vigor</Text>
              <Text style={styles.nurseTitle}>Public Health Nurse</Text>
              <View style={styles.availabilityContainer}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Available to assist you</Text>
              </View>
            </View>
          </View>

          <Text style={styles.greetingText}>
            Hi {userName}, I'll guide you through a short triage. This helps us understand your symptoms and decide the best next step.
          </Text>

          <View style={styles.symptomCard}>
            <View style={styles.symptomIconContainer}>
              <View style={styles.symptomIcon}>
                <View style={styles.symptomIconInner} />
              </View>
            </View>
            <Text style={styles.symptomName}>{symptomName}</Text>
            <View style={styles.coverageBadge}>
              <Check size={16} color="#00B894" />
              <Text style={styles.coverageText}>{coveragePlan}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Triage duration</Text>
              <Text style={styles.infoValue}>3-5 minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Result wait time</Text>
              <Text style={styles.infoValue}>~15 minutes after submission</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Privacy</Text>
              <Text style={styles.infoValue}>Your responses are confidential</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onStartTriage}>
            <LinearGradient
              colors={['#00D9FF', '#0099FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startTriageButton}
            >
              <Text style={styles.startTriageButtonText}>Start Triage</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onChangeCondition} style={styles.changeConditionButton}>
            <Text style={styles.changeConditionText}>Change Condition</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  closeButton: {
    padding: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    height: 80,
  },
  iconCircle1: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -20,
    zIndex: 1,
  },
  iconCircle2: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0099FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
    marginBottom: 16,
    lineHeight: 28,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  assigningModalContent: {
    backgroundColor: '#2C3E50',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: 280,
  },
  medicalCrossContainer: {
    marginBottom: 24,
  },
  medicalCross: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossVertical: {
    position: 'absolute',
    width: 20,
    height: 80,
    backgroundColor: '#00D9FF',
    borderRadius: 10,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 80,
    height: 20,
    backgroundColor: '#0099FF',
    borderRadius: 10,
  },
  assigningText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
  },
  conditionPreviewContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  conditionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  nurseInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nurseAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nurseDetails: {
    alignItems: 'center',
  },
  nurseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  nurseTitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B894',
    marginRight: 6,
  },
  availableText: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '500',
  },
  greetingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  symptomCard: {
    backgroundColor: '#E8F9FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  symptomIconContainer: {
    marginRight: 16,
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomIconInner: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  symptomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  coverageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coverageText: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  startTriageButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startTriageButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  changeConditionButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  changeConditionText: {
    color: '#0099FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
