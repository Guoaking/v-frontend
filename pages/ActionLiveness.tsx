import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, StopCircle, RefreshCw, CheckCircle, XCircle, 
  AlertCircle, ChevronLeft, Video, Clock, UserCheck,
  Smartphone, Sun
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { useTheme } from '../App';
import { ApiClient } from '../lib/api';
import { CONFIG } from '../services/config';
import { useAuth } from '../AuthContext';
import { keyService } from '../services/keys';

// Action types
const ACTIONS = [
  { id: 'nod', label: 'Nod', labelZh: '点头', icon: '↕️' },
  { id: 'shake', label: 'Shake Head', labelZh: '摇头', icon: '↔️' },
  { id: 'blink', label: 'Blink', labelZh: '眨眼', icon: '👁️' },
  { id: 'mouth_open', label: 'Open Mouth', labelZh: '张嘴', icon: '👄' },
];

const SESSION_DURATION = 60; // 60 seconds max session

interface ActionChallenge {
  actions: string[];
  session_id: string;
  upload_id: string;
  trace_id: string;
  expires_at: string; // ISO timestamp for session expiration
  third_party?: {
    provider: string;
    session_id?: string;
  };
}

interface VerificationResult {
  passed: boolean;
  reason_codes?: string[];
  message?: string;
  trace_id?: string;
  third_party?: {
    provider: string;
    request_id?: string;
  };
}

