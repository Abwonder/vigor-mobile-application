import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
      'Drink a glass of water. Dehydration can sometimes make symptoms worse.',
  },
  {
    title: 'Find a Quiet Space',
    description: 'Rest in a dark, quiet room. This can help reduce symptoms.',
  },
  {
    title: 'Practice Deep Breathing',
    description: 'Take slow, deep breaths to help relax and reduce stress.',
  },
  {
    title: 'Stay Calm',
    description: 'Your health professional will review your responses shortly.',
  },
];

export default function TriageWaitingAIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sessionId } = params;

  const [minutes, setMinutes] = useState(14);
  const [seconds, setSeconds] = useState(53);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [nurseName, setNurseName] = useState('Sophia Patel');
  const [processing, setProcessing] = useState(false);
  const [healthTips, setHealthTips] = useState(HEALTH_TIPS);

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
        processTriageWithAI();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds]);

  useEffect(() => {
    const tipRotation = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 10000);

    return () => clearInterval(tipRotation);
  }, [healthTips]);

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

        const { data: tips } = await supabase
          .from('health_tips')
          .select('title, description')
          .in('symptom_category', [sessionData.symptom_name, 'All'])
          .eq('is_active', true)
          .order('order_number');

        if (tips && tips.length > 0) {
          setHealthTips(tips);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  /**
   * AI-POWERED ASSESSMENT (Google Gemini)
   *
   * This function calls the Edge Function that uses Google Gemini AI to:
   * 1. Analyze all patient responses
   * 2. Calculate risk score using AI-generated weights
   * 3. Generate personalized severity assessment
   * 4. Create specific recommendations
   *
   * Note: Uses Gemini 1.5 Flash - fast, free, and excellent quality!
   */
  const processTriageWithAI = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user.user) return;

      // Call AI assessment Edge Function
      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/assess-triage-responses`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          symptomName: session?.symptom_name || 'Unknown',
        }),
      });

      if (!response.ok) {
        throw new Error('AI assessment failed');
      }

      const assessment = await response.json();

      // Store the AI-generated outcome in database
      await supabase.from('triage_outcomes').insert({
        session_id: sessionId,
        user_id: user.user.id,
        symptom_name: session?.symptom_name || 'Unknown',
        severity: assessment.severity,
        severity_title: assessment.severity_title,
        severity_description: assessment.severity_description,
        symptoms_summary: assessment.symptoms_summary,
        recommendation: assessment.recommendation,
        nurse_name: nurseName,
        estimated_wait_minutes: 15,
      });

      router.replace(`/triage-outcome?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error processing with AI:', error);
      // Fallback to rule-based system
      await processTriageWithRules();
    } finally {
      setProcessing(false);
    }
  };

  /**
   * FALLBACK: RULE-BASED ASSESSMENT
   *
   * This is used if AI assessment fails or is unavailable.
   * Uses the weighted scoring system from the database.
   */
  const processTriageWithRules = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: responses } = await supabase
        .from('triage_responses')
        .select(
          `
          question_text,
          answer,
          triage_questions (
            risk_weights
          )
        `,
        )
        .eq('session_id', sessionId);

      if (!responses) return;

      // Calculate risk score using database weights
      let totalRiskScore = 0;
      const symptomsList: string[] = [];

      responses.forEach((response: any) => {
        const riskWeights = response.triage_questions?.risk_weights || {};

        // Handle multi-select answers
        let answers: string[] = [];
        try {
          answers = JSON.parse(response.answer);
        } catch {
          answers = [response.answer];
        }

        // Sum up risk points
        answers.forEach((answer: string) => {
          const weight = riskWeights[answer] || 0;
          totalRiskScore += weight;

          if (weight > 0 && answer !== 'None of these') {
            symptomsList.push(answer);
          }
        });
      });

      // Determine severity based on total score
      const severity =
        totalRiskScore >= 15
          ? 'emergency'
          : totalRiskScore >= 8
            ? 'caution'
            : 'low_risk';

      const { title, description, recommendation } = getSeverityDetails(
        severity,
        symptomsList.join(', '),
      );

      await supabase.from('triage_outcomes').insert({
        session_id: sessionId,
        user_id: user.user.id,
        symptom_name: session?.symptom_name || 'Unknown',
        severity: severity,
        severity_title: title,
        severity_description: description,
        symptoms_summary: symptomsList.join(', '),
        recommendation: recommendation,
        nurse_name: nurseName,
        estimated_wait_minutes: 15,
      });

      router.replace(`/triage-outcome?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error with rule-based assessment:', error);
    }
  };

  const getSeverityDetails = (severity: string, symptomsText: string) => {
    if (severity === 'emergency') {
      return {
        title: 'This may be an emergency.',
        description:
          'Your symptoms suggest a potentially serious condition. Please seek emergency care immediately.',
        recommendation: 'Seek emergency care immediately',
      };
    }

    if (severity === 'caution') {
      return {
        title: 'You should see a healthcare provider.',
        description:
          'Your symptoms indicate you should consult with a healthcare provider soon.',
        recommendation: 'Schedule an appointment within 24-48 hours',
      };
    }

    return {
      title: 'No urgent concern detected.',
      description:
        "Your symptoms don't suggest an urgent issue. Monitor your symptoms and seek care if they persist or worsen.",
      recommendation: 'Monitor symptoms and practice self-care',
    };
  };

  const handleNotifyMe = async () => {
    if (processing) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user.user) return;

      const totalSeconds = minutes * 60 + seconds;
      const endTime = new Date(Date.now() + totalSeconds * 1000).toISOString();

      await supabase.from('triage_timers').insert({
        user_id: user.user.id,
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

  const currentTip = healthTips[currentTipIndex];

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
            <Text style={styles.infoLabel}>Assessment type</Text>
            <Text style={styles.infoValue}>AI-Powered Analysis</Text>
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
          disabled={processing}
        >
          <LinearGradient
            colors={processing ? ['#999', '#777'] : ['#00D9FF', '#0099FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.notifyButton}
          >
            <Text style={styles.notifyButtonText}>
              {processing ? 'Processing...' : 'Notify me when ready'}
            </Text>
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
