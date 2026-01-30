import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  ChevronLeft,
  Check,
  CreditCard,
  Wallet,
  Building2,
} from 'lucide-react-native';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface PatientInfo {
  patient_name: string;
  patient_email: string;
}

export default function SponsorPaymentScreen() {
  const { id, action } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'bank' | 'insurance' | null
  >(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sponsorshipData } = await supabase
        .from('sponsorships')
        .select('patient_name, patient_email')
        .eq('sponsor_id', user.id)
        .eq('patient_id', id)
        .maybeSingle();

      if (sponsorshipData) {
        setPatient({
          patient_name: sponsorshipData.patient_name,
          patient_email: sponsorshipData.patient_email,
        });
      }

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price_monthly', { ascending: true });

      setPlans(plansData || []);
      if (plansData && plansData.length > 0) {
        setSelectedPlan(plansData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !paymentMethod) {
      Alert.alert('Error', 'Please select a plan and payment method');
      return;
    }

    setProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const selectedPlanData = plans.find((p) => p.id === selectedPlan);
      if (!selectedPlanData) throw new Error('Plan not found');

      const amount =
        billingCycle === 'monthly'
          ? selectedPlanData.price_monthly
          : selectedPlanData.price_yearly;

      const expiresAt = new Date();
      if (billingCycle === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: id as string,
          plan_id: selectedPlan,
          status: 'active',
          billing_cycle: billingCycle,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (subError) throw subError;

      const { data: sponsorshipData } = await supabase
        .from('sponsorships')
        .select('id')
        .eq('sponsor_id', user.id)
        .eq('patient_id', id)
        .maybeSingle();

      if (!sponsorshipData) throw new Error('Sponsorship not found');

      const { error: sponsoredSubError } = await supabase
        .from('sponsored_subscriptions')
        .insert({
          subscription_id: subscription.id,
          sponsorship_id: sponsorshipData.id,
          sponsor_user_id: user.id,
          patient_user_id: id as string,
          plan_id: selectedPlan,
          payment_method: paymentMethod,
          amount_paid: amount,
          billing_cycle: billingCycle,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (sponsoredSubError) throw sponsoredSubError;

      Alert.alert(
        'Success',
        `You've successfully subscribed ${patient?.patient_name} to the ${selectedPlanData.name} plan!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe Patient</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {patient && (
          <View style={styles.patientInfo}>
            <Text style={styles.sectionLabel}>Subscribing for</Text>
            <Text style={styles.patientName}>{patient.patient_name}</Text>
            <Text style={styles.patientEmail}>{patient.patient_email}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Billing Cycle</Text>
          <View style={styles.cycleContainer}>
            <TouchableOpacity
              style={[
                styles.cycleButton,
                billingCycle === 'monthly' && styles.cycleButtonActive,
              ]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text
                style={[
                  styles.cycleButtonText,
                  billingCycle === 'monthly' && styles.cycleButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cycleButton,
                billingCycle === 'yearly' && styles.cycleButtonActive,
              ]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text
                style={[
                  styles.cycleButtonText,
                  billingCycle === 'yearly' && styles.cycleButtonTextActive,
                ]}
              >
                Yearly (Save 15%)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Care Plan</Text>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                {selectedPlan === plan.id && (
                  <View style={styles.checkCircle}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.planPrice}>
                ${getPlanPrice(plan)}/
                {billingCycle === 'monthly' ? 'month' : 'year'}
              </Text>
              <View style={styles.featuresContainer}>
                {plan.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={14} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentInfo}>
              <CreditCard
                size={20}
                color={paymentMethod === 'card' ? '#0EA5E9' : '#6B7280'}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'card' && styles.paymentTextActive,
                ]}
              >
                Credit/Debit Card
              </Text>
            </View>
            {paymentMethod === 'card' && (
              <View style={styles.checkCircle}>
                <Check size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'bank' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('bank')}
          >
            <View style={styles.paymentInfo}>
              <Building2
                size={20}
                color={paymentMethod === 'bank' ? '#0EA5E9' : '#6B7280'}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'bank' && styles.paymentTextActive,
                ]}
              >
                Bank Transfer
              </Text>
            </View>
            {paymentMethod === 'bank' && (
              <View style={styles.checkCircle}>
                <Check size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'insurance' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('insurance')}
          >
            <View style={styles.paymentInfo}>
              <Wallet
                size={20}
                color={paymentMethod === 'insurance' ? '#0EA5E9' : '#6B7280'}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'insurance' && styles.paymentTextActive,
                ]}
              >
                Insurance
              </Text>
            </View>
            {paymentMethod === 'insurance' && (
              <View style={styles.checkCircle}>
                <Check size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedPlan && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>
                {plans.find((p) => p.id === selectedPlan)?.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Billing Cycle</Text>
              <Text style={styles.summaryValue}>
                {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${getPlanPrice(plans.find((p) => p.id === selectedPlan)!)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPlan || !paymentMethod || processing) &&
              styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedPlan || !paymentMethod || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay $
              {selectedPlan
                ? getPlanPrice(plans.find((p) => p.id === selectedPlan)!)
                : 0}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  patientInfo: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cycleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cycleButtonActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EFF6FF',
  },
  cycleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  cycleButtonTextActive: {
    color: '#0EA5E9',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  planCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#374151',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  paymentOptionActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  paymentTextActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
