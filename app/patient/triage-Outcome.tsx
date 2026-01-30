import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

export default function TriageOutcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sessionId } = params;

  const [outcome, setOutcome] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    loadOutcome();
  }, []);

  const loadOutcome = async () => {
    try {
      const { data, error } = await supabase
        .from('triage_outcomes')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;
      setOutcome(data);
    } catch (error) {
      console.error('Error loading outcome:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallEmergency = () => {
    alert('Emergency services would be contacted here.');
  };

  const handleAssignSpecialist = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: nurseProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'provider')
        .limit(1)
        .single();

      const nurseId = nurseProfile?.id;

      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          last_message: "Hello, I've reviewed your symptoms...",
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (conversation) {
        await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversation.id, user_id: user.id },
            ...(nurseId
              ? [{ conversation_id: conversation.id, user_id: nurseId }]
              : []),
          ]);

        const { data: nurseConsultation } = await supabase
          .from('consultations')
          .insert({
            patient_id: user.id,
            provider_id: nurseId,
            provider_type: 'nurse',
            conversation_id: conversation.id,
            triage_session_id: sessionId,
            status: 'active',
          })
          .select()
          .single();

        const specialtyMap: { [key: string]: string } = {
          emergency: 'Cardiology',
          high: 'Cardiology',
          moderate: 'General Practice',
          low: 'General Practice',
        };

        const specialty = specialtyMap[outcome.severity] || 'General Practice';

        const { data: specialistConsultation } = await supabase
          .from('consultations')
          .insert({
            patient_id: user.id,
            provider_id: nurseId,
            provider_type: 'specialist',
            status: 'waiting_for_provider',
            specialty: specialty,
            triage_session_id: sessionId,
          })
          .select()
          .single();
      }

      await supabase
        .from('triage_outcomes')
        .update({ specialist_assigned: true })
        .eq('id', outcome.id);

      setShowAssignmentModal(true);
    } catch (error) {
      console.error('Error assigning specialist:', error);
    }
  };

  const handleBookAppointment = () => {
    router.push('/(tabs)/appointments');
  };

  const handleGoToConsultation = () => {
    setShowAssignmentModal(false);
    router.push({
      pathname: '/(tabs)/consults',
    });
  };

  if (loading || !outcome) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const getSeverityIcon = () => {
    if (outcome.severity === 'emergency') {
      return (
        <View style={styles.emergencyIconContainer}>
          <View style={styles.emergencyAlarm}>
            <Bell size={40} color="#FF3B30" fill="#FF3B30" />
          </View>
          <AlertTriangle size={48} color="#FF3B30" fill="#FFEBEE" />
        </View>
      );
    }

    return (
      <View style={styles.cautionIconContainer}>
        <View style={styles.cautionAlarm}>
          <Bell size={40} color="#FFB800" fill="#FFB800" />
        </View>
        <AlertTriangle size={48} color="#FFB800" fill="#FFF8E1" />
      </View>
    );
  };

  const getBackgroundColor = () => {
    if (outcome.severity === 'emergency') return '#FFEBEE';
    return '#E0F7FA';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Your triage outcome</Text>

        <View
          style={[
            styles.outcomeCard,
            { backgroundColor: getBackgroundColor() },
          ]}
        >
          <View style={styles.iconContainer}>{getSeverityIcon()}</View>

          <Text style={styles.outcomeTitle}>{outcome.severity_title}</Text>
          <Text style={styles.outcomeDescription}>
            {outcome.severity_description}
          </Text>
        </View>

        <View style={styles.symptomsCard}>
          <Text style={styles.symptomsTitle}>Based on your symptoms</Text>
          <Text style={styles.symptomsText}>{outcome.symptoms_summary}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {outcome.severity === 'emergency' ? (
            <>
              <TouchableOpacity onPress={handleCallEmergency}>
                <LinearGradient
                  colors={['#FF5252', '#FF3B30']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Call Emergency</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAssignSpecialist}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Assign me to a specialist
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleAssignSpecialist}>
                <LinearGradient
                  colors={['#00D9FF', '#0099FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    Assign me to a specialist
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBookAppointment}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Book a specialist appointment
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={showAssignmentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowAssignmentModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <View style={styles.modalIconContainer}>
              <View style={styles.modalIcon}>
                <View style={styles.modalIconPerson}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                </View>
              </View>
            </View>

            <Text style={styles.modalTitle}>
              You've been assigned a specialist!
            </Text>
            <Text style={styles.modalDescription}>
              You'll find your assigned specialist and all consultation-related
              information in the Consultation tab.
            </Text>

            <TouchableOpacity onPress={handleGoToConsultation}>
              <LinearGradient
                colors={['#00D9FF', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>
                  Go to Consultation Tab
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  outcomeCard: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  emergencyIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyAlarm: {
    position: 'relative',
  },
  cautionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cautionAlarm: {
    position: 'relative',
  },
  outcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  outcomeDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  symptomsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  symptomsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  symptomsText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#0099FF',
  },
  secondaryButtonText: {
    color: '#0099FF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 32,
    color: '#999',
    fontWeight: '300',
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconPerson: {
    alignItems: 'center',
  },
  personHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0099FF',
    marginBottom: 4,
  },
  personBody: {
    width: 32,
    height: 20,
    backgroundColor: '#0099FF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
