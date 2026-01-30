import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ChevronLeft, MoreVertical, X, User } from 'lucide-react-native';

interface Sponsor {
  id: string;
  sponsor_name: string;
  sponsor_reference: string;
  sponsor_email: string;
  sponsor_phone: string;
  status: string;
  connected_at: string;
  metadata: {
    relationship?: string;
    renewal_duration?: string;
    payment_method?: string;
  };
}

export default function SponsorsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [sponsorCode, setSponsorCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('sponsorships')
          .select(
            `
            *,
            sponsors!sponsorships_sponsor_id_fkey (
              reference_id,
              full_name,
              email,
              phone_number
            )
          `,
          )
          .eq('patient_id', user.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const formattedSponsors = data.map((s) => ({
            id: s.id,
            sponsor_name: s.sponsors?.full_name || 'Unknown Sponsor',
            sponsor_reference: s.sponsors?.reference_id || '',
            sponsor_email: s.sponsors?.email || '',
            sponsor_phone: s.sponsors?.phone_number || '',
            status: s.is_paying ? 'active' : 'inactive',
            connected_at: s.started_at,
            metadata: {
              relationship: s.relationship_type,
              renewal_duration: 'monthly',
              payment_method: s.is_paying ? 'Paid by Sponsor' : 'Not Paid',
            },
          }));
          setSponsors(formattedSponsors);
        }
      }
    } catch (error) {
      console.error('Error loading sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSponsor = async () => {
    if (!sponsorCode.trim()) {
      Alert.alert('Error', 'Please enter a sponsor ID');
      return;
    }

    setConnecting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, phone_number')
        .eq('id', user.id)
        .maybeSingle();

      const { data: sponsorData, error: sponsorError } = await supabase
        .from('sponsors')
        .select('user_id, reference_id, full_name')
        .eq('reference_id', sponsorCode.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (sponsorError || !sponsorData) {
        Alert.alert('Invalid ID', 'This sponsor ID is invalid or inactive.');
        return;
      }

      const { error: requestError } = await supabase
        .from('sponsorship_requests')
        .insert({
          patient_user_id: user.id,
          patient_name:
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
          patient_email: profile?.email || '',
          patient_phone: profile?.phone_number || '',
          sponsor_user_id: sponsorData.user_id,
          sponsor_code_entered: sponsorCode.toUpperCase(),
          status: 'pending',
          message: 'I would like you to be my sponsor.',
        });

      if (requestError) {
        if (requestError.code === '23505') {
          Alert.alert(
            'Request Exists',
            'You have already sent a request to this sponsor.',
          );
        } else {
          throw requestError;
        }
        return;
      }

      Alert.alert(
        'Success',
        'Request sent! The sponsor will review your request.',
      );
      setSponsorCode('');
      setShowConnectModal(false);
      loadSponsors();
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setConnecting(false);
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
        <Text style={styles.headerTitle}>Sponsors</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {sponsors.map((sponsor) => (
          <View key={sponsor.id} style={styles.sponsorCard}>
            <View style={styles.sponsorHeader}>
              <View style={styles.sponsorAvatarContainer}>
                <View style={styles.sponsorAvatar}>
                  <User size={32} color="#0EA5E9" strokeWidth={2} />
                </View>
                <View style={styles.sponsorHeaderText}>
                  <Text style={styles.sponsorName}>{sponsor.sponsor_name}</Text>
                  <Text style={styles.sponsorLabel}>Sponsor</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.sponsorDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sponsor Reference ID</Text>
                <Text style={styles.detailValue}>
                  {sponsor.sponsor_reference}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sponsor name</Text>
                <Text style={styles.detailValue}>
                  {sponsor.connected_at
                    ? formatDate(sponsor.connected_at)
                    : '-'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Relationship</Text>
                <Text style={styles.detailValue}>
                  {sponsor.metadata?.relationship || 'Son'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Renewal duration</Text>
                <Text style={styles.detailValue}>
                  {sponsor.metadata?.renewal_duration === 'monthly'
                    ? 'Monthly'
                    : 'Yearly'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>
                  {sponsor.status.charAt(0).toUpperCase() +
                    sponsor.status.slice(1)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment method</Text>
                <Text style={styles.detailValue}>
                  {sponsor.metadata?.payment_method || 'Ultra Care'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {sponsors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sponsors yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect with a sponsor using their invitation code
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => setShowConnectModal(true)}
        >
          <Text style={styles.connectButtonText}>Connect a new sponsor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite Sponsor</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConnectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect with sponsor</Text>
              <TouchableOpacity
                onPress={() => setShowConnectModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Connect with your sponsor using a code.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sponsor ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter sponsor ID (e.g., SPNSR-ABC12345)"
                placeholderTextColor="#9CA3AF"
                value={sponsorCode}
                onChangeText={setSponsorCode}
                autoCapitalize="characters"
              />
              <Text style={styles.inputHint}>
                Enter the unique Sponsor ID provided by your sponsor.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.modalConnectButton,
                connecting && styles.modalConnectButtonDisabled,
              ]}
              onPress={handleConnectSponsor}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Text
                  style={[
                    styles.modalConnectButtonText,
                    connecting && styles.modalConnectButtonTextDisabled,
                  ]}
                >
                  Connect with sponsor
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 8,
    paddingBottom: 180,
    gap: 16,
  },
  sponsorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sponsorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sponsorAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sponsorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorHeaderText: {
    gap: 4,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sponsorLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorDetails: {
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
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F3F4F6',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  connectButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inviteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
  modalConnectButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConnectButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  modalConnectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalConnectButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
