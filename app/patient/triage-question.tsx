import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, ChevronLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'multi_select' | 'text_input';
  options: string[];
  order_number: number;
}

export default function TriageQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sessionId } = params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [customOtherText, setCustomOtherText] = useState('');
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [nurseName, setNurseName] = useState('Sophia');

  useEffect(() => {
    loadTriageSession();
    loadNurseName();
  }, []);

  const loadTriageSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('triage_questions')
        .select('*')
        .eq('symptom_id', sessionData.symptom_id)
        .order('order_number', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
      setCurrentQuestionIndex(sessionData.current_question || 0);
    } catch (error) {
      console.error('Error loading triage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNurseName = async () => {
    try {
      const { data: activeNurse } = await supabase
        .from('nurses')
        .select('name')
        .eq('is_active', true)
        .maybeSingle();

      if (activeNurse?.name) {
        setNurseName(activeNurse.name);
      }
    } catch (error) {
      console.error('Error loading nurse:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressText = `${currentQuestionIndex + 1}/${questions.length}`;
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (answer === 'Other') {
      setShowOtherModal(true);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const handleMultiSelect = (answer: string) => {
    if (selectedAnswers.includes(answer)) {
      setSelectedAnswers(selectedAnswers.filter((a) => a !== answer));
    } else {
      setSelectedAnswers([...selectedAnswers, answer]);
    }
  };

  const handleOtherSubmit = () => {
    if (customOtherText.trim()) {
      if (currentQuestion.question_type === 'multi_select') {
        const otherWithText = `Other: ${customOtherText}`;
        const filtered = selectedAnswers.filter((a) => !a.startsWith('Other:'));
        setSelectedAnswers([...filtered, otherWithText]);
      } else {
        setSelectedAnswer(`Other: ${customOtherText}`);
      }
      setShowOtherModal(false);
      setCustomOtherText('');
    }
  };

  const handleContinue = async () => {
    let answer: string;

    if (currentQuestion.question_type === 'multi_select') {
      if (selectedAnswers.length === 0) return;
      answer = JSON.stringify(selectedAnswers);
    } else if (currentQuestion.question_type === 'text_input') {
      if (!textAnswer.trim()) return;
      answer = textAnswer;
    } else {
      if (!selectedAnswer) return;
      answer = selectedAnswer;
    }

    try {
      await supabase.from('triage_responses').insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        answer: answer,
      });

      await supabase
        .from('triage_sessions')
        .update({ current_question: currentQuestionIndex + 1 })
        .eq('id', sessionId);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setSelectedAnswers([]);
        setTextAnswer('');
      } else {
        await supabase
          .from('triage_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        router.push(`/triage-waiting?sessionId=${sessionId}`);
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setTextAnswer('');
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading || !currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  let canContinue = false;
  if (currentQuestion.question_type === 'multi_select') {
    canContinue = selectedAnswers.length > 0;
  } else if (currentQuestion.question_type === 'text_input') {
    canContinue = textAnswer.trim().length > 0;
  } else {
    canContinue = !!selectedAnswer;
  }

  const displayOptions = [...currentQuestion.options];
  if (currentQuestion.question_type === 'multiple_choice' && customOtherText) {
    const otherIndex = displayOptions.findIndex((opt) => opt === 'Other');
    if (otherIndex !== -1) {
      displayOptions[otherIndex] = `Other: ${customOtherText}`;
    }
  }

  const customOtherAnswers = selectedAnswers.filter((a) =>
    a.startsWith('Other:'),
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <View style={styles.progressHeader}>
          <View style={{ width: 40 }} />
          <Text style={styles.progressText}>{progressText}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nurseContainer}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200',
            }}
            style={styles.nurseAvatar}
          />
          <View style={styles.nurseInfo}>
            <Text style={styles.nurseName}>{nurseName} from Vigor</Text>
            <Text style={styles.nurseTitle}>Public health nurse</Text>
          </View>
        </View>

        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>
            {currentQuestion.question_text}
          </Text>
        </View>

        <Text style={styles.promptText}>
          {currentQuestion.question_type === 'multi_select'
            ? 'Select as many as it may occur'
            : 'Please pick a response'}
        </Text>

        <View style={styles.answersContainer}>
          {currentQuestion.question_type === 'text_input' ? (
            <TextInput
              style={styles.textInput}
              placeholder="Please describe briefly"
              placeholderTextColor="#999"
              value={textAnswer}
              onChangeText={setTextAnswer}
              multiline
              numberOfLines={4}
            />
          ) : currentQuestion.question_type === 'multi_select' ? (
            <>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers.includes(option);
                const isOther = option === 'Other';

                if (isOther && customOtherAnswers.length > 0) {
                  return customOtherAnswers.map((customAnswer, idx) => {
                    const isSelectedCustom =
                      selectedAnswers.includes(customAnswer);
                    return (
                      <TouchableOpacity
                        key={`custom-${idx}`}
                        style={[
                          styles.multiSelectButton,
                          isSelectedCustom && styles.multiSelectButtonSelected,
                        ]}
                        onPress={() => handleMultiSelect(customAnswer)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            isSelectedCustom && styles.checkboxSelected,
                          ]}
                        >
                          {isSelectedCustom && <Check size={18} color="#FFF" />}
                        </View>
                        <Text
                          style={[
                            styles.multiSelectText,
                            isSelectedCustom && styles.multiSelectTextSelected,
                          ]}
                        >
                          {customAnswer}
                        </Text>
                      </TouchableOpacity>
                    );
                  });
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.multiSelectButton,
                      isSelected && styles.multiSelectButtonSelected,
                    ]}
                    onPress={() =>
                      isOther
                        ? setShowOtherModal(true)
                        : handleMultiSelect(option)
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && <Check size={18} color="#FFF" />}
                    </View>
                    <Text
                      style={[
                        styles.multiSelectText,
                        isSelected && styles.multiSelectTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            currentQuestion.options.map((option, index) => {
              const isOther = option === 'Other';
              const displayOption =
                isOther && customOtherText
                  ? `Other: ${customOtherText}`
                  : option;
              const isSelected = selectedAnswer === displayOption;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    isSelected && styles.answerButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                >
                  <Text
                    style={[
                      styles.answerText,
                      isSelected && styles.answerTextSelected,
                    ]}
                  >
                    {displayOption}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#0099FF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButtonContainer}
        >
          <LinearGradient
            colors={
              canContinue ? ['#00D9FF', '#0099FF'] : ['#E0E0E0', '#C0C0C0']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? 'Submit response'
                : 'Continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={showOtherModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentQuestion.question_text}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowOtherModal(false);
                  setCustomOtherText('');
                }}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Other</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Please describe briefly"
              placeholderTextColor="#999"
              value={customOtherText}
              onChangeText={setCustomOtherText}
              multiline
              autoFocus
            />

            <TouchableOpacity
              onPress={handleOtherSubmit}
              disabled={!customOtherText.trim()}
            >
              <LinearGradient
                colors={
                  customOtherText.trim()
                    ? ['#00D9FF', '#0099FF']
                    : ['#E0E0E0', '#C0C0C0']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalContinueButton}
              >
                <Text style={styles.modalContinueButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  progressContainer: {
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0099FF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0099FF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nurseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nurseAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  nurseInfo: {
    flex: 1,
  },
  nurseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  nurseTitle: {
    fontSize: 14,
    color: '#999',
  },
  questionBubble: {
    backgroundColor: '#E8F9F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    lineHeight: 26,
  },
  promptText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  answersContainer: {
    marginBottom: 24,
  },
  answerButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerButtonSelected: {
    backgroundColor: '#00D9A0',
    borderColor: '#00B894',
  },
  answerText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
  answerTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  multiSelectButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  multiSelectButtonSelected: {
    backgroundColor: '#00D9A0',
    borderColor: '#00B894',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  multiSelectText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  multiSelectTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  continueButtonContainer: {
    flex: 1,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  modalTextInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalContinueButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalContinueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