export const ActionLiveness: React.FC = () => {
  const { lang } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // State
  const [sessionState, setSessionState] = useState<'idle' | 'starting' | 'recording' | 'uploading' | 'verifying' | 'completed'>('idle');
  const [challenge, setChallenge] = useState<ActionChallenge | null>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  
  const isRecording = sessionState === 'recording';
  const isCompleted = sessionState === 'completed';
  
  // Get API token
  useEffect(() => {
    const fetchToken = async () => {
      if (!user) return;
      try {
        const keysRes = await keyService.getKeys();
        if (keysRes.success && keysRes.data && keysRes.data.length > 0) {
          const activeKey = keysRes.data.find(k => k.status === 'active');
          if (activeKey) {
            const secretRes = await keyService.revealSecret(user.id, activeKey.id);
            if (secretRes.success && secretRes.data) {
              setToken(secretRes.data.secret);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch token:', e);
      }
    };
    fetchToken();
  }, [user]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMedia();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };
  
  const startSession = async () => {
    setError(null);
    setResult(null);
    setSessionState('starting');
    
    try {
      // 1. Initialize camera
      // Be tolerant: some environments (VM/CI/virtual camera) will throw NotFoundError
      // if constraints are too strict (e.g. exact facingMode/resolution).
      const getStream = async () => {
        try {
          return await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          });
        } catch (e) {
          // Fallback: request any available camera
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      };

      const stream = await getStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // 2. Get challenge from backend
      const client = new ApiClient({ 
        baseUrl: CONFIG.API_BASE_URL, 
        token: token 
      });
      
      const response = await client.post<ActionChallenge>('/kyc/liveness/action/session', {});
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create session');
      }
      
      setChallenge(response.data);
      
      // 3. Start countdown
      setCountdown(3);
      let count = 3;
      const countInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countInterval);
          startRecording(response.data);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
      setSessionState('idle');
      stopMedia();
    }
  };
  
  const startRecording = (challengeData: ActionChallenge) => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      handleUpload(videoBlob, challengeData);
    };
    
    mediaRecorder.start();
    setSessionState('recording');
    setRecordingTime(0);
    
    // Recording timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const next = prev + 1;
        // Auto update action index based on time
        const actionDuration = SESSION_DURATION / challengeData.actions.length;
        const newIndex = Math.min(Math.floor(next / actionDuration), challengeData.actions.length - 1);
        setCurrentActionIndex(newIndex);
        
        if (next >= SESSION_DURATION) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  };
  
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };
  
  /**
   * Extract frames from video for backend analysis
   * TODO: Implement frame extraction using canvas or WebCodecs API
   * This is a placeholder for future frame slicing implementation
   */
  const extractFrames = async (videoBlob: Blob): Promise<Blob[]> => {
    // PLACEHOLDER: Frame extraction logic
    // Option 1: Use canvas to draw video frames
    // Option 2: Use WebCodecs API for better performance
    // Option 3: Send video to backend for server-side frame extraction
    
    // Currently returning empty array - backend will extract frames from video
    return [];
  };

  const handleUpload = async (videoBlob: Blob, challengeData: ActionChallenge) => {
    setSessionState('uploading');
    
    try {
      // OPTIONAL: Extract frames before upload (if backend requires pre-sliced frames)
      // const frames = await extractFrames(videoBlob);
      
      const formData = new FormData();
      formData.append('video', videoBlob, 'action-liveness.webm');
      formData.append('session_id', challengeData.session_id);
      formData.append('upload_id', challengeData.upload_id);
      formData.append('trace_id', challengeData.trace_id);
      formData.append('actions', JSON.stringify(challengeData.actions));
      
      // If frames are extracted, append them
      // frames.forEach((frame, idx) => {
      //   formData.append(`frame_${idx}`, frame, `frame_${idx}.jpg`);
      // });
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/kyc/liveness/action/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      // Start verification polling
      startVerification(challengeData);
      
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setSessionState('idle');
      stopMedia();
    }
  };
  
  const startVerification = async (challengeData: ActionChallenge) => {
    setSessionState('verifying');
    
    try {
      const client = new ApiClient({ 
        baseUrl: CONFIG.API_BASE_URL, 
        token: token 
      });
      
      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      
      const poll = async (): Promise<VerificationResult> => {
        const response = await client.get<VerificationResult>(
          `/kyc/liveness/action/result?session_id=${challengeData.session_id}&upload_id=${challengeData.upload_id}`
        );
        
        if (response.success && response.data) {
          return response.data;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Verification timeout');
        }
        
        await new Promise(r => setTimeout(r, 1000));
        return poll();
      };
      
      const result = await poll();
      setResult(result);
      setSessionState('completed');
      
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setSessionState('idle');
    } finally {
      stopMedia();
    }
  };
  
  const reset = () => {
    setSessionState('idle');
    setChallenge(null);
    setCurrentActionIndex(0);
    setCountdown(3);
    setRecordingTime(0);
    setResult(null);
    setError(null);
  };
  
  const getCurrentAction = () => {
    if (!challenge || currentActionIndex >= challenge.actions.length) return null;
    const actionId = challenge.actions[currentActionIndex];
    return ACTIONS.find(a => a.id === actionId) || ACTIONS[0];
  };
  
  const currentAction = getCurrentAction();
  const progress = challenge ? ((currentActionIndex + 1) / challenge.actions.length) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/playground')}>
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Action Liveness Detection
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Complete the sequence of actions to verify liveness
            </p>
          </div>
        </div>
        
        {/* Instructions */}
        {sessionState === 'idle' && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="text-primary-500" />
              Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Smartphone className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Position your face</p>
                  <p className="text-sm text-slate-500">Center your face in the camera frame</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Sun className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Good lighting</p>
                  <p className="text-sm text-slate-500">Ensure your face is well lit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Video className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Follow actions</p>
                  <p className="text-sm text-slate-500">Complete each action as shown</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Clock className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Stay in frame</p>
                  <p className="text-sm text-slate-500">Keep your face visible throughout</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {ACTIONS.map(action => (
                <Badge key={action.id} color="blue" className="px-3 py-1">
                  <span className="mr-1">{action.icon}</span>
                  {lang === 'zh' ? action.labelZh : action.label}
                </Badge>
              ))}
            </div>
          </Card>
        )}
        
        {/* Video Container */}
        <Card className="relative overflow-hidden mb-6">
          <div className="aspect-video bg-slate-900 relative">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isRecording ? 'opacity-100' : 'opacity-80'}`}
            />
            
            {/* Canvas for overlay effects */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            
            {/* Face frame guide */}
            {(sessionState === 'starting' || isRecording) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full" />
              </div>
            )}
            
            {/* Countdown Overlay */}
            {sessionState === 'starting' && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-8xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
              </div>
            )}
            
            {/* Current Action Display */}
            {isRecording && currentAction && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentAction.icon}</span>
                  <span className="text-lg font-semibold">
                    {lang === 'zh' ? currentAction.labelZh : currentAction.label}
                  </span>
                </div>
              </div>
            )}
            
            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </div>
            )}
            
            {/* Progress Bar */}
            {isRecording && challenge && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {/* Idle State */}
            {sessionState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Video className="mx-auto mb-4 text-slate-400" size={64} />
                  <p className="text-slate-400">Camera is off</p>
                </div>
              </div>
            )}
            
            {/* Uploading/Verifying States */}
            {(sessionState === 'uploading' || sessionState === 'verifying') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">
                    {sessionState === 'uploading' ? 'Uploading video...' : 'Verifying...'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Result Display */}
            {isCompleted && result && (
              <div className={`absolute inset-0 flex items-center justify-center ${result.passed ? 'bg-green-900/80' : 'bg-red-900/80'}`}>
                <div className="text-center text-white max-w-md px-6">
                  {result.passed ? (
                    <CheckCircle className="mx-auto mb-4" size={80} />
                  ) : (
                    <XCircle className="mx-auto mb-4" size={80} />
                  )}
                  <h3 className="text-2xl font-bold mb-2">
                    {result.passed ? 'Verification Passed' : 'Verification Failed'}
                  </h3>
                  {result.message && (
                    <p className="text-white/80 text-sm mb-4">{result.message}</p>
                  )}
                  {result.reason_codes && result.reason_codes.length > 0 && (
                    <div className="mt-4 text-sm opacity-90 bg-white/10 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wider mb-2 text-white/60">Reason Codes</p>
                      {result.reason_codes.map((code, idx) => (
                        <span key={idx} className="inline-block bg-white/20 rounded px-2 py-1 m-1 text-xs">
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Debug Info (only in development) */}
                  {(result.trace_id || result.third_party) && (
                    <div className="mt-4 text-xs text-white/50 font-mono">
                      {result.trace_id && <p>Trace: {result.trace_id}</p>}
                      {result.third_party && <p>Provider: {result.third_party.provider}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {sessionState === 'idle' && (
            <Button size="lg" onClick={startSession} className="px-8">
              <Play size={20} className="mr-2" />
              Start Verification
            </Button>
          )}
          
          {isRecording && (
            <Button size="lg" variant="danger" onClick={stopRecording} className="px-8">
              <StopCircle size={20} className="mr-2" />
              Stop ({SESSION_DURATION - recordingTime}s)
            </Button>
          )}
          
          {isCompleted && (
            <Button size="lg" onClick={reset} className="px-8">
              <RefreshCw size={20} className="mr-2" />
              Try Again
            </Button>
          )}
        </div>
        
        {/* Action Sequence Preview */}
        {challenge && challenge.actions.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-500 mb-3">Action Sequence</h4>
            <div className="flex flex-wrap gap-2">
              {challenge.actions.map((actionId, idx) => {
                const action = ACTIONS.find(a => a.id === actionId);
                if (!action) return null;
                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      idx < currentActionIndex 
                        ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700' 
                        : idx === currentActionIndex && isRecording
                        ? 'bg-primary-100 border-primary-300 dark:bg-primary-900/30 dark:border-primary-700 ring-2 ring-primary-500'
                        : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    <span>{action.icon}</span>
                    <span className="text-sm">
                      {lang === 'zh' ? action.labelZh : action.label}
                    </span>
                    {idx < currentActionIndex && <CheckCircle size={14} className="text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionLiveness;
