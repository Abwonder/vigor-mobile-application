import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ConsultItem from '../../../components/specialist/ConsultItem';

const FILTERS = ['Active', 'Pending', 'Paused', 'Closed'];

const MOCK_CONSULTS = [
  {
    id: '1',
    name: 'Lila Grace',
    condition: 'Arrhythmia',
    lastMessage: 'Hi, I’d like to schedule a quick follow-up with you this...',
    time: '9:00 AM',
    status: 'Active - One time',
    avatar: 'https://i.pravatar.cc/150?u=lila',
  },
  {
    id: '2',
    name: 'Sonya Queen',
    condition: 'Hypertension',
    lastMessage: 'Hi, I’d like to schedule a quick follow-up with you this...',
    time: '9:00 AM',
    status: 'Active - Long term',
    avatar: 'https://i.pravatar.cc/150?u=sonya',
  },
  {
    id: '3',
    name: 'Maya Rivers',
    condition: 'Atherosclerosis',
    lastMessage: 'Hi, I’d like to schedule a quick follow-up with you this...',
    time: '9:00 AM',
    status: 'Active - Short term',
    avatar: 'https://i.pravatar.cc/150?u=maya',
  },
  {
    id: '4',
    name: 'Oliver Prince',
    condition: 'Coronary Artery Disease',
    lastMessage: 'Hi, I’d like to schedule a quick follow-up with you this...',
    time: '9:00 AM',
    status: 'Active Consultation',
    avatar: 'https://i.pravatar.cc/150?u=oliver',
  },
  {
    id: '5',
    name: 'Maxwell King',
    condition: 'Congestive Heart Failur...',
    lastMessage: 'Hi, I’d like to schedule a quick follow-up with you this...',
    time: '9:00 AM',
    status: 'Active Consultation',
    avatar: 'https://i.pravatar.cc/150?u=maxwell',
  },
];

export default function ConsultsScreen() {
  const [activeFilter, setActiveFilter] = useState('Active');
  const router = useRouter();

  const handleConsultPress = (id: string) => {
    router.push(`/consult/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Consults</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Plus color="#1C1C1E" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search color="#1C1C1E" size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {MOCK_CONSULTS.map((consult) => (
          <ConsultItem
            key={consult.id}
            {...consult}
            onPress={() => handleConsultPress(consult.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Match the light background in design
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  filterContainer: {
    paddingBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#0099FF33', // Light blue background for active
    borderColor: '#0099FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#0099FF',
  },
  listContent: {
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
