import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react-native';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful_count: number;
  view_count: number;
}

export default function FAQDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadFAQ();
  }, [id]);

  const loadFAQ = async () => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFaq(data);
        await supabase
          .from('support_faqs')
          .update({ view_count: data.view_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (isHelpful: boolean) => {
    if (!faq || hasVoted) return;

    try {
      if (isHelpful) {
        await supabase
          .from('support_faqs')
          .update({ helpful_count: faq.helpful_count + 1 })
          .eq('id', faq.id);

        setFaq({ ...faq, helpful_count: faq.helpful_count + 1 });
      }

      setHasVoted(true);
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!faq) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>FAQ not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{faq.category}</Text>
        </View>

        <Text style={styles.question}>{faq.question}</Text>

        <Text style={styles.answer}>{faq.answer}</Text>

        <View style={styles.divider} />

        <Text style={styles.helpfulTitle}>Was this article helpful?</Text>

        {!hasVoted ? (
          <View style={styles.helpfulButtons}>
            <TouchableOpacity
              style={styles.helpfulButton}
              onPress={() => handleHelpful(true)}
            >
              <ThumbsUp size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.helpfulButtonText}>Yes, helpful</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpfulButton}
              onPress={() => handleHelpful(false)}
            >
              <ThumbsDown size={20} color="#EF4444" strokeWidth={2} />
              <Text style={styles.helpfulButtonText}>Not helpful</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.thankYouContainer}>
            <Text style={styles.thankYouText}>
              Thank you for your feedback!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push('/support/submit-ticket')}
        >
          <Text style={styles.contactButtonText}>
            Still need help? Contact Support
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 36,
  },
  answer: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  helpfulTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  helpfulButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpfulButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  thankYouContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  thankYouText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 16,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
