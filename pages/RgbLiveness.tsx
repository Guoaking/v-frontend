import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, StopCircle, RefreshCw, CheckCircle, XCircle, 
  AlertCircle, ChevronLeft, Sun, Smartphone, Palette
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { useTheme } from '../App';
import { ApiClient } from '../lib/api';
import { CONFIG } from '../services/config';
import { useAuth } from '../AuthContext';
import { keyService } from '../services/keys';

interface RGBSession {
  rgb_sequence: string[];
  session_id: string;
  upload_id: string;
  trace_id: string;
  expires_at: string; // ISO timestamp for session expiration
  third_party?: {
    provider: string;
    session_id?: string;
  };
}

interface RGBResult {
  passed: boolean;
  reason_codes?: string[];
  message?: string;
  trace_id?: string;
  third_party?: {
    provider: string;
    request_id?: string;
  };
}

const RGB_COLORS: Record<string, { name: string; hex: string; nameZh: string }> = {
  red: { name: 'Red', hex: '#EF4444', nameZh: '红色' },
  green: { name: 'Green', hex: '#10B981', nameZh: '绿色' },
  blue: { name: 'Blue', hex: '#3B82F6', nameZh: '蓝色' },
  white: { name: 'White', hex: '#FFFFFF', nameZh: '白色' },
  black: { name: 'Black', hex: '#000000', nameZh: '黑色' },
  yellow: { name: 'Yellow', hex: '#F59E0B', nameZh: '黄色' },
  cyan: { name: 'Cyan', hex: '#06B6D4', nameZh: '青色' },
  magenta: { name: 'Magenta', hex: '#EC4899', nameZh: '品红' },
};

const COLOR_DISPLAY_DURATION = 2000; // 2 seconds per color
const PRE_RECORDING_DELAY = 3000; // 3 seconds before colors start

