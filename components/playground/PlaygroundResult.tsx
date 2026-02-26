
import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, User, Search, Fingerprint, Eye, Maximize, ServerCrash, Copy, Check, Info } from 'lucide-react';
import { AnalysisResult, FaceDetectionResult, FaceComparisonResult, LivenessResult, FaceSearchResult } from '../../types';
import { Badge } from '../UI';

interface PlaygroundResultProps {
    result: AnalysisResult;
    mode: string;
    previews: Record<string, string | null>;
}

// Helper: Confidence Color
const getConfidenceColor = (score: number) => {
    if (score >= 90 || score >= 0.9) return 'text-green-600 dark:text-green-400';
    if (score >= 70 || score >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
};

const getConfidenceBg = (score: number) => {
    if (score >= 90 || score >= 0.9) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70 || score >= 0.7) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
};

const getProgressBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-1 text-slate-400 hover:text-white transition-colors" title="Copy Request ID">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
    );
};

// Sub-component: Face Detection Overlay with Scaling
const FaceDetectionView: React.FC<{ data: FaceDetectionResult, imageUrl: string | null }> = ({ data, imageUrl }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [imgLoaded, setImgLoaded] = useState(false);

    const handleImageLoad = () => {
        if (imgRef.current) {
            const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imgRef.current;
            setScale({
                x: clientWidth / naturalWidth,
                y: clientHeight / naturalHeight
            });
            setImgLoaded(true);
        }
    };

    // Recalculate on window resize
    useEffect(() => {
        const handleResize = () => handleImageLoad();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!imageUrl) return <div className="text-red-500">Image source missing</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className={`p-2 rounded-full ${data.is_face_exist ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <User size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm">Face Detection</h4>
                    <p className="text-xs text-slate-500">{data.face_num} face(s) found</p>
                </div>
            </div>

            <div className="relative inline-block overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                <img 
                    ref={imgRef}
                    src={imageUrl} 
                    alt="Analysis Target" 
                    className="max-w-full h-auto block"
                    onLoad={handleImageLoad}
                />
                
                {imgLoaded && data.faces_detected?.map((face, idx) => (
                    <React.Fragment key={idx}>
                        {/* Face Bounding Box */}
                        <div 
                            className="absolute border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-green-500/10 hover:bg-green-500/20 transition-colors group cursor-pointer"
                            style={{
                                left: face.facial_area.x * scale.x,
                                top: face.facial_area.y * scale.y,
                                width: face.facial_area.w * scale.x,
                                height: face.facial_area.h * scale.y
                            }}
                        >
                            <div className="absolute -top-6 left-0 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Face #{idx + 1} ({(face.confidence * 100).toFixed(0)}%)
                            </div>
                        </div>

                        {/* Left Eye Marker */}
                        {face.facial_area.left_eye && (
                            <div 
                                className="absolute w-2 h-2 -ml-1 -mt-1 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)] z-10 pointer-events-none"
                                style={{
                                    left: face.facial_area.left_eye[0] * scale.x,
                                    top: face.facial_area.left_eye[1] * scale.y
                                }}
                                title="Left Eye"
                            />
                        )}

                        {/* Right Eye Marker */}
                        {face.facial_area.right_eye && (
                            <div 
                                className="absolute w-2 h-2 -ml-1 -mt-1 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)] z-10 pointer-events-none"
                                style={{
                                    left: face.facial_area.right_eye[0] * scale.x,
                                    top: face.facial_area.right_eye[1] * scale.y
                                }}
                                title="Right Eye"
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {data.faces_detected?.map((face, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-500">Face #{idx + 1}</span>
                        <Badge color={face.confidence > 0.8 ? 'green' : 'yellow'}>{(face.confidence * 100).toFixed(1)}% Conf.</Badge>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component: Face Comparison Gauge
const FaceCompareView: React.FC<{ data: FaceComparisonResult }> = ({ data }) => {
    const isMatch = data.is_same_face === 1;
    // Normalize score: if value is <= 1 (e.g., 0.96), multiply by 100.
    const score = data.confidence <= 1 ? data.confidence * 100 : data.confidence;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            {/* Gauge */}
            <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                        className="text-slate-100 dark:text-slate-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    {/* Progress Circle - Rotated to start at 12 o'clock */}
                    <path
                        className={`${isMatch ? 'text-green-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform="rotate(0 18 18)" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{score.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Similarity</span>
                </div>
            </div>

            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm ${isMatch ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                {isMatch ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {isMatch ? 'SAME PERSON' : 'DIFFERENT PERSON'}
            </div>
            
            <div className="w-full mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <div className="text-[10px] uppercase text-slate-400">Source Face</div>
                    <div className="font-mono text-sm font-semibold">{data.confidence_exist?.[0] ? 'Detected' : 'Missing'}</div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <div className="text-[10px] uppercase text-slate-400">Target Face</div>
                    <div className="font-mono text-sm font-semibold">{data.confidence_exist?.[1] ? 'Detected' : 'Missing'}</div>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Face Search Gallery
const FaceSearchView: React.FC<{ data: FaceSearchResult }> = ({ data }) => {
    if (!data.has_similar_picture || !data.searched_similar_pictures?.length) {
        return <div className="text-center text-slate-500 p-8">No similar faces found.</div>;
    }

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                <Search size={16} className="text-primary-500" /> Top Matches
            </h4>
            <div className="grid grid-cols-2 gap-4">
                {data.searched_similar_pictures.map((item, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                            {/* item.picture should be a valid URL (Blob URL) at this point */}
                            <img 
                                src={item.picture} 
                                alt={`Match ${idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback for failed loads
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            {/* Fallback placeholder */}
                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <User size={32} className="text-slate-300 mb-2" />
                                <p className="text-[10px] text-slate-400">Image unavailable</p>
                            </div>
                        </div>
                        
                        {/* Progress Bar Footer */}
                        <div className="p-3 bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-medium text-slate-500">Confidence</span>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.confidence.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(item.confidence)}`} 
                                    style={{ width: `${item.confidence}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component: Liveness View
const LivenessView: React.FC<{ data: LivenessResult | any }> = ({ data }) => {
    // Adapter for different response structures
    const isLive = (data.is_live === 1) || (data.is_liveness === 1);
    const score = data.liveness_confidence || data.confidence || data.video_liveness_score || 0;
    
    // Normalize score to percentage (backend might send 0-1 or 0-100)
    const normalizedScore = score <= 1 ? score * 100 : score;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
             <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isLive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                 <Fingerprint size={40} />
                 <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center ${isLive ? 'bg-green-500' : 'bg-red-500'}`}>
                     {isLive ? <CheckCircle size={14} className="text-white"/> : <XCircle size={14} className="text-white"/>}
                 </div>
             </div>
             
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                 {isLive ? 'Live Person' : 'Spoof Detected'}
             </h3>
             
             <div className="w-full max-w-[200px] mt-4">
                 <div className="flex justify-between text-xs text-slate-500 mb-1">
                     <span>Confidence</span>
                     <span className="font-bold">{normalizedScore.toFixed(2)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isLive ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{ width: `${normalizedScore}%` }}
                     />
                 </div>
             </div>
             
             {data.is_face_exist !== undefined && (
                 <div className="mt-4 text-xs text-slate-400">
                     Face Detected: {data.is_face_exist === 1 ? 'Yes' : 'No'}
                 </div>
             )}
        </div>
    );
};

// Existing OCR View (Preserved logic, updated UI)
const OCRView: React.FC<{ parsing_results: any }> = ({ parsing_results }) => {
    const FIELD_ORDER = [
        "document kind", "identification number", "id number", "name", "name_th", "name_en", "last name", "last_name_th", "last_name_en", "sex and name in thai", "date of birth", "birthday in thai", "address", "province", "date of issue", "date of expiry"
    ];
    
    const sortedKeys = Object.keys(parsing_results).sort((a, b) => {
        const idxA = FIELD_ORDER.indexOf(a.toLowerCase());
        const idxB = FIELD_ORDER.indexOf(b.toLowerCase());
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    return (
        <div className="rounded-lg overflow-hidden text-sm">
            {sortedKeys.map((key, index) => {
                const item = parsing_results[key];
                if (!item || (!item.text && item.text !== 0) || (typeof item.text === 'string' && !item.text.trim())) return null;

                return (
                    <div key={key} className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} border-b last:border-0 border-slate-100 dark:border-slate-700`}>
                        <div className="sm:w-1/3 lg:w-1/4 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex-1 flex justify-between items-center gap-2">
                            <span className="text-slate-900 dark:text-slate-100 font-medium break-words leading-tight">{item.text}</span>
                            {item.confidence !== undefined && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${getConfidenceBg(item.confidence)} ${getConfidenceColor(item.confidence)}`}>
                                    {(item.confidence * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const PlaygroundResult: React.FC<PlaygroundResultProps> = ({ result, mode, previews }) => {
    // Handle Error State
    if (result.error || (result.code !== undefined && result.code !== 0 && result.code !== 200)) {
        // Distinguish between System Error (5xx) and Business Error (4xx, 2007, etc)
        const isSystemError = (result.error && (
            result.error.toLowerCase().includes('system busy') || 
            result.error.toLowerCase().includes('system exception') || 
            result.error.toLowerCase().includes('network error')
        )) || (result.code && result.code >= 500);

        // Map Title: Use `msg` (which comes from backend 'message') as the main Title.
        const errorTitle = result.message || 'Operation Failed';
        
        // Map Detail: Use `error` as the description/detail.
        const errorDetail = result.error || (result.code ? `Error Code: ${result.code}` : '');

        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in min-h-[400px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSystemError ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                    {isSystemError ? <ServerCrash size={32} /> : <AlertTriangle size={32} />}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 text-slate-900 dark:text-white`}>
                    {errorTitle}
                </h3>
                
                {/* Error Detail / Description - Clean text, no box */}
                <div className="max-w-md w-full">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                        {errorDetail}
                    </p>
                </div>

                {/* Always show Request ID if available for traceability */}
                {result.meta?.request_id && (
                    <div className="flex items-center gap-2 px-3 py-1.5 mt-2 bg-transparent text-[10px] font-mono text-slate-400">
                        <span>Trace ID: {result.meta.request_id}</span>
                        <CopyButton text={result.meta.request_id} />
                    </div>
                )}
            </div>
        );
    }

    // Adapt for the new liveness response structure (liveness_results vs liveness_result)
    const livenessData = (result as any).liveness_results || result.liveness_result || ((result as any).is_live !== undefined ? result : null);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Visualizer Switching based on Result Data Presence */}
            
            {/* 1. Face Comparison */}
            {result.comparison_results && (
                <FaceCompareView data={result.comparison_results} />
            )}

            {/* 2. Face Detection */}
            {result.detection_results && (
                <FaceDetectionView data={result.detection_results} imageUrl={previews['primary'] || null} />
            )}

            {/* 3. Face Search */}
            {result.searching_results && (
                <FaceSearchView data={result.searching_results} />
            )}

            {/* 4. Liveness (Unified) */}
            {livenessData && (
                <LivenessView data={livenessData} />
            )}

            {/* 5. OCR Results */}
            {result.parsing_results && (
                <OCRView parsing_results={result.parsing_results} />
            )}

            {/* 6. Generic Fallback for unmapped fields */}
            {!result.parsing_results && !result.comparison_results && !result.detection_results && !result.searching_results && !livenessData && (
                <div className="rounded-lg overflow-hidden text-sm">
                    {Object.entries(result).map(([key, value], index) => {
                        if (['filename', 'meta', 'code', 'msg', 'data'].includes(key) || typeof value === 'object') return null;
                        return (
                            <div key={key} className={`flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-700`}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                <span className="text-slate-900 dark:text-slate-100 font-medium font-mono text-right">{String(value)}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Meta Footer */}
            {result.meta && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Req ID: {result.meta.request_id}</span>
                    <span>Lat: {result.meta.latency_ms}ms</span>
                </div>
            )}
        </div>
    );
};
