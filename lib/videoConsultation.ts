import { supabase } from './supabase';

export interface VideoCallOptions {
  consultationId: string;
  roomType?: 'group' | 'peer-to-peer';
}

export interface StartCallResult {
  success: boolean;
  roomName?: string;
  error?: string;
}

/**
 * Initiate a video call for a consultation
 * Only providers can initiate calls
 */
export async function initiateVideoCall(
  consultationId: string
): Promise<StartCallResult> {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('id, patient_id, provider_id, status')
      .eq('id', consultationId)
      .maybeSingle();

    if (consultationError || !consultation) {
      return { success: false, error: 'Consultation not found' };
    }

    // Verify user is the provider
    if (consultation.provider_id !== user.id) {
      return { success: false, error: 'Only providers can initiate video calls' };
    }

    // Update consultation status
    const roomName = `consultation-${consultationId}`;
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        status: 'active',
        video_room_id: roomName,
      })
      .eq('id', consultationId);

    if (updateError) {
      return { success: false, error: 'Failed to update consultation' };
    }

    return { success: true, roomName };
  } catch (error) {
    console.error('Error initiating video call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a consultation has an active video call
 */
export async function isVideoCallActive(
  consultationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('video_room_id, video_started_at, video_ended_at')
      .eq('id', consultationId)
      .maybeSingle();

    if (error || !data) return false;

    return (
      data.video_room_id !== null &&
      data.video_started_at !== null &&
      data.video_ended_at === null
    );
  } catch (error) {
    console.error('Error checking video call status:', error);
    return false;
  }
}

/**
 * End a video call
 */
export async function endVideoCall(consultationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('consultations')
      .update({
        video_ended_at: new Date().toISOString(),
      })
      .eq('id', consultationId);

    return !error;
  } catch (error) {
    console.error('Error ending video call:', error);
    return false;
  }
}

/**
 * Create a new consultation (for scheduled or on-demand)
 */
export interface CreateConsultationParams {
  providerId: string;
  providerType: 'nurse' | 'specialist';
  specialty?: string;
  triageSessionId?: string;
  isScheduled?: boolean;
  scheduledFor?: string;
}

export async function createConsultation(
  params: CreateConsultationParams
): Promise<{ success: boolean; consultationId?: string; error?: string }> {
  try {
    // Get current user (patient)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create consultation
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: user.id,
        provider_id: params.providerId,
        provider_type: params.providerType,
        specialty: params.specialty,
        triage_session_id: params.triageSessionId,
        status: params.isScheduled ? 'pending' : 'waiting_for_provider',
      })
      .select('id')
      .single();

    if (error || !data) {
      return { success: false, error: 'Failed to create consultation' };
    }

    return { success: true, consultationId: data.id };
  } catch (error) {
    console.error('Error creating consultation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get consultation details
 */
export async function getConsultation(consultationId: string) {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select(
        `
        *,
        patient:patient_id(id, email),
        provider:provider_id(id, email)
      `
      )
      .eq('id', consultationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching consultation:', error);
    return null;
  }
}

/**
 * Get all consultations for current user
 */
export async function getMyConsultations() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
}
