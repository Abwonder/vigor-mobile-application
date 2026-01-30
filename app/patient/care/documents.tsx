import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  ChevronLeft,
  FileText,
  Calendar,
  User,
  Plus,
} from 'lucide-react-native';

interface Document {
  id: string;
  document_type: string;
  title: string;
  date: string;
  provider: string;
  summary: string | null;
  notes: string | null;
}

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data) setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'referral':
        return 'Referral';
      case 'discharge_summary':
        return 'Discharge Summary';
      case 'clinical_note':
        return 'Clinical Note';
      case 'report':
        return 'Report';
      default:
        return 'Other';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'referral':
        return '#2196F3';
      case 'discharge_summary':
        return '#FF9800';
      case 'clinical_note':
        return '#4CAF50';
      case 'report':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const documentTypes = [
    'all',
    'referral',
    'discharge_summary',
    'clinical_note',
    'report',
  ];

  const filteredDocuments =
    filterType === 'all'
      ? documents
      : documents.filter((doc) => doc.document_type === filterType);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Documents</Text>
        <TouchableOpacity onPress={() => router.push('/care/documents/add')}>
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {documentTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.activeFilterButton,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type && styles.activeFilterButtonText,
              ]}
            >
              {type === 'all' ? 'All' : getTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Documents</Text>
            <Text style={styles.emptyText}>
              Your medical reports and documents will appear here
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/care/documents/add')}
            >
              <Text style={styles.addButtonText}>Add Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocuments.map((document) => (
            <View key={document.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: `${getTypeColor(document.document_type)}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: getTypeColor(document.document_type) },
                    ]}
                  >
                    {getTypeLabel(document.document_type)}
                  </Text>
                </View>
              </View>

              <Text style={styles.documentTitle}>{document.title}</Text>

              <View style={styles.documentDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {new Date(document.date).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <User size={16} color="#666" />
                  <Text style={styles.detailText}>{document.provider}</Text>
                </View>
              </View>

              {document.summary && (
                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>Summary:</Text>
                  <Text style={styles.summaryText}>{document.summary}</Text>
                </View>
              )}

              {document.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{document.notes}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  documentHeader: {
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  documentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summarySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  summaryText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
