import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  ChevronLeft,
  Plus,
  Edit3,
  UserPlus,
  IdCard,
  X,
} from 'lucide-react-native';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  country_of_residence: string;
  state: string;
  profile_photo_url?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
  email: string;
  country_of_residence: string;
  state: string;
  is_primary: boolean;
}

export default function ProfileInfoScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] =
    useState<EmergencyContact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const { data: contactsData } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false });

        if (profileData) setProfile(profileData);
        if (contactsData) setEmergencyContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return '';
    const firstInitial = profile.first_name?.[0] || '';
    const lastInitial = profile.last_name?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
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
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile info</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#111827" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              {profile?.profile_photo_url ? (
                <Image
                  source={{ uri: profile.profile_photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile/change-photo' as any)}
            >
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <UserPlus size={20} color="#0EA5E9" strokeWidth={2} />
                <Text style={styles.sectionTitle}>My Profile</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/profile/edit-profile' as any)}
              >
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {profile?.first_name} {profile?.last_name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{profile?.gender || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {profile?.date_of_birth
                    ? formatDate(profile.date_of_birth)
                    : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>
                  {profile?.phone_number || '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email address</Text>
                <Text style={styles.infoValue}>{profile?.email || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country of residence</Text>
                <Text style={styles.infoValue}>
                  {profile?.country_of_residence || '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State</Text>
                <Text style={styles.infoValue}>{profile?.state || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <IdCard size={20} color="#0EA5E9" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.infoGrid}
                  onPress={() => {
                    setSelectedContact(contact);
                    setShowContactModal(true);
                  }}
                >
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{contact.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Relationship</Text>
                    <Text style={styles.infoValue}>{contact.relationship}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{contact.phone_number}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email address</Text>
                    <Text style={styles.infoValue}>{contact.email || '-'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Country of residence</Text>
                    <Text style={styles.infoValue}>
                      {contact.country_of_residence || '-'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>State</Text>
                    <Text style={styles.infoValue}>{contact.state || '-'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No emergency contacts added
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Emergency Contact</Text>
                <Text style={styles.modalSubtitle}>For urgent matters</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {selectedContact && (
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{selectedContact.name}</Text>

                <View style={styles.contactInfoRow}>
                  <Text style={styles.contactLabel}>Relationship</Text>
                  <Text style={styles.contactValue}>
                    {selectedContact.relationship}
                  </Text>
                </View>

                <View style={styles.contactInfoRow}>
                  <Text style={styles.contactLabel}>Phone number</Text>
                  <Text style={styles.contactValue}>
                    {selectedContact.phone_number}
                  </Text>
                </View>

                <View style={styles.contactInfoRow}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>
                    {selectedContact.email || '-'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.addContactButton}>
                  <Plus size={20} color="#0EA5E9" strokeWidth={2.5} />
                  <Text style={styles.addContactButtonText}>
                    Add Emergency Contact
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
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
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: {
    gap: 16,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  contactInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    marginTop: 8,
  },
  addContactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
});
