import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Star,
} from 'lucide-react-native';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_featured: boolean;
}

interface FAQCategory {
  name: string;
  count: number;
  icon: any;
  color: string;
}

export default function SupportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [featuredFAQs, setFeaturedFAQs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      const { data: faqs, error } = await supabase
        .from('support_faqs')
        .select('*')
        .order('order_position');

      if (error) throw error;

      const featured = faqs?.filter((faq) => faq.is_featured) || [];
      setFeaturedFAQs(featured);

      const categoryMap = new Map<string, number>();
      faqs?.forEach((faq) => {
        categoryMap.set(faq.category, (categoryMap.get(faq.category) || 0) + 1);
      });

      const categoryIcons: Record<string, any> = {
        Account: { icon: FileText, color: '#0EA5E9' },
        Billing: { icon: FileText, color: '#10B981' },
        Medical: { icon: FileText, color: '#EF4444' },
        Technical: { icon: FileText, color: '#F59E0B' },
        Appointments: { icon: FileText, color: '#8B5CF6' },
      };

      const cats: FAQCategory[] = Array.from(categoryMap.entries()).map(
        ([name, count]) => ({
          name,
          count,
          icon: categoryIcons[name]?.icon || FileText,
          color: categoryIcons[name]?.color || '#6B7280',
        }),
      );

      setCategories(cats);
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      color: '#0EA5E9',
      route: '/support/live-chat',
    },
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'support@healthcare.com',
      color: '#10B981',
      route: '/support/email',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      subtitle: '+1 (800) 123-4567',
      color: '#EF4444',
      route: null,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
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
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Popular Questions</Text>

        {featuredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => router.push(`/support/faq/${faq.id}`)}
          >
            <View style={styles.faqIconContainer}>
              <Star size={20} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion} numberOfLines={2}>
                {faq.question}
              </Text>
              <Text style={styles.faqCategory}>{faq.category}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
          Browse by Category
        </Text>

        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() =>
              router.push(`/support/category/${category.name.toLowerCase()}`)
            }
          >
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: category.color + '20' },
              ]}
            >
              <category.icon size={24} color={category.color} strokeWidth={2} />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.count} articles
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
          Contact Support
        </Text>

        {contactOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={() => option.route && router.push(option.route as any)}
            disabled={!option.route}
          >
            <View
              style={[
                styles.contactIconContainer,
                { backgroundColor: option.color + '20' },
              ]}
            >
              <option.icon size={24} color={option.color} strokeWidth={2} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </View>
            {option.route && (
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.submitTicketButton}
          onPress={() => router.push('/support/submit-ticket')}
        >
          <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.submitTicketText}>Submit a Support Ticket</Text>
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleSpacing: {
    marginTop: 32,
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  submitTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  submitTicketText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
