import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lightbulb } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

const HEALTH_TIPS = [
  {
    title: 'Stay Hydrated',
    description:
      'Drink a glass of water. Dehydration can sometimes make headaches worse.',
  },
  {
    title: 'Find a Quiet Space',
    description:
      'Rest in a dark, quiet room. This can help reduce headache symptoms.',
  },
  {
    title: 'Apply Cold Compress',
    description: 'Place a cold compress on your forehead for 15 minutes.',
  },
  {
    title: 'Practice Deep Breathing',
    description: 'Take slow, deep breaths to help relax and reduce stress.',
  },
];

export default function TriageWaitingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sessionId } = params;

  const [minutes, setMinutes] = useState(14);
  const [seconds, setSeconds] = useState(53);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [nurseName, setNurseName] = useState('Sophia Patel');

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(timer);
        processTriageOutcome();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds]);

  useEffect(() => {
    const tipRotation = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
    }, 10000);

    return () => clearInterval(tipRotation);
  }, []);

  const loadSession = async () => {
    try {
      const { data: sessionData } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData);
        setNurseName(sessionData.nurse_name || 'Sophia Patel');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const processTriageOutcome = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: responses } = await supabase
        .from('triage_responses')
        .select('question_text, answer')
        .eq('session_id', sessionId);

      let severity: 'emergency' | 'caution' | 'low_risk' = 'low_risk';
      let title = 'Assessment Complete';
      let description =
        'Based on your symptoms, we recommend scheduling a consultation with a healthcare provider.';
      let symptoms =
        session?.symptom_name ||
        session?.all_symptoms?.join(', ') ||
        'General symptoms';
      let recommendation = 'Schedule consultation';

      if (responses && responses.length > 0) {
        severity = calculateSeverity(responses);
        const details = getSeverityDetails(severity, responses);
        title = details.title;
        description = details.description;
        symptoms = details.symptoms;
        recommendation = details.recommendation;
      } else {
        symptoms =
          session?.all_symptoms?.join(', ') ||
          session?.symptom_name ||
          'General symptoms';
      }

      await supabase.from('triage_outcomes').insert({
        session_id: sessionId,
        user_id: user.user.id,
        symptom_name: session?.symptom_name || 'Multiple symptoms',
        severity: severity,
        severity_title: title,
        severity_description: description,
        symptoms_summary: symptoms,
        recommendation: recommendation,
        nurse_name: nurseName,
        estimated_wait_minutes: 15,
      });

      router.replace(`/triage-outcome?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error processing outcome:', error);
    }
  };

  const calculateSeverity = (
    responses: any[],
  ): 'emergency' | 'caution' | 'low_risk' => {
    let riskScore = 0;

    responses.forEach((response) => {
      const answer = response.answer;

      if (response.question_text.includes('history of high blood pressure')) {
        if (answer === 'Yes') riskScore += 2;
      }

      if (response.question_text.includes('blood pressure medication')) {
        if (answer === 'Yes') riskScore += 1;
      }

      if (
        response.question_text.includes('experiencing any of the following')
      ) {
        try {
          const symptoms = JSON.parse(answer);
          if (
            symptoms.includes('Chest discomfort') ||
            symptoms.includes('Shortness of breath')
          ) {
            riskScore += 5;
          }
          if (
            symptoms.includes('Blurred vision') ||
            symptoms.includes('Dizziness / lightheadedness')
          ) {
            riskScore += 3;
          }
        } catch (e) {}
      }

      if (response.question_text.includes('How severe')) {
        if (answer === 'Severe') riskScore += 4;
        if (answer === 'Moderate') riskScore += 2;
      }

      if (response.question_text.includes('worst headache ever')) {
        if (answer === 'Yes') riskScore += 5;
      }
    });

    if (riskScore >= 8) return 'emergency';
    if (riskScore >= 4) return 'caution';
    return 'low_risk';
  };

  const getSeverityDetails = (severity: string, responses: any[]) => {
    const symptomsArray: string[] = [];

    responses.forEach((response) => {
      if (
        response.question_text.includes('experiencing any of the following')
      ) {
        try {
          const symptoms = JSON.parse(response.answer);
          symptomsArray.push(
            ...symptoms.filter((s: string) => s !== 'None of these'),
          );
        } catch (e) {}
      }

      if (response.question_text.includes('How severe')) {
        symptomsArray.push(`${response.answer} headache`);
      }
    });

    const symptomsText = symptomsArray.join(', ');

    if (severity === 'emergency') {
      return {
        title: 'This may be an emergency.',
        description:
          'Your symptoms suggest very high blood pressure and possible complications. Please seek emergency care immediately.\n\nAfter urgent treatment, you may be referred to a cardiologist for ongoing care.',
        symptoms:
          symptomsText ||
          'Severe/sudden headache, vision changes, chest pain, shortness of breath.',
        recommendation: 'Seek emergency care immediately',
      };
    }

    if (severity === 'caution') {
      return {
        title: 'You may have high blood pressure.',
        description:
          'Your symptoms could be related to hypertension. We recommend checking your blood pressure and booking a consultation.',
        symptoms:
          symptomsText ||
          'Headache + dizziness or blurred vision, with history/risk of high blood pressure.',
        recommendation: 'Check blood pressure and book consultation',
      };
    }

    return {
      title: 'No urgent concern detected.',
      description:
        "Your answers don't suggest severe high blood pressure. Monitor your symptoms, and seek care if they persist or worsen.",
      symptoms:
        symptomsText ||
        'Headache mild, short-lived, no major risk factors, no alarming symptoms.',
      recommendation: 'Monitor symptoms',
    };
  };

  const handleNotifyMe = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const totalSeconds = minutes * 60 + seconds;
      const endTime = new Date(Date.now() + totalSeconds * 1000).toISOString();

      await supabase.from('triage_timers').insert({
        user_id: user.id,
        session_id: sessionId,
        symptom_name: session?.symptom_name || 'Unknown symptom',
        nurse_name: nurseName,
        end_time: endTime,
        status: 'active',
      });

      router.push('/(tabs)');
    } catch (error) {
      console.error('Error creating timer:', error);
    }
  };

  const currentTip = HEALTH_TIPS[currentTipIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your triage is being reviewed</Text>

        <View style={styles.timerContainer}>
          <View style={styles.timerRing}>
            <View style={styles.timerContent}>
              <View style={styles.timerLabels}>
                <Text style={styles.timerLabel}>MIN</Text>
                <Text style={styles.timerLabel}>SEC</Text>
              </View>
              <View style={styles.timerNumbers}>
                <Text style={styles.timerNumber}>
                  {String(minutes).padStart(2, '0')}
                </Text>
                <Text style={styles.timerColon}>:</Text>
                <Text style={styles.timerNumber}>
                  {String(seconds).padStart(2, '0')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.tipsTitle}>While you wait, you can</Text>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Lightbulb size={32} color="#00D9FF" fill="#00D9FF" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{currentTip.title}</Text>
            <Text style={styles.tipDescription}>{currentTip.description}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated wait</Text>
            <Text style={styles.infoValue}>15 minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Who's reviewing</Text>
            <Text style={styles.infoValue}>{nurseName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Privacy</Text>
            <Text style={styles.infoValue}>
              Your responses are confidential
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNotifyMe}
          style={styles.notifyButtonContainer}
        >
          <LinearGradient
            colors={['#00D9FF', '#0099FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.notifyButton}
          >
            <Text style={styles.notifyButtonText}>Notify me when ready</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  timerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerLabels: {
    flexDirection: 'row',
    gap: 80,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 2,
  },
  timerNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: '#000',
  },
  timerColon: {
    fontSize: 72,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  tipIcon: {
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notifyButtonContainer: {
    width: '100%',
  },
  notifyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
