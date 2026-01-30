import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, User, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';
import { supabase } from '../../../lib/supabase';

interface TriageCaseModalProps {
  visible: boolean;
  caseId: string | null;
  onClose: () => void;
  onAssignSpecialist: () => void;
}

export default function TriageCaseModal({
  visible,
  caseId,
  onClose,
  onAssignSpecialist,
}: TriageCaseModalProps) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && caseId) {
      fetchCaseDetails();
    }
  }, [visible, caseId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveAdvice = async () => {
    if (!advice.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('triage_cases')
        .update({
          php_advice: advice,
          status: 'advice_given',
          resolution_type: 'advice_only',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error submitting advice:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#0EA5E9';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Triage Case Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Severity Badge */}
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      getSeverityColor(caseData?.severity_level) + '20',
                  },
                ]}
              >
                <View
                  style={[
                    styles.severityDot,
                    {
                      backgroundColor: getSeverityColor(caseData?.severity_level),
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.severityText,
                    { color: getSeverityColor(caseData?.severity_level) },
                  ]}
                >
                  {caseData?.severity_level?.toUpperCase()} PRIORITY
                </Text>
              </View>

              {/* Patient Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.infoRow}>
                  <User size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Patient ID: {caseData?.patient_id?.slice(0, 12)}...
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Submitted: {new Date(caseData?.created_at).toLocaleString()}
                  </Text>
                </View>
                {caseData?.patient_location && (
                  <View style={styles.infoRow}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Location: {caseData.patient_location.city},{' '}
                      {caseData.patient_location.state}
                    </Text>
                  </View>
                )}
              </View>

              {/* Symptoms */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reported Symptoms</Text>
                {caseData?.symptoms?.map((symptom: any, index: number) => (
                  <View key={index} style={styles.symptomItem}>
                    <AlertCircle size={16} color={Colors.light.primary} />
                    <Text style={styles.symptomText}>
                      {symptom.name || symptom.type}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Patient Notes */}
              {caseData?.patient_notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Patient Notes</Text>
                  <Text style={styles.notesText}>{caseData.patient_notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <Text style={styles.actionTitle}>Choose Action</Text>

                <Button
                  title=\"Find Specialist\"
                  onPress={onAssignSpecialist}
                  variant="primary"
                />

                <Text style={styles.orText}>OR</Text>

                <Text style={styles.adviceLabel}>Give Medical Advice</Text>
                <View style={styles.textAreaContainer}>
                  <Text style={styles.textArea} onPress={() => {}}>
                    {advice || 'Type your medical advice here...'}
                  </Text>
                </View>

                <Button
                  title={submitting ? 'Submitting...' : 'Submit Advice'}
                  onPress={handleGiveAdvice}
                  disabled={!advice.trim() || submitting}
                  variant="secondary"
                />
              </View>
            </ScrollView>
          )}
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
    marginVertical: 16,
  },
  adviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textAreaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  textArea: {
    fontSize: 14,
    color: '#6B7280',
  },
});
