# Video Consultation Feature - Complete Guide

## Overview

The video consultation feature enables real-time video calls between healthcare providers (doctors/nurses) and patients. Built with Twilio Programmable Video, it supports camera switching, audio/video controls, picture-in-picture views, and in-call quick actions.

## Features Implemented

### 1. Video Call Controls
- **Camera Toggle**: Turn camera on/off during call
- **Microphone Toggle**: Mute/unmute audio
- **Camera Switching**: Toggle between front and back camera
- **End Call**: Terminate the video session
- **Quick Actions Menu**: Access additional features during call

### 2. User Interface
- **Full-screen remote video**: Provider/patient video feed
- **Picture-in-Picture (PiP)**: Resizable local video preview
- **Call Duration Timer**: Real-time call duration display
- **Connection Quality Indicator**: Visual network quality status
- **Auto-hiding Controls**: Controls fade after 5 seconds of inactivity

### 3. In-Call Quick Actions
Accessible during video calls via the "More" button:
- Upload photos/images
- Upload documents (test results, reports)
- Start symptom triage
- Share vital signs
- Send text messages
- Request prescription refills

### 4. Security & Authorization
- Only **providers** (doctors/nurses) can initiate video calls
- Patients can join calls but cannot start them
- JWT-based authentication for all video sessions
- Secure token generation via Supabase Edge Function

## Architecture

### Database Schema

**consultations table** (extended with video fields):
```sql
- video_room_id (text): Twilio room identifier
- video_started_at (timestamptz): Call start time
- video_ended_at (timestamptz): Call end time
- call_duration_minutes (integer): Auto-calculated duration
- call_recording_url (text): Optional recording link
- call_type (text): 'video' or 'audio_only'
```

### Edge Function: generate-video-token

**Location**: `supabase/functions/generate-video-token/index.ts`

**Purpose**: Generates secure Twilio Video access tokens for authenticated users.

**Authentication**: Requires valid Supabase session token.

**Request Body**:
```json
{
  "consultationId": "uuid",
  "roomName": "optional-room-name"
}
```

**Response**:
```json
{
  "token": "twilio-access-token",
  "roomName": "consultation-{id}",
  "identity": "provider-{userId} | patient-{userId}",
  "consultation": {
    "id": "uuid",
    "status": "active"
  }
}
```

### Components

#### VideoCallScreen
**Location**: `components/VideoCallScreen.tsx`

**Props**:
- `consultationId`: Consultation UUID
- `isProvider`: Boolean indicating if user is provider
- `patientName`: Patient display name
- `providerName`: Provider display name
- `onEndCall`: Callback when call ends
- `onQuickActions`: Callback to open quick actions

**Features**:
- Full-screen video layout
- Resizable PiP local video
- Camera/mic/flip/end call controls
- Connection status overlay
- Call timer with quality indicator

#### VideoQuickActions
**Location**: `components/VideoQuickActions.tsx`

**Props**:
- `visible`: Boolean to show/hide modal
- `onClose`: Callback to close modal
- `onUpload*`: Various upload action callbacks
- `onStart*`: Various feature callbacks

**Features**:
- Bottom sheet modal design
- Scrollable action list
- Icon-based action cards
- Smooth animations

### Utility Functions

**Location**: `lib/videoConsultation.ts`

**Functions**:

1. `initiateVideoCall(consultationId: string)`
   - Initiates video call (provider only)
   - Updates consultation status to 'active'
   - Returns room name on success

2. `isVideoCallActive(consultationId: string)`
   - Checks if consultation has active video call
   - Returns boolean

3. `endVideoCall(consultationId: string)`
   - Ends video call
   - Updates end time and calculates duration
   - Returns boolean success

4. `createConsultation(params: CreateConsultationParams)`
   - Creates new consultation (scheduled or on-demand)
   - Supports both nurse and specialist consultations
   - Links to triage sessions

5. `getConsultation(consultationId: string)`
   - Fetches consultation details with patient/provider info

6. `getMyConsultations()`
   - Fetches all consultations for current user

## User Flows

### Provider Initiates Video Call (Main Flow)

1. **Provider opens consultation**
   - Provider navigates to consultation screen
   - Views patient messages and history

2. **Provider starts video call**
   - Clicks video icon in header
   - System generates Twilio access token
   - Consultation status updated to 'active'
   - Video room created

3. **Patient receives call notification**
   - Patient sees "Doctor calling" notification
   - Patient joins video call
   - Both parties connect to Twilio room

4. **Active video call**
   - Full-screen video interface
   - All controls available
   - Call timer running
   - Can access quick actions

5. **End call**
   - Either party clicks end call button
   - System records end time
   - Duration calculated automatically
   - Returns to consultation chat

### Scheduled Consultation Flow

1. **Patient schedules appointment**
   - Selects provider and time slot
   - Consultation created with 'pending' status

