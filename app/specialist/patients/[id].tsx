import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Search,
  Activity,
  Users,
  Stethoscope,
  TestTube2,
  Pill,
  FileText,
  Heart,
  Droplets,
  Clock,
  Calendar,
  AlertTriangle,
  History,
} from 'lucide-react-native';
import {
  EMRCard,
  DetailRow,
} from '../../../components/specialist/EMRComponents';
import UpdateEMROverlay from '../../../components/specialist/UpdateEMROverlay';

const { width } = Dimensions.get('window');

const RequestCard = ({
  icon,
  title,
  subtitle,
  time,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}) => (
  <TouchableOpacity style={styles.requestCard}>
    <View style={[styles.requestIcon, { backgroundColor: color + '15' }]}>
      {icon}
    </View>
    <View style={styles.requestInfo}>
      <Text style={styles.requestTitle}>{title}</Text>
      <Text style={styles.requestSubtitle}>{subtitle}</Text>
      <Text style={styles.requestTime}>{time}</Text>
    </View>
  </TouchableOpacity>
);

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

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
        <Text style={styles.headerTitle}>Sonya Queen</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsUpdateModalVisible(true)}
            style={styles.headerIcon}
          >
            <Plus color="#1C1C1E" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Search color="#1C1C1E" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Requests Section */}
        <Text style={styles.sectionTitle}>Requests</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.requestsScroll}
        >
          <RequestCard
            icon={<Droplets color="#FF2D55" size={24} />}
            title="Prescription Renewal"
            subtitle="Amoxicillin 500mg"
            time="2h ago"
            color="#FF2D55"
          />
          <RequestCard
            icon={<TestTube2 color="#007AFF" size={24} />}
            title="Result Review"
            subtitle="Uploaded: Blood Test"
            time="Sept 12"
            color="#007AFF"
          />
        </ScrollView>

        {/* EMR Section */}
        <Text style={styles.sectionTitle}>Electronic Medical Record</Text>

        <EMRCard
          icon={<Activity color="#00E5FF" size={24} />}
          title="Health Record"
          subtitle="Allergies, conditions, surgeries, vitals, and his..."
          onPress={() => router.push('/patients/medical-record')}
        >
          <DetailRow
            icon={<AlertTriangle color="#FF9500" size={18} />}
            label="Allergies"
            value="2 recorded (Penicillin, Peanuts)"
          />
          <DetailRow
            icon={<Activity color="#007AFF" size={18} />}
            label="Conditions"
            value="Hypertension, Diabetes"
          />
          <DetailRow
            icon={<Stethoscope color="#00D09E" size={18} />}
            label="Past Surgeries"
            value="Appendectomy (2019)"
          />
        </EMRCard>

        <EMRCard
          icon={<Users color="#00D09E" size={24} />}
          title="Care Team"
          subtitle="All staff and specialists managing your care."
          onPress={() => {}}
        >
          <DetailRow
            icon={<Stethoscope color="#007AFF" size={18} />}
            label="Primary Physician"
            value="Dr. Samuel Adebayo, General Practitioner"
          />
          <DetailRow
            icon={<Users color="#5856D6" size={18} />}
            label="Specialist"
            value="Dr. Chioma Nwosu, Cardiologist"
          />
        </EMRCard>

        <EMRCard
          icon={<FileText color="#007AFF" size={24} />}
          title="Active Care Plan"
          subtitle="All staff and specialists managing your care."
          onPress={() => {}}
        >
          <DetailRow
            icon={<FileText color="#007AFF" size={18} />}
            label="Plan Title"
            value="Hypertension Management"
          />
          <DetailRow
            icon={<Activity color="#007AFF" size={18} />}
            label="Current Stage"
            value="Assessment"
          />
          <DetailRow
            icon={<History color="#8E8E93" size={18} />}
            label="Last update"
            value="Reviewed Aug 30"
          />
        </EMRCard>

        <EMRCard
          icon={<TestTube2 color="#00D09E" size={24} />}
          title="Tests & Results"
          subtitle="Lab work, scans, and results."
          onPress={() => {}}
        >
          <DetailRow
            icon={<FileText color="#007AFF" size={18} />}
            label="Latest Test"
            value="Blood Sugar - Normal (Aug 28)"
          />
          <DetailRow
            icon={<Calendar color="#8E8E93" size={18} />}
            label="Next Scheduled Test"
            value="X-ray on Sept 3"
          />
        </EMRCard>

        <EMRCard
          icon={<Pill color="#00D09E" size={24} />}
          title="Medications (Active)"
          subtitle="Current prescriptions and dosages."
          onPress={() => {}}
        >
          <DetailRow
            icon={<Droplets color="#1C1C1E" size={18} />}
            label="Current Prescription"
            value="Amlodipine 5mg daily"
          />
          <DetailRow
            icon={<Activity color="#007AFF" size={18} />}
            label="Status"
            value="Ongoing"
          />
          <DetailRow
            icon={<History color="#8E8E93" size={18} />}
            label="Last update"
            value="Prescribed Aug 25 by Dr. Okoro"
          />
        </EMRCard>

        <EMRCard
          icon={<FileText color="#007AFF" size={24} />}
          title="Reports & Documents"
          subtitle="Referrals, discharge notes, and other doc..."
          onPress={() => {}}
        >
          <DetailRow
            icon={<FileText color="#5856D6" size={18} />}
            label="Referral Letter"
            value="To Cardiologist (Aug 27)"
          />
          <DetailRow
            icon={<FileText color="#007AFF" size={18} />}
            label="Discharge Summary"
            value="Completed Aug 22"
          />
        </EMRCard>

        <EMRCard
          icon={<Heart color="#00E5FF" size={24} />}
          title="Care Status"
          subtitle="Current status and duration of care."
          onPress={() => {}}
        >
          <DetailRow
            icon={<Activity color="#007AFF" size={18} />}
            label="Current Status"
            value="Active Care (Hypertension management)"
          />
          <DetailRow
            icon={<Clock color="#8E8E93" size={18} />}
            label="Duration"
            value="2 months (since Jul 1, 2025)"
          />
        </EMRCard>

        <View style={{ height: 40 }} />
      </ScrollView>

      <UpdateEMROverlay
        visible={isUpdateModalVisible}
        onClose={() => setIsUpdateModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 25,
    marginBottom: 15,
  },
  requestsScroll: {
    gap: 12,
    paddingBottom: 5,
  },
  requestCard: {
    width: width * 0.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  requestSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  requestTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
});
