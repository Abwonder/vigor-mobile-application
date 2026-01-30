import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  UserPlus,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Clipboard,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const itemWidth = (width - 52) / 2; // 20 padding each side + 12 gap

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  badgeCount?: number;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  icon,
  badgeCount,
  onPress,
}) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      {icon}
      {badgeCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const QuickActions: React.FC = () => {
  const actions = [
    {
      id: 'assigned',
      title: 'Newly Assigned Patient',
      icon: <UserPlus color="#00D09E" size={24} />,
      badgeCount: 29,
    },
    {
      id: 'appointment',
      title: 'New Appointment',
      icon: <Calendar color="#0099FF" size={24} />,
      badgeCount: 29,
    },
    {
      id: 'requests',
      title: 'Patient Requests',
      icon: <Users color="#00D09E" size={24} />,
      badgeCount: 29,
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: <MessageSquare color="#00D09E" size={24} />,
      badgeCount: 29,
    },
    {
      id: 'prescription',
      title: 'Write Prescription',
      icon: <FileText color="#00D09E" size={24} />,
    },
    {
      id: 'medical_record',
      title: 'Update Medical Record',
      icon: <Clipboard color="#00D09E" size={24} />,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <QuickAction
          key={action.id}
          title={action.title}
          icon={action.icon}
          badgeCount={action.badgeCount}
          onPress={() => {}}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  actionItem: {
    width: itemWidth,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EB5757',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default QuickActions;