2. **Appointment time arrives**
   - Provider receives notification
   - Provider opens consultation
   - Provider initiates video call (same as main flow)

### On-Demand Consultation Flow

1. **Patient requests immediate consultation**
   - Patient completes triage
   - System assigns available provider
   - Consultation created with 'waiting_for_provider' status

2. **Provider accepts**
   - Provider sees notification
   - Provider opens consultation
   - Provider initiates video call (same as main flow)

## Technical Requirements

### Prerequisites

1. **Twilio Account Setup**
   - Twilio Account SID
   - Twilio API Key SID
   - Twilio API Key Secret
   - Twilio Video enabled

2. **Environment Variables**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_API_KEY_SID=SKxxxxxxxxxxxxx
   TWILIO_API_KEY_SECRET=your_secret
   ```

3. **Expo Development Build**
   - Twilio Video requires native modules
   - Cannot run in Expo Go
   - Must create development build or production build

### Dependencies

```json
{
  "twilio-video": "^2.28.1",
  "@supabase/supabase-js": "^2.58.0",
  "expo-image-picker": "~16.0.5"
}
```

## Testing the Feature

### Local Testing Steps

1. **Set up environment variables**
   - Add Twilio credentials to `.env`
   - Ensure Supabase credentials are configured

2. **Deploy edge function**
   - Edge function should already be deployed
   - Test token generation via Supabase dashboard

3. **Create development build**
   ```bash
   npx expo prebuild
   npx expo run:ios  # or run:android
   ```

4. **Test as provider**
   - Log in as provider account
   - Open a consultation
   - Click video icon to start call
   - Verify video room creation

5. **Test as patient** (separate device/simulator)
   - Log in as patient account
   - Join the same consultation
   - Verify video connection

### Testing Checklist

- [ ] Provider can initiate video call
- [ ] Patient cannot initiate video call (button disabled)
- [ ] Video token generation works
- [ ] Camera toggle functions
- [ ] Microphone toggle functions
- [ ] Camera flip works (mobile only)
- [ ] PiP view resizes correctly
- [ ] End call updates database correctly
- [ ] Call duration calculated accurately
- [ ] Quick actions modal opens
- [ ] Network quality indicator updates

## Known Limitations

1. **Platform Support**
   - Web: Not fully supported (Twilio Video has limited web support)
   - iOS/Android: Full support with native build
   - Expo Go: Not supported (requires native modules)

2. **Network Requirements**
   - Requires stable internet connection
   - Minimum 1 Mbps upload/download for video
   - 3 Mbps+ recommended for HD quality

3. **Twilio Pricing**
   - Group rooms: $0.0015/participant/minute
   - Free tier: 10,000 minutes for testing
   - Production requires billing setup

## Future Enhancements

1. **Screen Sharing**
   - Share medical documents during call
   - Twilio supports screen sharing

2. **Call Recording**
   - Record consultations for medical records
   - Requires patient consent
   - Storage in Supabase Storage

3. **Multiple Participants**
   - Group consultations with multiple providers
   - Family members join patient consultation

4. **Background Mode**
   - Continue call when app backgrounded
   - PiP mode for iOS/Android

5. **Call Quality Analytics**
   - Track connection issues
   - Network diagnostics
   - User experience metrics

## Troubleshooting

### "Cannot start video call" Error
- Verify Twilio credentials in `.env`
- Check edge function deployment
- Ensure user is a provider

### "Video not appearing" Issue
- Verify camera permissions granted
- Check device camera functionality
- Try switching cameras

### "Connection issues" Problems
- Test internet connection speed
- Check firewall/network restrictions
- Verify Twilio service status

### "Edge function error" Message
- Check Supabase logs for edge function
- Verify JWT token is valid
- Ensure consultation exists

## API Reference

### Generate Video Token Endpoint

```typescript
POST /functions/v1/generate-video-token

Headers:
  Authorization: Bearer {supabase-access-token}
  Content-Type: application/json

Body:
  {
    "consultationId": "uuid",
    "roomName": "optional"
  }

Response:
  {
    "token": "string",
    "roomName": "string",
    "identity": "string",
    "consultation": {
      "id": "uuid",
      "status": "string"
    }
  }
```

### Update Consultation Video Status

```typescript
// Start video call
supabase
  .from('consultations')
  .update({
    video_room_id: 'room-name',
    video_started_at: new Date().toISOString(),
    call_type: 'video'
  })
  .eq('id', consultationId)

// End video call
supabase
  .from('consultations')
  .update({
    video_ended_at: new Date().toISOString()
  })
  .eq('id', consultationId)
// Duration is auto-calculated by database trigger
```

## Support

For issues or questions:
1. Check Twilio Video documentation: https://www.twilio.com/docs/video
2. Review Supabase Edge Functions guide: https://supabase.com/docs/guides/functions
3. Check console logs for detailed error messages
4. Verify all environment variables are set correctly
