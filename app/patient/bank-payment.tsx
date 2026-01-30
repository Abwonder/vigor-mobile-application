import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Copy, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

export default function BankPayment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { planId, billingCycle, amount } = params;

  const [loading, setLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      setPlanDetails(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setShowConnectingModal(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const subscriptionData = {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() +
            (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        is_sponsored: false,
      };

      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subError) throw subError;

      const transactionData = {
        user_id: user.id,
        subscription_id: subscription.id,
        amount: parseFloat(amount as string),
        currency: 'NGN',
        payment_method: 'bank_transfer',
        payment_reference: `BANK-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        status: 'completed',
        metadata: {
          billing_cycle: billingCycle,
        },
      };

      const { error: txnError } = await supabase
        .from('payment_transactions')
        .insert(transactionData);

      if (txnError) throw txnError;

      setTimeout(() => {
        setShowConnectingModal(false);
        setShowSuccessModal(true);
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setShowConnectingModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)');
  };

  if (!planDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const displayAmount = parseFloat(amount as string).toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Transfer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={styles.summaryValue}>{planDetails.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Billing Cycle</Text>
            <Text style={styles.summaryValue}>
              {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₦{displayAmount}</Text>
          </View>
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.sectionTitle}>Transfer to this account</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bank Name</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>GTBank</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>0123456789</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>HealthCare Plus Ltd</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>₦{displayAmount}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.ussdSection}>
          <Text style={styles.sectionTitle}>Or use USSD</Text>
          <Text style={styles.ussdCode}>*737*50*{amount}*ACCOUNT#</Text>
          <Text style={styles.ussdHint}>
            Dial this code from your registered phone number
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            After making the transfer, click "I've completed payment" below to
            activate your subscription.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            loading && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmButtonText}>I've completed payment</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConnectingModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.connectingModal}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#00C6FF', '#0072FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <View style={styles.logoPlus}>
                  <View style={styles.logoPlusHorizontal} />
                  <View style={styles.logoPlusVertical} />
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.connectingText}>Connecting ...</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalCard}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleSuccessContinue}
              >
                <X size={24} color="#999" />
              </TouchableOpacity>

              <Text style={styles.successHeader}>Payment Successful</Text>

              <View style={styles.iconContainer}>
                <View style={styles.partnershipIcon}>
                  <View style={styles.personLeft}>
                    <View style={styles.personHead} />
                    <View style={styles.personBody} />
                  </View>
                  <View style={styles.connectionBridge}>
                    <View style={[styles.sparkle, styles.sparkle1]} />
                    <View style={[styles.sparkle, styles.sparkle2]} />
                    <View style={[styles.sparkle, styles.sparkle3]} />
                    <View style={[styles.sparkle, styles.sparkle4]} />
                  </View>
                  <View style={styles.personRight}>
                    <View style={styles.personHead} />
                    <View style={styles.personBody} />
                  </View>
                </View>
              </View>

              <Text style={styles.successTitle}>Connection Successful</Text>
              <Text style={styles.successMessage}>
                You can start accessing your care benefits right away.
              </Text>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSuccessContinue}
              >
                <LinearGradient
                  colors={['#00C6FF', '#0072FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  bankDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  detailValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  copyButton: {
    padding: 4,
  },
  ussdSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  ussdCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  ussdHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 13,
    color: '#0066CC',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingModal: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlus: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlusHorizontal: {
    position: 'absolute',
    width: 40,
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  logoPlusVertical: {
    position: 'absolute',
    width: 8,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  connectingText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '500',
  },
  successModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  successHeader: {
    fontSize: 15,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  partnershipIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  personLeft: {
    alignItems: 'center',
  },
  personRight: {
    alignItems: 'center',
  },
  personHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00C6FF',
    marginBottom: 4,
  },
  personBody: {
    width: 40,
    height: 50,
    backgroundColor: '#00C6FF',
    borderRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  connectionBridge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 8,
    backgroundColor: '#00C6FF',
    borderRadius: 4,
    marginHorizontal: 16,
    position: 'relative',
  },
  sparkle: {
    width: 8,
    height: 8,
    backgroundColor: '#00C6FF',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  sparkle1: {
    top: -16,
    left: 10,
  },
  sparkle2: {
    top: -16,
    right: 10,
  },
  sparkle3: {
    bottom: -16,
    left: 10,
  },
  sparkle4: {
    bottom: -16,
    right: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
