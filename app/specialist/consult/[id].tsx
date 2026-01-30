import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChatHeader from '../../../components/specialist/ChatHeader';
import {
  MessageBubble,
  ChatInput,
} from '../../../components/specialist/ChatComponents';
import CallSummaryCard from '../../../components/specialist/CallSummaryCard';

const { height } = Dimensions.get('window');

const MOCK_MESSAGES = [
  {
    id: '1',
    type: 'text',
    text: 'Hello Dr. Musa',
    sender: 'specialist',
    time: '9:00 AM',
  },
  {
    id: '2',
    type: 'text',
    text: 'Patient waiting',
    sender: 'system',
    time: '',
  },
];

const LIVE_MOCK_MESSAGES = [
  {
    id: '1',
    type: 'text',
    text: 'Hello Dr. Musa',
    sender: 'specialist',
    time: '9:00 AM',
  },
  {
    id: '2',
    type: 'text',
    text: 'Patient waiting',
    sender: 'system',
    time: '',
  },
  {
    id: '3',
    type: 'text',
    text: 'Consultation is now Live',
    sender: 'system',
    time: '',
  },
  {
    id: '4',
    type: 'call_card',
    cardType: 'missed',
    sender: 'system',
    time: '9:00 AM',
  },
  {
    id: '5',
    type: 'text',
    text: 'Hello, thanks for joining today. I’ll start with a few questions to assess your health.',
    sender: 'patient',
    time: '9:00 AM',
  },
  {
    id: '6',
    type: 'call_card',
    cardType: 'completed',
    duration: '23 mins 45 secs',
    sender: 'system',
    time: '10:15 AM',
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const [timer, setTimer] = useState(45); // Seconds

  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}Sec`;
  };

  const startConsultation = () => setIsLive(true);

  const startVideoCall = () => {
    router.push('/specialist/consult/video-call');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ChatHeader
        name="Sonya Queen"
        role="Patient"
        avatar="https://i.pravatar.cc/150?u=sonya"
        onVideoPress={startVideoCall}
      />

      {/* Consultation Status Bar */}
      <View
        style={[
          styles.statusBar,
          isLive ? styles.liveStatusBar : styles.pendingStatusBar,
        ]}
      >
        <Text style={styles.statusText}>
          {isLive
            ? 'Live Consultation 9:00AM - 9:45AM'
            : 'Pending – Patient is waiting'}
        </Text>
        {isLive && <Text style={styles.timerText}>{formatTime(timer)}</Text>}
      </View>

      <ImageBackground
        source={require('../../../assets/vigor-logo.jpeg')} // Using logo as a pattern placeholder
        style={styles.chatBackground}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        >
          {
            ((isLive ? LIVE_MOCK_MESSAGES : MOCK_MESSAGES) as any[]).map(
              (msg) => {
                if (msg.type === 'call_card') {
                  return (
                    <CallSummaryCard
                      key={msg.id}
                      type={msg.cardType as any}
                      duration={msg.duration}
                      time={msg.time}
                      doctorName="Dr. Amelia Hart"
                      doctorSpecialty="Cardiologist(MBBS, FWACP)"
                      doctorAvatar="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1000"
                      onCallAgain={startVideoCall}
                      onReschedule={() => {}}
                    />
                  );
                }
                return <MessageBubble key={msg.id} message={msg as any} />;
              },
            ) /* remove one brace here */
          }
        </ScrollView>

        {!isLive && (
          <View style={styles.overlay}>
            <View style={styles.startCard}>
              <Text style={styles.startTitle}>
                Your patient is waiting. Start the consultation to continue.
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startConsultation}
              >
                <Text style={styles.startButtonText}>Start Consultation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ImageBackground>

      <ChatInput />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pendingStatusBar: {
    backgroundColor: '#FFF9E5', // Light yellow
  },
  liveStatusBar: {
    backgroundColor: '#E5FFFA', // Light mint
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Base color for chat background
  },
  backgroundImage: {
    opacity: 0.03, // Subtle pattern
    resizeMode: 'repeat',
  },
  messageList: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  startTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#00D09E',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
