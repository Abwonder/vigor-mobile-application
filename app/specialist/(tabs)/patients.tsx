import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Search, Plus, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';

const { width } = Dimensions.get('window');

const FILTER_TABS = ['Current', 'New cases', 'Resigned', 'Closed'];

interface PatientListProps {
  name: string;
  condition: string;
  avatar: string;
  unreadCount?: number;
  onPress: () => void;
}

const PatientItem: React.FC<PatientListProps> = ({
  name,
  condition,
  avatar,
  unreadCount,
  onPress,
}) => (
  <TouchableOpacity style={styles.patientItem} onPress={onPress}>
    <Image source={{ uri: avatar }} style={styles.avatar} />
    <View style={styles.patientInfo}>
      <Text style={styles.patientName}>{name}</Text>
      <Text style={styles.patientCondition}>{condition}</Text>
    </View>
    {unreadCount ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{unreadCount}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

export default function PatientsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Current');

  const shortTermPatients = [
    {
      id: '1',
      name: 'Lila Grace',
      condition: 'Arrhythmia',
      avatar: 'https://i.pravatar.cc/150?u=lila',
      unreadCount: 29,
    },
    {
      id: '2',
      name: 'Maya Rivers',
      condition: 'Atherosclerosis',
      avatar: 'https://i.pravatar.cc/150?u=maya',
    },
  ];

  const longTermPatients = [
    {
      id: '3',
      name: 'Sonya Queen',
      condition: 'Hypertension',
      avatar: 'https://i.pravatar.cc/150?u=sonya',
      unreadCount: 29,
    },
    {
      id: '4',
      name: 'Maxwell King',
      condition: 'Congestive Heart Failure',
      avatar: 'https://i.pravatar.cc/150?u=maxwell',
      unreadCount: 29,
    },
    {
      id: '5',
      name: 'Oliver Prince',
      condition: 'Coronary Artery Disease',
      avatar: 'https://i.pravatar.cc/150?u=oliver',
      unreadCount: 29,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patients</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Plus color="#1C1C1E" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Search color="#1C1C1E" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Short term section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Short term patients</Text>
          <TouchableOpacity>
            <Info color="#8E8E93" size={18} />
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          {shortTermPatients.map((patient) => (
            <PatientItem
              key={patient.id}
              {...patient}
              onPress={() => router.push(`/patients/${patient.id}`)}
            />
          ))}
        </View>

        {/* Long term section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Long term patients</Text>
          <TouchableOpacity>
            <Info color="#8E8E93" size={18} />
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          {longTermPatients.map((patient) => (
            <PatientItem
              key={patient.id}
              {...patient}
              onPress={() => router.push(`/patients/${patient.id}`)}
            />
          ))}
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 28,
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 15,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeTab: {
    backgroundColor: '#007AFF15',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  listContainer: {
    gap: 12,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  patientInfo: {
    flex: 1,
    marginLeft: 15,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  patientCondition: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FF3B30',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
