
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Camera, Link, X, FileVideo, Plus, Copy, AlertTriangle, StopCircle, RefreshCw, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button, Modal } from '../UI';
import { FeatureInputMode } from '../../constants';

interface InputFile {
    file: File | null;
    preview: string | null;
    type: 'image' | 'video';
    id: string; // 'primary', 'secondary' (source/target)
}

interface PlaygroundInputProps {
    mode: FeatureInputMode;
    onInputsChange: (inputs: Record<string, File | null>, previews: Record<string, string | null>) => void;
    onError: (error: string) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

export const PlaygroundInput: React.FC<PlaygroundInputProps> = ({ mode, onInputsChange, onError }) => {
    const [inputs, setInputs] = useState<InputFile[]>([]);
    const [dragActive, setDragActive] = useState<string | null>(null);
    
    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [activeInputId, setActiveInputId] = useState<string | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [flash, setFlash] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Reset inputs when mode changes
    useEffect(() => {
        if (mode === 'single-image') {
            setInputs([{ id: 'primary', file: null, preview: null, type: 'image' }]);
        } else if (mode === 'dual-image') {
            setInputs([
                { id: 'source_image', file: null, preview: null, type: 'image' },
                { id: 'target_image', file: null, preview: null, type: 'image' }
            ]);
        } else if (mode === 'video') {
            setInputs([{ id: 'video', file: null, preview: null, type: 'video' }]);
        }
        // Cleanup previews on unmount/change
        return () => {
            inputs.forEach(i => i.preview && URL.revokeObjectURL(i.preview));
            stopCamera();
        };
    }, [mode]);

    // Propagate changes to parent
    useEffect(() => {
        const files: Record<string, File | null> = {};
        const previews: Record<string, string | null> = {};
        
        inputs.forEach(i => {
            files[i.id] = i.file;
            previews[i.id] = i.preview;
        });
        
        onInputsChange(files, previews);
    }, [inputs]);

    // Handle Global Paste
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const emptySlotIndex = inputs.findIndex(inp => inp.file === null && inp.type === 'image');
                        const targetId = emptySlotIndex !== -1 ? inputs[emptySlotIndex].id : (inputs[0].type === 'image' ? inputs[0].id : null);
                        if (targetId) handleFileSelection(blob, targetId);
                        break;
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [inputs]);

    const validateFile = (file: File, expectedType: 'image' | 'video'): boolean => {
        if (file.size > MAX_SIZE) {
            onError(`File too large. Max size is 10MB.`);
            return false;
        }
        
        if (expectedType === 'image') {
             if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                 onError(`Invalid format. Allowed: JPG, PNG, WEBP, BMP.`);
                 return false;
             }
        }
        