export const RgbLiveness: React.FC = () => {
  const { lang } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const colorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);
  
  // State
  const [sessionState, setSessionState] = useState<'idle' | 'ready' | 'recording' | 'uploading' | 'verifying' | 'completed'>('idle');
  const [session, setSession] = useState<RGBSession | null>(null);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<RGBResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showBrightnessTip, setShowBrightnessTip] = useState(true);
  
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
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
      if (isFullScreen) exitFullScreen();
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
  
  const requestFullScreen = async () => {
    if (fullScreenRef.current) {
      try {
        await fullScreenRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (e) {
        console.error('Fullscreen failed:', e);
      }
    }
  };
  
  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  
  const startSession = async () => {
    setError(null);
    setResult(null);
    setShowBrightnessTip(true);
    
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
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      };

      const stream = await getStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // 2. Get RGB sequence from backend
      const client = new ApiClient({ 
        baseUrl: CONFIG.API_BASE_URL, 
        token: token 
      });
      
      const response = await client.post<RGBSession>('/kyc/liveness/rgb/session', {});
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create session');
      }
      
      setSession(response.data);
      setSessionState('ready');
      
      // 3. Start countdown before recording
      setCountdown(3);
      let count = 3;
      const countInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countInterval);
          setShowBrightnessTip(false);
          requestFullScreen();
          startRecording(response.data);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
      setSessionState('idle');
      stopMedia();
    }
  };
  
  const startRecording = (sessionData: RGBSession) => {
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
      handleUpload(videoBlob, sessionData);
    };
    
    mediaRecorder.start();
    setSessionState('recording');
    setCurrentColorIndex(0);
    
    // Color sequence
    let colorIdx = 0;
    colorIntervalRef.current = setInterval(() => {
      colorIdx++;
      if (colorIdx >= sessionData.rgb_sequence.length) {
        if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
        setTimeout(() => stopRecording(), COLOR_DISPLAY_DURATION);
      } else {
        setCurrentColorIndex(colorIdx);
      }
    }, COLOR_DISPLAY_DURATION);
  };
  
  const stopRecording = () => {
    if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    exitFullScreen();
  };
  
  /**
   * Extract color frames from video for backend analysis
   * TODO: Implement frame extraction at color transition points
   * This is a placeholder for future frame slicing implementation
   */
  const extractColorFrames = async (videoBlob: Blob, rgbSequence: string[]): Promise<Blob[]> => {
    // PLACEHOLDER: Frame extraction at color boundaries
    // For RGB liveness, we need frames at each color transition
    // Option 1: Use canvas to sample frames at specific timestamps
    // Option 2: Use WebCodecs API for frame-accurate extraction
    // Option 3: Backend extracts frames from video
    
    // Currently returning empty array - backend will extract frames from video
    return [];
  };

  const handleUpload = async (videoBlob: Blob, sessionData: RGBSession) => {
    setSessionState('uploading');
    
    try {
      // OPTIONAL: Extract frames at color boundaries (if backend requires pre-sliced frames)
      // const colorFrames = await extractColorFrames(videoBlob, sessionData.rgb_sequence);
      
      const formData = new FormData();
      formData.append('video', videoBlob, 'rgb-liveness.webm');
      formData.append('session_id', sessionData.session_id);
      formData.append('upload_id', sessionData.upload_id);
      formData.append('trace_id', sessionData.trace_id);
      formData.append('rgb_sequence', JSON.stringify(sessionData.rgb_sequence));
      
      // If color frames are extracted, append them
      // colorFrames.forEach((frame, idx) => {
      //   formData.append(`color_frame_${idx}`, frame, `color_frame_${idx}.jpg`);
      // });
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/kyc/liveness/rgb/upload`, {
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
      startVerification(sessionData);
      
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setSessionState('idle');
      stopMedia();
    }
  };
  
  const startVerification = async (sessionData: RGBSession) => {
    setSessionState('verifying');
    
    try {
      const client = new ApiClient({ 
        baseUrl: CONFIG.API_BASE_URL, 
        token: token 
      });
      
      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      
      const poll = async (): Promise<RGBResult> => {
        const response = await client.get<RGBResult>(
          `/kyc/liveness/rgb/result?session_id=${sessionData.session_id}&upload_id=${sessionData.upload_id}`
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
    setSession(null);
    setCurrentColorIndex(0);
    setCountdown(3);
    setResult(null);
    setError(null);
    setShowBrightnessTip(true);
    stopMedia();
  };
  
  const currentColor = session && currentColorIndex < session.rgb_sequence.length 
    ? RGB_COLORS[session.rgb_sequence[currentColorIndex]] 
    : null;
  
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
              RGB Liveness Detection
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Follow the color sequence on screen
            </p>
          </div>
        </div>
        
        {/* Instructions */}
        {sessionState === 'idle' && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="text-primary-500" />
              Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Sun className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Maximize brightness</p>
                  <p className="text-sm text-slate-500">Set your screen brightness to maximum</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <Smartphone className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Face the screen</p>
                  <p className="text-sm text-slate-500">Your face will be illuminated by colors</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Important</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This test requires your face to be illuminated by colored light. The screen will display 
                    a sequence of colors in fullscreen mode. Ensure you are in a dim environment for best results.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Camera Preview */}
        {(sessionState !== 'recording' || !isFullScreen) && (
          <Card className="relative overflow-hidden mb-6">
            <div className="aspect-video bg-slate-900 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {sessionState === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center">
                    <Palette className="mx-auto mb-4 text-slate-400" size={64} />
                    <p className="text-slate-400">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Ready countdown */}
              {sessionState === 'ready' && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center">
                    <p className="text-white mb-2">Starting in</p>
                    <div className="text-6xl font-bold text-white">{countdown}</div>
                    {showBrightnessTip && (
                      <p className="text-yellow-300 mt-4 text-sm animate-pulse">
                        Maximize your screen brightness now!
                      </p>
                    )}
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
        )}
        
        {/* Full Screen Color Display */}
        <div 
          ref={fullScreenRef}
          className={`fixed inset-0 z-50 transition-colors duration-500 ${isFullScreen && isRecording ? 'block' : 'hidden'}`}
          style={{ backgroundColor: currentColor?.hex || '#000' }}
        >
          {/* Color Name */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 
                className="text-6xl md:text-8xl font-bold mb-4"
                style={{ 
                  color: currentColor?.hex === '#FFFFFF' || currentColor?.hex === '#F59E0B' 
                    ? '#000' 
                    : '#fff' 
                }}
              >
                {currentColor ? (lang === 'zh' ? currentColor.nameZh : currentColor.name) : ''}
              </h2>
              
              {/* Progress */}
              {session && (
                <div className="flex gap-2 justify-center mt-8">
                  {session.rgb_sequence.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx <= currentColorIndex ? 'bg-white scale-125' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Timer */}
          <div 
            className="absolute top-8 right-8 text-2xl font-mono"
            style={{ 
              color: currentColor?.hex === '#FFFFFF' || currentColor?.hex === '#F59E0B' 
                ? '#000' 
                : '#fff' 
            }}
          >
            {currentColorIndex + 1} / {session?.rgb_sequence.length || 0}
          </div>
        </div>
        
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
          
          {sessionState === 'ready' && (
            <Button size="lg" variant="outline" disabled className="px-8">
              Starting in {countdown}...
            </Button>
          )}
          
          {isCompleted && (
            <Button size="lg" onClick={reset} className="px-8">
              <RefreshCw size={20} className="mr-2" />
              Try Again
            </Button>
          )}
        </div>
        
        {/* Color Sequence Preview */}
        {session && session.rgb_sequence.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-500 mb-3">Color Sequence Preview</h4>
            <div className="flex flex-wrap gap-2">
              {session.rgb_sequence.map((colorKey, idx) => {
                const color = RGB_COLORS[colorKey];
                if (!color) return null;
                return (
                  <div 
                    key={idx}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs mt-1 text-slate-500">
                      {lang === 'zh' ? color.nameZh : color.name}
                    </span>
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

export default RgbLiveness;
