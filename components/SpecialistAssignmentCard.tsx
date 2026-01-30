import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface SpecialistAssignmentCardProps {
  specialistId: string;
  specialistName: string;
  specialty: string;
  credentials: string;
  avatarUrl?: string;
  onStartConsultation: () => void;
}

export default function SpecialistAssignmentCard({
  specialistId,
  specialistName,
  specialty,
  credentials,
  avatarUrl,
  onStartConsultation,
}: SpecialistAssignmentCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{specialistName[0]}</Text>
            </View>
          )}
        </View>

        <Text style={styles.specialistName}>{specialistName}</Text>
        <Text style={styles.specialistCredentials}>
          {specialty}({credentials})
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={onStartConsultation}>
            <LinearGradient
              colors={['#00D9FF', '#0099FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Consultation</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push(`/specialist-info/${specialistId}`)}
          >
            <Text style={styles.secondaryButtonText}>Specialist Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF',
  },
  specialistName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  specialistCredentials: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#0099FF',
  },
  secondaryButtonText: {
    color: '#0099FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
