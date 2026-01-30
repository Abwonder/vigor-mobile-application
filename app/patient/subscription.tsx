import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Check, CreditCard } from 'lucide-react-native';

interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
}

interface UserSubscription {
  status: string;
  billing_cycle: string;
  expires_at: string;
  is_sponsored: boolean;
  sponsor_reference: string;
  plan_id: string;
}

interface SponsorConnection {
  sponsor_name: string;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [sponsorName, setSponsorName] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<string[]>([]);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subData) {
          setSubscription(subData);

          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('id, name, features')
            .eq('id', subData.plan_id)
            .maybeSingle();

          if (planData) {
            setPlan(planData);
          }

          if (subData.is_sponsored) {
            const { data: sponsorData } = await supabase
              .from('sponsor_connections')
              .select('sponsor_name')
              .eq('user_id', user.id)
              .maybeSingle();

            if (sponsorData) {
              setSponsorName(sponsorData.sponsor_name);
            }
          }

          const mockMembers = [
            'Sarah Queen',
            'Michael Queen',
            'Sonya Queen (You)',
            'David Queen (Sponsor)',
            'James Queen',
          ];
          setFamilyMembers(mockMembers);
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.currentPlanCard}>
          <View style={styles.planHeader}>
            <View style={styles.planIconContainer}>
              <CreditCard size={32} color="#0EA5E9" strokeWidth={2} />
            </View>
            <View style={styles.planHeaderText}>
              <Text style={styles.planLabel}>Current Plan</Text>
              <View style={styles.planNameRow}>
                <Check size={20} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.planName}>
                  {plan?.name || 'Ultra Care'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.planDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {subscription?.status || 'Active'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renewal Date</Text>
              <Text style={styles.detailValue}>
                {subscription?.expires_at
                  ? formatDate(subscription.expires_at)
                  : '25 Sept 2025'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sponsor</Text>
              <Text style={styles.detailValue}>
                {subscription?.is_sponsored
                  ? sponsorName || 'David Queen'
                  : '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renewal duration</Text>
              <Text style={styles.detailValue}>
                {subscription?.billing_cycle === 'monthly'
                  ? 'Monthly'
                  : 'Yearly'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment method</Text>
              <Text style={styles.detailValue}>-</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coverage Summary</Text>
          <View style={styles.featuresList}>
            {(
              plan?.features || [
                'Unlimited users',
                'Unlimited consultations',
                'Weekly health checks',
                'Chronic care management',
                'Mental health support',
                'Care coordination with multiple providers',
              ]
            ).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={20} color="#0EA5E9" strokeWidth={2.5} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Members on this Plan</Text>
          <View style={styles.membersList}>
            {familyMembers.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <Check size={20} color="#0EA5E9" strokeWidth={2.5} />
                <Text style={styles.memberText}>{member}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.otherPlansButton}
          onPress={() => router.push('/subscription-plans' as any)}
        >
          <Text style={styles.otherPlansButtonText}>See Other plans</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  currentPlanCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planHeaderText: {
    flex: 1,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  planDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  membersList: {
    gap: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  otherPlansButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    marginBottom: 24,
  },
  otherPlansButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
});
