import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  GraduationCap,
  Stethoscope,
  Languages,
  Star,
  Calendar,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

interface Specialist {
  id: string;
  full_name: string;
  specialty: string;
  photo_url: string;
  about: string;
  years_experience: number;
  current_position: string;
  professional_memberships: string[];
  next_available: string;
}

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface Review {
  reviewer_name: string;
  rating: number;
  review_text: string;
}

export default function SpecialistInfoScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<Date[]>([]);

  const [expandedSections, setExpandedSections] = useState<{
    about: boolean;
    experience: boolean;
    education: boolean;
    expertise: boolean;
    languages: boolean;
    reviews: boolean;
    availability: boolean;
  }>({
    about: false,
    experience: false,
    education: false,
    expertise: false,
    languages: false,
    reviews: false,
    availability: false,
  });

  useEffect(() => {
    loadSpecialistData();
  }, [id]);

  const loadSpecialistData = async () => {
    try {
      const { data: specialistData, error: specialistError } = await supabase
        .from('specialists')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (specialistError) throw specialistError;
      setSpecialist(specialistData);

      const { data: educationData } = await supabase
        .from('specialist_education')
        .select('*')
        .eq('specialist_id', id)
        .order('order_index');
      setEducation(educationData || []);

      const { data: expertiseData } = await supabase
        .from('specialist_expertise')
        .select('area')
        .eq('specialist_id', id)
        .order('order_index');
      setExpertise(expertiseData?.map((e) => e.area) || []);

      const { data: languagesData } = await supabase
        .from('specialist_languages')
        .select('language')
        .eq('specialist_id', id)
        .order('order_index');
      setLanguages(languagesData?.map((l) => l.language) || []);

      const { data: reviewsData } = await supabase
        .from('specialist_reviews')
        .select('*')
        .eq('specialist_id', id)
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      const { data: availabilityData } = await supabase
        .from('specialist_availability')
        .select('available_date')
        .eq('specialist_id', id)
        .eq('is_available', true)
        .gte('available_date', new Date().toISOString().split('T')[0])
        .order('available_date');
      setAvailability(
        availabilityData?.map((a) => new Date(a.available_date)) || [],
      );
    } catch (error) {
      console.error('Error loading specialist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#FFD700' : 'transparent'}
            color={star <= rating ? '#FFD700' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const renderCalendar = () => {
    if (availability.length === 0) return null;

    const currentMonth = availability[0];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthName = currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const availableDates = availability.map((d) => d.getDate());

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(
        <View key={`prev-${i}`} style={styles.calendarDay}>
          <Text style={[styles.calendarDayText, styles.otherMonthDay]}>
            {prevMonthDay.getDate()}
          </Text>
        </View>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = availableDates.includes(day);
      days.push(
        <View
          key={day}
          style={[styles.calendarDay, isAvailable && styles.availableDay]}
        >
          <Text
            style={[
              styles.calendarDayText,
              isAvailable && styles.availableDayText,
            ]}
          >
            {day.toString().padStart(2, '0')}
          </Text>
        </View>,
      );
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const nextMonthDay = i - days.length + 1;
      days.push(
        <View key={`next-${i}`} style={styles.calendarDay}>
          <Text style={[styles.calendarDayText, styles.otherMonthDay]}>
            {nextMonthDay.toString().padStart(2, '0')}
          </Text>
        </View>,
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarMonth}>{monthName}</Text>
        <View style={styles.calendarHeader}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <Text key={day} style={styles.calendarHeaderDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>{days}</View>
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>View more availability</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!specialist) {
    return (
      <View style={styles.container}>
        <Text>Specialist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Specialist Info</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Phone size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Video size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: specialist.photo_url }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{specialist.full_name}</Text>
          <Text style={styles.profileSpecialty}>{specialist.specialty}</Text>

          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>
              Next available: {formatDate(specialist.next_available)} – Book now
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionsContainer}>
          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('about')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Info size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>About</Text>
              {expandedSections.about ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.about && (
              <Text style={styles.sectionContent}>{specialist.about}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('experience')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Users size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Experience</Text>
              {expandedSections.experience ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.experience && (
              <View style={styles.sectionContent}>
                <View style={styles.listItem}>
                  <Text style={styles.listItemBullet}>•</Text>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Years in practice</Text>
                    <Text style={styles.listItemText}>
                      {specialist.years_experience} years
                    </Text>
                  </View>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listItemBullet}>•</Text>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Current position</Text>
                    <Text style={styles.listItemText}>
                      {specialist.current_position}
                    </Text>
                  </View>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listItemBullet}>•</Text>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>
                      Professional memberships
                    </Text>
                    {specialist.professional_memberships.map(
                      (membership, index) => (
                        <Text key={index} style={styles.listItemText}>
                          {membership}
                        </Text>
                      ),
                    )}
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('education')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <GraduationCap size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Education & Training</Text>
              {expandedSections.education ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.education && (
              <View style={styles.sectionContent}>
                {education.map((edu, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{edu.degree}</Text>
                      <Text style={styles.listItemText}>{edu.institution}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('expertise')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Stethoscope size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Areas of expertise</Text>
              {expandedSections.expertise ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.expertise && (
              <View style={styles.sectionContent}>
                {expertise.map((area, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('languages')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Languages size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Languages</Text>
              {expandedSections.languages ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.languages && (
              <View style={styles.sectionContent}>
                {languages.map((language, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{language}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('reviews')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Star size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Patient reviews</Text>
              {expandedSections.reviews ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.reviews && (
              <View style={styles.sectionContent}>
                {reviews.map((review, index) => (
                  <View key={index} style={styles.reviewItem}>
                    <Text style={styles.reviewText}>{review.review_text}</Text>
                    {renderStars(review.rating)}
                    <Text style={styles.reviewerName}>
                      – {review.reviewer_name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection('availability')}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Calendar size={20} color="#0066CC" />
              </View>
              <Text style={styles.sectionTitle}>Availability</Text>
              {expandedSections.availability ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedSections.availability && renderCalendar()}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 56,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileSpecialty: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bookButtonText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  sectionsContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    marginTop: 16,
    paddingLeft: 48,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  listItemBullet: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  listItemText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  reviewItem: {
    marginBottom: 24,
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 16,
    paddingLeft: 48,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  calendarHeaderDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  availableDay: {
    backgroundColor: '#BFDBFE',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#111827',
  },
  availableDayText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  otherMonthDay: {
    color: '#D1D5DB',
  },
  viewMoreButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
