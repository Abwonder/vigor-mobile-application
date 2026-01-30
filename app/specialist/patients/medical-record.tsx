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
  Dimensions,
} from 'react-native';
import {
  ChevronLeft,
  Plus,
  UserPlus,
  AlertTriangle,
  Activity,
  Pill,
  Stethoscope,
  Users,
  Smartphone,
  ShieldCheck,
  Heart,
  FlaskConical,
  FileText,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  RecordSection,
  DetailRowSmall,
  ListRow,
  SoapNoteCard,
} from '../../../components/specialist/MedicalRecordComponents';

const { width } = Dimensions.get('window');

export default function MedicalRecordScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
        <Text style={styles.headerTitle}>Medical Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Banner Section */}
        <View style={styles.topBanner}>
          <View style={styles.bannerInfo}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3305/3305803.png',
              }}
              style={styles.bannerIcon}
            />
            <View>
              <Text style={styles.bannerTitle}>General health record</Text>
              <Text style={styles.bannerSubtitle}>
                Last update • Aug 29, 2025
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.plusButton}>
            <Plus color="#1C1C1E" size={24} />
          </TouchableOpacity>
        </View>

        {/* Patient Profile Section */}
        <RecordSection
          icon={<UserPlus color="#007AFF" size={24} />}
          title="Patient Profile"
          onEdit={() => {}}
          isFirst
        >
          <DetailRowSmall label="Patient Name" value="Sonya Queen" />
          <DetailRowSmall
            label="Medical Record Number (MRN)"
            value="00457821"
          />
          <DetailRowSmall label="Date of Birth" value="12 March 1963" />
          <DetailRowSmall label="Sex" value="Female" />
          <DetailRowSmall label="Date Created" value="15 July 2025" />
          <DetailRowSmall
            label="Primary Physician"
            value="Dr. A. Bello (Family Medicine)"
          />
          <DetailRowSmall
            label="Hospital"
            value="St. Catherine's Medical Center"
            isLast
          />
        </RecordSection>

        {/* Allergies Section */}
        <RecordSection
          icon={<AlertTriangle color="#FF9500" size={24} />}
          title="Allergies"
          onEdit={() => {}}
        >
          <ListRow
            title="Penicillin"
            subtitle="Rash and swelling"
            date="Recorded 2002"
          />
          <ListRow
            title="Peanuts"
            subtitle="Hives, mild anaphylaxis"
            date="Recorded 2005"
            isLast
          />
        </RecordSection>

        {/* Conditions Section */}
        <RecordSection
          icon={<Activity color="#007AFF" size={24} />}
          title="Conditions / Diagnoses"
          onEdit={() => {}}
        >
          <ListRow
            title="Essential Hypertension"
            subtitle="ICD-10: I10"
            date="Diagnosed 2019"
          />
          <ListRow
            title="Type 2 Diabetes Mellitus"
            subtitle="ICD-10: E11.9"
            date="Diagnosed 2021"
          />
          <ListRow
            title="Osteoarthritis (Knee)"
            subtitle="ICD-10: M17.0"
            date="Diagnosed 2018"
            isLast
          />
        </RecordSection>

        {/* Medications Section */}
        <RecordSection
          icon={<Pill color="#007AFF" size={24} />}
          title="Medications"
          onEdit={() => router.push('/patients/medication-form')}
        >
          <ListRow
            title="Metformin 500 mg PO, 1 tab BID"
            subtitle="Prescriber: Dr. Bello"
            date="Started Jan 2022"
          />
          <ListRow
            title="Amlodipine 10 mg PO, 1 tab OD"
            subtitle="Prescriber: Dr. Bello"
            date="Started Apr 2019"
          />
          <ListRow
            title="Acetaminophen 500 mg PO, PRN for pain"
            subtitle="Prescriber: Dr. Bello"
            date="Started Apr 2019"
            isLast
          />
        </RecordSection>

        {/* Surgical History Section */}
        <RecordSection
          icon={<Stethoscope color="#007AFF" size={24} />}
          title="Past Surgical History"
          onEdit={() => {}}
        >
          <ListRow
            title="Appendectomy"
            subtitle="Lagos University Teaching Hospital"
            date="2018"
          />
          <ListRow
            title="Cataract Extraction (Right Eye)"
            subtitle="St. Catherine's Medical Center"
            date="2022"
            isLast
          />
        </RecordSection>

        {/* Family History Section */}
        <RecordSection
          icon={<Users color="#007AFF" size={24} />}
          title="Family History"
          onEdit={() => {}}
        >
          <DetailRowSmall
            label="Mother"
            value="Hypertension (Deceased at 78)"
          />
          <DetailRowSmall
            label="Father"
            value="Type 2 Diabetes (deceased at 82)"
          />
          <DetailRowSmall
            label="Sister"
            value="Breast cancer (diagnosed 2017)"
            isLast
          />
        </RecordSection>

        {/* Social History Section */}
        <RecordSection
          icon={<Smartphone color="#007AFF" size={24} />}
          title="Social History"
          onEdit={() => {}}
        >
          <DetailRowSmall label="Non-smoker" value="Started Jan 2022" />
          <DetailRowSmall
            label="Occasional alcohol use"
            value="wine, 1-2 glasses/month"
          />
          <DetailRowSmall
            label="Retired teacher"
            value="Started Apr 2019"
            isLast
          />
        </RecordSection>

        {/* Immunizations Section */}
        <RecordSection
          icon={<ShieldCheck color="#007AFF" size={24} />}
          title="Immunizations"
          onEdit={() => {}}
        >
          <ListRow
            title="COVID-19 (Pfizer)"
            subtitle="2 doses"
            date="Completed 2021"
          />
          <ListRow title="Influenza vaccine" date="2024" />
          <ListRow title="Tetanus booster" date="2020" isLast />
        </RecordSection>

        {/* Vitals Section */}
        <RecordSection
          icon={<Heart color="#FF2D55" size={24} />}
          title="Vitals"
          onEdit={() => {}}
        >
          <DetailRowSmall label="BP (Blood Pressure)" value="152/92 mmHg" />
          <DetailRowSmall label="HR (Heart Rate)" value="82 bpm" />
          <DetailRowSmall label="Temp (Temperature)" value="36.7 °C" />
          <DetailRowSmall label="Weight" value="74 kg" />
          <DetailRowSmall
            label="BMI (Body Mass Index)"
            value="28.5 kg/m²"
            isLast
          />
        </RecordSection>

        {/* Lab Results Section */}
        <RecordSection
          icon={<FlaskConical color="#007AFF" size={24} />}
          title="Lab Results"
          onEdit={() => {}}
        >
          <ListRow
            title="Fasting Blood Glucose"
            subtitle="145 mg/dL (H) [Ref: 70-110 mg/dL]"
            date="10 July 2025"
          />
          <ListRow
            title="HbA1c"
            subtitle="7.8% (H) [Ref: < 6.5%]"
            date="10 July 2025"
          />
          <ListRow
            title="Lipid Panel"
            subtitle="Total Chol: 185, LDL: 110, HDL: 42"
            date="10 July 2025"
          />
          <ListRow
            title="Renal Function"
            subtitle="Creatinine 0.9 mg/dL (Normal)"
            date="10 July 2025"
            isLast
          />
        </RecordSection>

        {/* Clinical Note Section */}
        <RecordSection
          icon={<FileText color="#007AFF" size={24} />}
          title="Note"
          onEdit={() => {}}
        >
          <SoapNoteCard
            label="SOAP"
            date="10 July 2025"
            content={`S - Subjective: Patient reports intermittent headaches and knee pain...
O - Objective: BP 152/92 mmHg, BMI 28.5, HbA1c 7.8%...
A - Assessment: 1. Hypertension - uncontrolled...
P - Plan: Increase Amlodipine to 10 mg OD, Follow-up in 6 weeks.`}
          />
        </RecordSection>

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
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  content: {
    flex: 1,
  },
  topBanner: {
    backgroundColor: '#E0F7FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingBottom: 45, // Leave room for section overlap
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bannerIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004080',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#006699',
    marginTop: 2,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
