import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Globe,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  ProfileSectionHeader,
  SummaryInfoRow,
} from '../../../components/specialist/ProfileComponents';

export default function ProfileInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile User Info */}
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            onPress={() => router.push('/profile/change-photo')}
            style={styles.changePhotoLink}
          >
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* My Profile / Bio */}
        <View style={styles.section}>
          <ProfileSectionHeader
            icon={<MessageSquare color="#007AFF" size={20} />}
            title="My Profile"
            onEdit={() => router.push('/profile/edit-profile')}
          />
          <Text style={styles.bioText}>
            Dr. Amelia Hart, a devoted physician, is committed to providing
            exceptional cardiovascular care with expertise in managing
            hypertension, heart failure, and preventive cardiology. A proud alum
            of the University of Lagos for medical school, Dr. Cynthia completed
            residency training at Lagos University Teaching Hospital, followed
            by fellowship training with the West African College of Physicians
            in Cardiology.{'\n\n'}
            Passionate about advancing heart health and supporting patients
            through lifestyle modification, Dr. Cynthia combines extensive
            medical knowledge with a compassionate, patient-centered approach.
            With over 12 years of experience, she is dedicated to helping
            individuals live healthier lives and manage heart conditions
            effectively.{'\n\n'}
            Beyond medicine, Dr. Cynthia enjoys mentoring young doctors,
            participating in community health outreach programs, and spending
            time with her family. She also loves traveling and exploring new
            cultures, reflecting her commitment to both professional excellence
            and personal fulfillment.
          </Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <ProfileSectionHeader
            icon={<Briefcase color="#007AFF" size={20} />}
            title="Experience"
            onEdit={() => {}}
          />
          <SummaryInfoRow
            label="Years in practice"
            value="12 years"
            isBoldValue
          />
          <SummaryInfoRow
            label="Work history"
            value="Consultant Cardiologist at Lagos University Teaching Hospital"
          />
          <SummaryInfoRow
            label="Memberships / affiliations"
            value="Member, Nigerian Cardiac Society"
          />
          <SummaryInfoRow label="State" value="Lagos State" />
        </View>

        {/* Education & Training */}
        <View style={styles.section}>
          <ProfileSectionHeader
            icon={<GraduationCap color="#007AFF" size={20} />}
            title="Education & Training"
            onEdit={() => {}}
          />
          <SummaryInfoRow
            label="Undergraduate degree"
            value="MBBS"
            isBoldValue
          />
          <SummaryInfoRow label="University" value="University of Lagos" />
          <SummaryInfoRow
            label="Residency (specialty)"
            value="Internal Medicine"
          />
          <SummaryInfoRow
            label="Residency hospital"
            value="Lagos University Teaching Hospital"
          />
          <SummaryInfoRow label="Fellowship (specialty)" value="Cardiology" />
          <SummaryInfoRow
            label="Fellowship institution"
            value="West African College of Physicians (Cardiology)"
          />
        </View>

        {/* Areas of Expertise */}
        <View style={styles.section}>
          <ProfileSectionHeader
            icon={<Stethoscope color="#007AFF" size={20} />}
            title="Areas of Expertise"
            onEdit={() => {}}
          />
          <View style={styles.expertiseList}>
            <Text style={styles.expertiseItem}>
              Hypertension & heart failure
            </Text>
            <Text style={styles.expertiseItem}>Coronary artery disease</Text>
            <Text style={styles.expertiseItem}>Preventive cardiology</Text>
            <Text style={styles.expertiseItem}>
              Lifestyle and diet modification
            </Text>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <ProfileSectionHeader
            icon={<Globe color="#007AFF" size={20} />}
            title="Languages Spoken" // Fix: Designs show "Areas of Expertise" twice but labels imply Languages
            onEdit={() => {}}
          />
          <View style={styles.expertiseList}>
            <Text style={styles.expertiseItem}>English</Text>
            <Text style={styles.expertiseItem}>Yoruba</Text>
            <Text style={styles.expertiseItem}>Igbo</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoLink: {
    padding: 4,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#48484A',
    lineHeight: 20,
    marginTop: 12,
  },
  expertiseList: {
    marginTop: 12,
    gap: 8,
  },
  expertiseItem: {
    fontSize: 14,
    color: '#48484A',
  },
});
