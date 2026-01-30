import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  MoreVertical,
  Maximize2,
} from 'lucide-react-native';

interface VideoCallScreenProps {
  consultationId: string;
  isProvider: boolean;
  patientName?: string;
  providerName?: string;
  onEndCall: () => void;
  onQuickActions: () => void;
}

interface CallStats {
  duration: number;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export default function VideoCallScreen({
  consultationId,
  isProvider,
  patientName,
  providerName,
  onEndCall,
  onQuickActions,
}: VideoCallScreenProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    connectionQuality: 'excellent',
  });
  const [isConnecting, setIsConnecting] = useState(true);
  const [isPiPExpanded, setIsPiPExpanded] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer
  useEffect(() => {
    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    timerRef.current = setInterval(() => {
      setCallStats((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000) as ReturnType<typeof setInterval>;

    return () => {
      clearTimeout(connectTimeout);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !isConnecting) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [showControls, isConnecting]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onEndCall();
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <View style={styles.container}>
      {/* Remote Video (Full Screen) */}
      <TouchableOpacity
        style={styles.remoteVideo}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.remoteName}>
            {isProvider ? patientName : providerName}
          </Text>
        </View>

        {/* Connection Status */}
        {isConnecting && (
          <View style={styles.connectingOverlay}>
            <Text style={styles.connectingText}>Connecting...</Text>
          </View>
        )}

        {/* Call Duration */}
        {!isConnecting && showControls && (
          <View style={styles.callDuration}>
            <View
              style={[
                styles.qualityIndicator,
                callStats.connectionQuality === 'excellent' && styles.qualityExcellent,
                callStats.connectionQuality === 'good' && styles.qualityGood,
                callStats.connectionQuality === 'poor' && styles.qualityPoor,
              ]}
            />
            <Text style={styles.durationText}>{formatDuration(callStats.duration)}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Local Video (Picture-in-Picture) */}
      <View style={[styles.localVideo, isPiPExpanded && styles.localVideoExpanded]}>
        <View style={styles.localVideoContent}>
          {!isVideoEnabled && (
            <View style={styles.videoOffOverlay}>
              <VideoOff color="#fff" size={32} />
              <Text style={styles.videoOffText}>Camera Off</Text>
            </View>
          )}
          <Text style={styles.localLabel}>You</Text>
        </View>

        {/* PiP Expand Button */}
        <TouchableOpacity
          style={styles.pipExpandButton}
          onPress={() => setIsPiPExpanded(!isPiPExpanded)}
        >
          <Maximize2 color="#fff" size={16} />
        </TouchableOpacity>
      </View>

      {/* Controls */}
      {showControls && !isConnecting && (
        <View style={styles.controls}>
          {/* Primary Controls */}
          <View style={styles.primaryControls}>
            {/* Video Toggle */}
            <TouchableOpacity
              style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
              onPress={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video color="#fff" size={24} />
              ) : (
                <VideoOff color="#fff" size={24} />
              )}
            </TouchableOpacity>

            {/* Audio Toggle */}
            <TouchableOpacity
              style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
              onPress={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic color="#fff" size={24} />
              ) : (
                <MicOff color="#fff" size={24} />
              )}
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <PhoneOff color="#fff" size={28} />
            </TouchableOpacity>

            {/* Switch Camera */}
            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <SwitchCamera color="#fff" size={24} />
            </TouchableOpacity>

            {/* Quick Actions */}
            <TouchableOpacity style={styles.controlButton} onPress={onQuickActions}>
              <MoreVertical color="#fff" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  callDuration: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  qualityExcellent: {
    backgroundColor: '#10b981',
  },
  qualityGood: {
    backgroundColor: '#f59e0b',
  },
  qualityPoor: {
    backgroundColor: '#ef4444',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  localVideo: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2d2d2d',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideoExpanded: {
    width: 160,
    height: 220,
  },
  localVideoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
  localLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pipExpandButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#ef4444',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
