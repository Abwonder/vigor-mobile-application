import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Clock, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationCountChange: (count: number) => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface TriageTimer {
  id: string;
  session_id: string;
  symptom_name: string;
  nurse_name: string;
  end_time: string;
  status: string;
  created_at: string;
}

export function NotificationsModal({
  visible,
  onClose,
  onNotificationCountChange,
}: NotificationsModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTimers, setActiveTimers] = useState<TriageTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerCounts, setTimerCounts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible) {
      loadData();
      const interval = setInterval(updateTimerCounts, 1000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [notificationsResult, timersResult] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('triage_timers')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (timersResult.data) {
        setActiveTimers(timersResult.data);
      }

      const unreadCount =
        (notificationsResult.data?.filter((n) => !n.is_read).length || 0) +
        (timersResult.data?.length || 0);
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimerCounts = () => {
    const now = new Date().getTime();
    const counts: { [key: string]: string } = {};

    activeTimers.forEach((timer) => {
      const endTime = new Date(timer.end_time).getTime();
      const remaining = Math.max(0, endTime - now);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (remaining > 0) {
        counts[timer.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        counts[timer.id] = 'Ready';
      }
    });

    setTimerCounts(counts);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );

      const unreadCount =
        notifications.filter((n) => !n.is_read && n.id !== notificationId)
          .length + activeTimers.length;
      onNotificationCountChange(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    await handleMarkAsRead(notification.id);

    if (notification.data?.sessionId) {
      onClose();
      router.push(`/triage-outcome?sessionId=${notification.data.sessionId}`);
    }
  };

  const handleTimerPress = (timer: TriageTimer) => {
    onClose();
    router.push(`/triage-waiting?sessionId=${timer.session_id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {activeTimers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Active Triage</Text>
                  {activeTimers.map((timer) => (
                    <TouchableOpacity
                      key={timer.id}
                      style={styles.timerCard}
                      onPress={() => handleTimerPress(timer)}
                    >
                      <View style={styles.timerIcon}>
                        <Clock size={24} color="#0EA5E9" />
                      </View>
                      <View style={styles.timerContent}>
                        <Text style={styles.timerTitle}>
                          Triage in progress
                        </Text>
                        <Text style={styles.timerSubtitle}>
                          {timer.symptom_name}
                        </Text>
                        <Text style={styles.timerTime}>
                          Time remaining:{' '}
                          {timerCounts[timer.id] || 'Calculating...'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {notifications.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent</Text>
                  {notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationCard,
                        !notification.is_read && styles.notificationCardUnread,
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationIcon}>
                        <CheckCircle
                          size={24}
                          color={notification.is_read ? '#9CA3AF' : '#0EA5E9'}
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.is_read &&
                              styles.notificationTitleUnread,
                          ]}
                        >
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTime(notification.created_at)}
                        </Text>
                      </View>
                      {!notification.is_read && (
                        <View style={styles.unreadDot} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {notifications.length === 0 && activeTimers.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    marginBottom: 8,
  },
  timerIcon: {
    marginRight: 16,
  },
  timerContent: {
    flex: 1,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timerTime: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationCardUnread: {
    backgroundColor: '#F9FAFB',
  },
  notificationIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
    marginLeft: 8,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