        if (expectedType === 'video' && !file.type.startsWith('video/')) {
            onError("Invalid format. Please upload a video.");
            return false;
        }
        return true;
    };

    const handleFileSelection = (file: File, id: string) => {
        const inputConfig = inputs.find(i => i.id === id);
        if (!inputConfig) return;

        if (!validateFile(file, inputConfig.type)) return;

        const previewUrl = URL.createObjectURL(file);
        setInputs(prev => prev.map(item => 
            item.id === id ? { ...item, file, preview: previewUrl } : item
        ));
        onError(''); 
    };

    const handleDrop = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragActive(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0], id);
        }
    };

    const clearInput = (id: string) => {
        setInputs(prev => prev.map(item => 
            item.id === id ? { ...item, file: null, preview: null } : item
        ));
    };

    // --- Camera Logic ---

    const startCamera = async (id: string) => {
        const input = inputs.find(i => i.id === id);
        if (!input) return;
        
        setActiveInputId(id);
        setShowCamera(true);
        setRecordedChunks([]);
        
        try {
            // Relax constraints to avoid OverconstrainedError and ensure simple camera access first
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: input.type === 'video' 
            });
            
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err: any) {
            console.error("Camera/Mic access denied or failed:", err);
            
            // Retry logic: If audio was requested and failed, try video only
            if (input.type === 'video') {
                try {
                    console.log("Retrying without audio...");
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: true,
                        audio: false 
                    });
                    setCameraStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                    onError("Audio access denied. Recording video without sound.");
                    return; 
                } catch (retryErr) {
                    console.error("Retry failed:", retryErr);
                }
            }

            const errorMsg = err.name === 'NotAllowedError' 
                ? 'Camera access permission denied. Please allow access in your browser settings.'
                : `Camera error: ${err.message || err.name}`;
                
            onError(errorMsg);
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
        setIsRecording(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !activeInputId) return;
        
        // Trigger Flash
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    handleFileSelection(file, activeInputId);
                    stopCamera();
                }
            }, 'image/jpeg', 0.95);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            if (!cameraStream) return;
            setRecordedChunks([]);
            
            // Prefer mp4/webm types
            let options = { mimeType: 'video/webm' };
            if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
                options = { mimeType: 'video/webm; codecs=vp9' };
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                options = { mimeType: 'video/mp4' };
            }

            try {
                const mediaRecorder = new MediaRecorder(cameraStream, options);
                
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setRecordedChunks((prev) => [...prev, event.data]);
                    }
                };
                
                mediaRecorder.start();
                setIsRecording(true);
                mediaRecorderRef.current = mediaRecorder;
            } catch (e) {
                console.error("MediaRecorder error", e);
                onError("Failed to start recording. MediaRecorder not supported.");
            }
        }
    };

    // Save recording when chunks are available and recording stopped
    useEffect(() => {
        if (!isRecording && recordedChunks.length > 0 && activeInputId) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const file = new File([blob], "camera_record.webm", { type: "video/webm" });
            handleFileSelection(file, activeInputId);
            stopCamera();
        }
    }, [isRecording, recordedChunks]);

    const activeInputType = inputs.find(i => i.id === activeInputId)?.type || 'image';

    return (
        <div className={`grid gap-4 h-full ${mode === 'dual-image' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Camera Modal */}
            <Modal
                isOpen={showCamera}
                onClose={stopCamera}
                title={activeInputType === 'video' ? "Record Video" : "Take Photo"}
                maxWidth="max-w-3xl"
                zIndex="z-[60]"
            >
                <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
                    {/* Explicit sizing and display for video to prevent 'black screen' layout issues */}
                    <video 
                        ref={videoRef} 
                        className="w-full h-full object-contain" 
                        muted 
                        autoPlay 
                        playsInline 
                        style={{ display: 'block' }}
                    />
                    
                    {/* Flash Overlay */}
                    {flash && <div className="absolute inset-0 bg-white z-10 animate-fade-in"></div>}

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-20">
                        {activeInputType === 'image' ? (
                            <button 
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center hover:scale-105 transition-transform shadow-lg active:scale-95"
                            >
                                <Camera className="text-slate-800" size={32} />
                            </button>
                        ) : (
                            <button 
                                onClick={toggleRecording}
                                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center hover:scale-105 transition-transform ${isRecording ? 'bg-red-600 border-red-200' : 'bg-red-500 border-white'}`}
                            >
                                {isRecording ? <StopCircle className="text-white" size={32} /> : <div className="w-6 h-6 bg-white rounded-full"></div>}
                            </button>
                        )}
                    </div>
                    {isRecording && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white text-xs font-bold animate-pulse z-20">
                            <div className="w-2 h-2 bg-white rounded-full"></div> REC
                        </div>
                    )}
                </div>
            </Modal>

            {inputs.map((input, index) => (
                <div key={input.id} className="relative h-full min-h-[350px] flex flex-col">
                    {mode === 'dual-image' && (
                        <div className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            {input.id === 'source_image' ? 'Reference Image' : 'Comparison Image'}
                        </div>
                    )}

                    <div 
                        className={`flex-grow rounded-xl relative transition-all overflow-hidden group flex flex-col
                            ${dragActive === input.id ? 'border-2 border-primary-500 bg-primary-50/50' : 'border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(input.id); }}
                        onDragLeave={() => setDragActive(null)}
                        onDrop={(e) => handleDrop(e, input.id)}
                    >
                        {input.preview ? (
                            // PREVIEW STATE
                            <div className="absolute inset-0 flex flex-col bg-slate-100 dark:bg-slate-950">
                                {/* Media Display - Fixed to contain properly */}
                                <div className="flex-grow relative w-full h-full flex items-center justify-center p-2 overflow-hidden">
                                    {input.type === 'video' ? (
                                        <video 
                                            src={input.preview} 
                                            controls 
                                            className="w-full h-full object-contain" 
                                        />
                                    ) : (
                                        <img 
                                            src={input.preview} 
                                            alt="Preview" 
                                            className="w-full h-full object-contain" 
                                        />
                                    )}
                                    
                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                                        <button 
                                            onClick={() => clearInput(input.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors"
                                            title="Remove File"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Info Bar */}
                                <div className="h-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 text-xs flex-shrink-0">
                                    <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                                        {input.file?.name}
                                    </span>
                                    <span className="text-slate-500">
                                        {(input.file?.size ? (input.file.size / 1024 / 1024).toFixed(2) : 0)} MB
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // EMPTY STATE
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {input.type === 'video' ? <FileVideo size={32} className="text-slate-400" /> : <ImageIcon size={32} className="text-slate-400" />}
                                </div>
                                
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                                    {input.type === 'video' ? 'Upload Video' : 'Upload Image'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                                    Drag & drop, paste from clipboard, or choose an option below. <br/>
                                    <span className="text-xs opacity-70">Max 10MB. JPG, PNG, WEBP, BMP.</span>
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                    <label className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-primary-400 transition-all shadow-sm group/btn">
                                        <Upload size={20} className="text-slate-500 group-hover/btn:text-primary-500 mb-1" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Browse</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept={input.type === 'video' ? "video/*" : ALLOWED_IMAGE_TYPES.join(',')}
                                            onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0], input.id)}
                                        />
                                    </label>
                                    
                                    <button 
                                        className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-primary-400 transition-all shadow-sm group/btn"
                                        onClick={() => startCamera(input.id)}
                                    >
                                        <Camera size={20} className="text-slate-500 group-hover/btn:text-primary-500 mb-1" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Camera</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {mode === 'dual-image' && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center z-10 font-bold text-xs text-slate-400">
                    VS
                </div>
            )}
        </div>
    );
};
