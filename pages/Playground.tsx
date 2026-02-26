
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Key, ExternalLink, Unlock, Loader2, Zap, Lock, ListFilter, Code, Check, Copy, Eye, AlertCircle, Globe, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button, Card, Badge, ConfirmDialog, Modal, CustomSelect } from '../components/UI';
import { useTheme } from '../App';
import { TRANSLATIONS, OCR_TYPE_MAPPING, MOCK_OCR_RESULT, FEATURE_CONFIG, FeatureConfig, COUNTRY_CAPABILITIES, EnhancedCountryConfig } from '../constants';
import { ApiClient, APIResponse } from '../lib/api';
import { useAuth } from '../AuthContext';
import { keyService } from '../services/keys';
import { orgService } from '../services/org';
import { mockDb } from '../services/mockDb';
import { CONFIG } from '../services/config';
import { OrgQuota, ApiKey, AnalysisResult } from '../types';

// New Sub-components
import { PlaygroundInput } from '../components/playground/PlaygroundInput';
import { PlaygroundResult } from '../components/playground/PlaygroundResult';
import { PlaygroundSidebar } from '../components/playground/PlaygroundSidebar';

export const Playground: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang];
  const location = useLocation();
  const navigate = useNavigate();
  const { featureId } = useParams();
  const { user, createApiKey } = useAuth();
  
  // -- Navigation State --
  const [selectedCountryCode, setSelectedCountryCode] = useState(''); 
  const [selectedFeature, setSelectedFeature] = useState('id_card_ocr');
  
  // -- Data State --
  const [inputFiles, setInputFiles] = useState<Record<string, File | null>>({});
  const [inputPreviews, setInputPreviews] = useState<Record<string, string | null>>({});
  const [ocrLang, setOcrLang] = useState('en');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<'smart' | 'json'>('smart');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // UX States
  const [isSwitching, setIsSwitching] = useState(false); 

  // Quota & Key State
  const [quota, setQuota] = useState<OrgQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  
  const [activeKeys, setActiveKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [customToken, setCustomToken] = useState('');
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false); 

  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const [apiConfig, setApiConfig] = useState({
    baseUrl: CONFIG.API_BASE_URL,
    token: '',
    organizationId: ''
  });

  const [client] = useState(() => new ApiClient({ baseUrl: CONFIG.API_BASE_URL }));

  // --- DERIVED CAPABILITIES ---
  const currentCountryCapabilities = useMemo(() => {
      if (!selectedCountryCode) return null;

      const country = COUNTRY_CAPABILITIES.find(c => c.code === selectedCountryCode) as EnhancedCountryConfig;
      if (!country) return null;
      
      const allowedFeatures = country.features.filter(f => {
          const config = FEATURE_CONFIG[f];
          if (!config) return false;
          if (config.category === 'liveness' && !user?.isPlatformAdmin && !CONFIG.USE_MOCK) {
               return true; 
          }
          return true;
      });

      return { country, features: allowedFeatures };
  }, [selectedCountryCode, user]);

  // Sync OCR Lang
  useEffect(() => {
      if (!selectedCountryCode) {
          setOcrLang('en');
          return;
      }
      const map: Record<string, string> = {
          'th': 'th',
          'vi': 'vi',
          'id': 'id',
          'my': 'ms',
          'ph': 'tl',
          'global': 'en'
      };
      setOcrLang(map[selectedCountryCode] || 'en');
  }, [selectedCountryCode]);

  const activeConfig: FeatureConfig = FEATURE_CONFIG[selectedFeature] || FEATURE_CONFIG['id_card_ocr'];

  // URL Sync
  useEffect(() => {
    if (featureId) {
        if (featureId !== selectedFeature) {
            setSelectedFeature(featureId);
            setInputFiles({});
            setInputPreviews({});
            setResult(null);
            setAuthError(null);
            setIsAuthError(false);
        }
    }
    
    if (currentCountryCapabilities && !featureId) {
         navigate(`/playground/id_card_ocr`, { replace: true });
    }

    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && currentCountryCapabilities) {
        const targetFeature = currentCountryCapabilities.features.find(f => FEATURE_CONFIG[f].category === cat);
        if (targetFeature && targetFeature !== selectedFeature) {
             navigate(`/playground/${targetFeature}`, { replace: true });
        }
    }
  }, [featureId, location.search, currentCountryCapabilities]);

  const handleFeatureSelect = (feature: string) => {
      if (feature === selectedFeature) return;
      setIsSwitching(true);
      navigate(`/playground/${feature}`);
      setTimeout(() => { setIsSwitching(false); }, 300);
  };

  const handleCountryChange = (code: string) => {
      setSelectedCountryCode(code);
      setIsSwitching(true);
      
      const nextCountry = COUNTRY_CAPABILITIES.find(c => c.code === code);
      if (nextCountry) {
          if (!nextCountry.features.includes(selectedFeature)) {
              const firstFeature = nextCountry.features[0];
              navigate(`/playground/${firstFeature}`);
          }
      }
      
      setTimeout(() => { setIsSwitching(false); }, 300);
  };

  // --- Fetch Keys on mount ---
  useEffect(() => {
      const loadKeys = async () => {
          if (!user) return;
          setKeysLoading(true);
          try {
              const res = await keyService.getKeys();
              if (res.success && res.data) {
                  const active = res.data.filter(k => k.status === 'active');
                  setActiveKeys(active);
                  if (active.length > 0 && !selectedKeyId) {
                      setSelectedKeyId(active[0].id);
                  }
                  
                  console.log('Active keys:', active);
                  if (active.length === 0 && !isCreatingKey) {
                      console.log('No active keys, creating default key');
                      setIsCreatingKey(true);
                      try {
                          await createApiKey('Default Key', ['ocr:read', 'face:read', 'liveness:read']);
                          const freshRes = await keyService.getKeys();
                          if(freshRes.success && freshRes.data) {
                              const newActive = freshRes.data.filter(k => k.status === 'active');
                              setActiveKeys(newActive);
                              if (newActive.length > 0) setSelectedKeyId(newActive[0].id);
                          }
                      } catch(e) {
                          console.error("Failed to auto-create key", e);
                      } finally {
                          setIsCreatingKey(false);
                      }
                  }
              }
          } catch(e) {
              console.error("Failed to load keys", e);
          } finally {
              setKeysLoading(false);
          }
      };
      loadKeys();
  }, [user]);

  const fetchQuota = async () => {
      if (!user) return;
      setQuotaLoading(true);
      try {
          const res = await orgService.getQuotaStatus();
          if (res.success && res.data) {
              setQuota(res.data);
          }
      } catch (e) {
          console.error("Failed to fetch quota", e);
      } finally {
          setQuotaLoading(false);
      }
  };

  useEffect(() => {
      fetchQuota();
  }, [user, selectedFeature]); 

  // Auto-reveal key
  useEffect(() => {
      const autoReveal = async () => {
          if (!user || !selectedKeyId) return;
          if (customToken) return;

          try {
              setIsRevealing(true);
              const res = await keyService.revealSecret(user.id, selectedKeyId);
              if (res.success && res.data) {
                  setCustomToken(res.data.secret);
              }
          } catch (e) {
              console.warn("Auto-reveal failed, falling back to manual trigger", e);
          } finally {
              setIsRevealing(false);
          }
      };
      
      if (selectedKeyId) {
          autoReveal(); 
      }
  }, [selectedKeyId]);

  useEffect(() => {
      setApiConfig(prev => ({ 
          ...prev, 
          token: customToken,
          organizationId: user?.currentOrgId || user?.organization?.id || '' 
      }));
  }, [customToken, user?.currentOrgId, user?.organization?.id]);

  useEffect(() => {
    client.updateConfig(apiConfig);
  }, [apiConfig, client]);

  const handleRevealClick = () => {
      if (!user || !selectedKeyId) return;
      performReveal();
  };

  const performReveal = async () => {
      if (!user || !selectedKeyId) return;
      setIsRevealing(true);
      try {
          const res = await keyService.revealSecret(user.id, selectedKeyId);
          if (res.success && res.data) {
              setCustomToken(res.data.secret);
          } else {
              setAuthError("Failed to fetch secret key: " + res.error);
              setIsAuthError(true);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsRevealing(false);
          setShowRevealConfirm(false);
      }
  };

  // Quota Logic
  const currentQuota = useMemo(() => {
      if (!quota) return null;
      if (quota[selectedFeature]) return quota[selectedFeature];
      const cat = activeConfig.category;
      if (cat && quota[cat]) return quota[cat];
      return null;
  }, [quota, selectedFeature, activeConfig]);

  const isQuotaExhausted = currentQuota ? currentQuota.remaining <= 0 : false;

  const handleAnalyze = async () => {
    setAuthError(null);
    setIsAuthError(false);

    if (!user) {
        setAuthError("You must be logged in to use the playground.");
        setIsAuthError(true);
        return;
    }

    if (!customToken && !CONFIG.USE_MOCK) {
        setAuthError("Please reveal or enter a valid API Key.");
        setIsAuthError(true);
        return;
    }
    
    const hasFiles = Object.values(inputFiles).some(f => f !== null);
    if (!hasFiles) {
        setAuthError("Please upload the required file(s) first.");
        return;
    }

    if (isQuotaExhausted) {
        setShowQuotaModal(true);
        return;
    }

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    
    if (activeConfig.mode === 'single-image') {
        const file = inputFiles['primary'];
        if (file) formData.append('picture', file);
    } else if (activeConfig.mode === 'dual-image') {
        const source = inputFiles['source_image'];
        const target = inputFiles['target_image'];
        if (source) formData.append('source_image', source);
        if (target) formData.append('target_image', target);
    } else if (activeConfig.mode === 'video') {
        const file = inputFiles['video'];
        if (file) formData.append('video', file);
    }
    
    if (activeConfig.category === 'ocr') {
        const typeValue = OCR_TYPE_MAPPING[selectedFeature] || 'id_card';
        formData.append('type', typeValue);
        formData.append('country', selectedCountryCode);
        formData.append('language', ocrLang); 
    }

    const endpoint = activeConfig.endpoint;

    try {
      let response: APIResponse<AnalysisResult>;
      response = await client.postFormData(endpoint, formData);

      if (!response.success) {
          let errorMsg = response.message || "Unknown Error";
          let detailedError = "";
          let code = response.status || response.meta?.code || 0;

          if (response.data && typeof response.data === 'object') {
              const errData = response.data as any;
              if (errData.message) errorMsg = errData.message;
              if (errData.error) detailedError = errData.error;
              if (errData.code) code = errData.code;
          } else {
              if (response.status === 401) {
                  errorMsg = "Unauthorized";
                  detailedError = "Invalid API Key or Token.";
              } else if (response.status === 429) {
                  errorMsg = "Rate Limit Exceeded";
                  detailedError = "Please upgrade your plan or try again later.";
                  setShowQuotaModal(true);
                  fetchQuota();
              } else if (response.status && response.status >= 500) {
                   errorMsg = "System Busy";
                   detailedError = "Service is temporarily unavailable.";
              }
          }
          
          setResult({
              code: code,
              message: errorMsg,
              error: detailedError || response.error,
              meta: response.meta ? {
                  request_id: response.meta.requestId,
                  latency_ms: 0
              } : undefined
          });

          if (response.status === 0 && apiConfig.baseUrl.includes('localhost') && CONFIG.USE_MOCK) {
             // Mock Fallback
             console.warn("Network error, falling back to mock data.");
             await new Promise(r => setTimeout(r, 1000));
             
             const chargeResult = mockDb.consumeQuota(user.id, activeConfig.category === 'ocr' ? selectedFeature : 'face');
             
             if (!chargeResult.success) {
                 setResult({ error: chargeResult.error });
                 setShowQuotaModal(true);
             } else {
                 if(selectedFeature === 'face_detection') {
                     setResult({ 
                         detection_results: { is_face_exist: 1, face_num: 1, faces_detected: [{ facial_area: { x: 100, y: 100, w: 200, h: 200 }, confidence: 0.99 }] },
                         meta: { latency_ms: 120, request_id: "mock_det" }
                     });
                 } else if (selectedFeature === 'face_compare') {
                     setResult({
                         comparison_results: { is_face_exist: 1, confidence_exist: [0.99, 0.98], is_same_face: 1, confidence: 97.5, detection_result: "success" },
                         meta: { latency_ms: 200, request_id: "mock_cmp" }
                     });
                 } else {
                     setResult(MOCK_OCR_RESULT);
                 }
                 await fetchQuota();
             }
          }
      } else {
        const resultData = response.data!;

        // SPECIAL HANDLING FOR FACE SEARCH
        // We need to fetch images for the IDs returned by the search
        if (selectedFeature === 'face_search' && resultData.searching_results?.searched_similar_pictures) {
            const candidates = resultData.searching_results.searched_similar_pictures;
            const updatedCandidates = await Promise.all(candidates.map(async (item: any) => {
                // Determine ID (Handle cases where item is just ID string or object)
                const id = item.id || item; 
                if (id && typeof id === 'string') {
                    try {
                        // Fetch blob for this face ID
                        const imgRes = await client.getBlob(`/faces/${id}/image`);
                        if (imgRes.success && imgRes.data) {
                            return {
                                ...item,
                                picture: URL.createObjectURL(imgRes.data), // Create browser URL
                                confidence: item.confidence || 0
                            };
                        }
                    } catch (e) {
                        console.error("Failed to load face image", id, e);
                    }
                }
                // Fallback if fetch fails
                return item;
            }));
            
            resultData.searching_results.searched_similar_pictures = updatedCandidates;
        }

        setResult(resultData);
        fetchQuota();
        setViewMode('smart');
      }
      
    } catch (e: any) {
       setResult({ error: "System Exception: " + (e.message || "Unknown"), msg: "System Error", code: 500 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const goToLogin = () => navigate('/login', { state: { from: location } });
  const goToCreds = () => navigate('/console/credentials');

  const themeColor = currentCountryCapabilities?.country.themeColor || 'slate';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modals and Dialogs */}
        <ConfirmDialog 
            isOpen={showRevealConfirm}
            onClose={() => setShowRevealConfirm(false)}
            onConfirm={performReveal}
            title="Fetch Secret Key"
            message="This action will retrieve the secret key from the secure vault to run this demo. An audit log will be created."
            confirmText="Fetch & Use"
            isLoading={isRevealing}
        />

        <Modal 
            isOpen={showQuotaModal}
            onClose={() => setShowQuotaModal(false)}
            title="Quota Limit Reached"
            footer={<Button onClick={() => setShowQuotaModal(false)}>Close</Button>}
        >
            <div className="text-center p-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upgrade Required</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    You have exhausted your available quota for <span className="font-bold text-primary-500">{t.products.items[selectedFeature]}</span>. Please upgrade your plan to continue.
                </p>
                <a href="https://www.verilocale.com/contact-us" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Contact Sales <ExternalLink size={16} className="ml-2" />
                </a>
            </div>
        </Modal>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    {t.playground.title} 
                    {isSwitching && <Loader2 className="animate-spin text-primary-500" size={20} />}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">{t.playground.subtitle}</p>
            </div>
            <div className="flex gap-2 sm:gap-3 items-center">
                 {/* Key Selector - Height Fixed to h-10, White BG */}
                 {user && (
                     <div className="h-10 flex items-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 shadow-sm max-w-full overflow-hidden">
                         <div className="flex flex-col">
                             {activeKeys.length > 0 ? (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Key size={16} className="text-slate-400 shrink-0" />
                                    <select 
                                        value={selectedKeyId}
                                        onChange={(e) => setSelectedKeyId(e.target.value)}
                                        className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer w-20 sm:w-32"
                                    >
                                        {activeKeys.map(k => (
                                            <option key={k.id} value={k.id}>{k.name}</option>
                                        ))}
                                    </select>
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                                    <div className="flex items-center relative">
                                        <input 
                                            type="password"
                                            placeholder="Key..."
                                            value={customToken}
                                            onChange={(e) => setCustomToken(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] h-7 w-20 sm:w-28 rounded-l px-2 focus:ring-1 focus:ring-primary-500 outline-none"
                                        />
                                        {!customToken ? (
                                            <button 
                                                onClick={handleRevealClick}
                                                disabled={!selectedKeyId || isRevealing}
                                                className="h-7 px-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 border-y border-r border-slate-200 dark:border-slate-700 rounded-r text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                {isRevealing ? <Loader2 size={10} className="animate-spin"/> : <Eye size={10} />} <span className="hidden sm:inline">Get</span>
                                            </button>
                                        ) : (
                                            <div className="h-7 px-2 bg-green-50 dark:bg-green-900/20 text-green-600 border-y border-r border-slate-200 dark:border-slate-700 rounded-r flex items-center justify-center">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 px-2 h-7">
                                    {isCreatingKey ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Loader2 size={12} className="animate-spin" /> Creating Key...
                                        </div>
                                    ) : (
                                        <Link to="/console/credentials" className="text-sm text-red-500 hover:underline">
                                            {t.playground.create_key_prompt}
                                        </Link>
                                    )}
                                </div>
                             )}
                         </div>
                     </div>
                 )}

                <Link to="/developers">
                    {/* UPDATED: Height Fixed to h-10, White BG, matching border */}
                    <Button variant="outline" size="sm" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-2 sm:px-3 shrink-0 shadow-sm">
                        <BookOpen size={16} className="mr-0 sm:mr-2"/> 
                        <span className="hidden sm:inline">API Reference</span>
                    </Button>
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:min-h-[800px]">
          
          {/* SIDEBAR Component (Always visible) */}
          <div className="lg:col-span-2">
              <PlaygroundSidebar 
                  selectedCountryCode={selectedCountryCode}
                  selectedFeature={selectedFeature}
                  onCountryChange={handleCountryChange}
                  onFeatureSelect={handleFeatureSelect}
                  currentCapabilities={currentCountryCapabilities}
                  t={t}
              />
          </div>

          {/* MAIN CONTENT AREA */}
          {currentCountryCapabilities ? (
              // -- STATE B: Country Selected (Split View) --
              <>
                <div className="lg:col-span-5 flex flex-col gap-6 min-h-[500px] lg:h-full lg:min-h-0 transition-opacity duration-200 animate-fade-in" style={{ opacity: isSwitching ? 0.6 : 1 }}>
                    <Card className="flex-grow overflow-hidden relative flex flex-col shadow-md">
                        {/* Visual Header Strip based on Theme */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-${themeColor}-500`}></div>

                        {/* UPDATED: Responsive Input Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 flex-shrink-0 pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-${themeColor}-100 text-${themeColor}-800 dark:bg-${themeColor}-900 dark:text-${themeColor}-200`}>
                                    {activeConfig.label}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 bg-slate-50 dark:bg-slate-800">
                                    <span>{currentCountryCapabilities.country.flag}</span>
                                    <span>{currentCountryCapabilities.country.name}</span>
                                </div>
                            </div>
                            {user && currentQuota && (
                                <div 
                                    key={selectedFeature}
                                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border animate-fade-in w-fit ${isQuotaExhausted ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}
                                >
                                    {isQuotaExhausted ? <Lock size={12} /> : <Unlock size={12} />}
                                    <span className="font-mono">
                                        Limit: {currentQuota.remaining.toLocaleString()} / {currentQuota.limit.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow relative flex flex-col">
                            <PlaygroundInput 
                                mode={activeConfig.mode} 
                                key={selectedFeature}
                                onInputsChange={(files, previews) => {
                                    setInputFiles(files);
                                    setInputPreviews(previews);
                                    setResult(null); 
                                    setAuthError(null);
                                }}
                                onError={setAuthError}
                            />
                            {isSwitching && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-20 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                                    <div className="flex flex-col items-center text-primary-600">
                                        <Zap className="animate-pulse mb-2" size={32} />
                                        <span className="text-sm font-semibold">Configuring for {currentCountryCapabilities.country.name}...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 flex-shrink-0">
                            <Button 
                                className={`w-full h-12 text-base ${isQuotaExhausted ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                                onClick={handleAnalyze} 
                                disabled={isLoading || isSwitching}
                                isLoading={isLoading}
                            >
                                {isLoading ? t.playground.analyzing : isQuotaExhausted ? 'Quota Exceeded' : t.playground.run_analysis}
                            </Button>
                            
                            {authError && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center justify-between text-sm text-red-600 dark:text-red-300 animate-fade-in">
                                    <span className="flex items-center gap-2"><AlertCircle size={16}/> {authError}</span>
                                    {(!user && isAuthError) && (
                                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-100" onClick={goToLogin}>Login</Button>
                                    )}
                                    {(user && isAuthError) && (
                                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-100" onClick={goToCreds}>Manage Keys</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-5 min-h-[500px] lg:h-full lg:min-h-0 transition-opacity duration-200 animate-fade-in" style={{ opacity: isSwitching ? 0.5 : 1 }}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col min-h-0 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-${themeColor}-500 opacity-50`}></div>

                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center pt-5">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{t.playground.results}</h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleCopyResult}
                                    className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
                                    title={t.common.copy}
                                >
                                    {copyFeedback ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                                </button>
                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                    <button 
                                        onClick={() => setViewMode('smart')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'smart' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        <ListFilter size={14} className="inline mr-1" />
                                        Smart
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('json')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'json' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        <Code size={14} className="inline mr-1" />
                                        JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-grow p-4 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-y-auto custom-scrollbar min-h-0">
                            {!result && !isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                    {isSwitching ? (
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
                                            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                <Code size={32} className="opacity-40" />
                                            </div>
                                            <p className="text-sm font-medium">Ready to process</p>
                                            <p className="text-xs opacity-60 mt-1 max-w-[200px]">
                                                Upload {activeConfig.mode === 'video' ? 'a video' : 'image(s)'} to see {t.products.items[selectedFeature]} results here.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {isLoading && (
                                <div className="space-y-4 animate-pulse p-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {result && !isSwitching && (
                                <div className="animate-fade-in pb-10 h-full"> 
                                    {viewMode === 'smart' ? (
                                        <PlaygroundResult result={result} mode={activeConfig.mode} previews={inputPreviews} />
                                    ) : (
                                        <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap p-2 bg-slate-100 dark:bg-slate-900 rounded">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </>
          ) : (
              // -- STATE A: No Country Selected (Welcome/Prompt) --
              <div className="lg:col-span-10 flex flex-col h-full animate-fade-in">
                  <Card className="flex-grow flex flex-col justify-center items-center shadow-lg min-h-[500px] border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex flex-col items-center text-center p-12 max-w-lg">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-primary-100 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                                    <Globe size={48} className="text-primary-500 opacity-80" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md">
                                    <ArrowLeft size={20} className="text-slate-400 animate-bounce-horizontal" />
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                                Select a Region to Start
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                                Verilocale optimizes AI models based on specific regional compliance and document types. 
                                <br/><br/>
                                Please select your target country from the sidebar to initialize the customized testing environment.
                            </p>
                            
                            <div className="flex gap-3 text-sm text-slate-400">
                                <div className="flex items-center gap-1"><Check size={14}/> Localized OCR</div>
                                <div className="flex items-center gap-1"><Check size={14}/> Compliance Rules</div>
                                <div className="flex items-center gap-1"><Check size={14}/> Facial Models</div>
                            </div>
                        </div>
                  </Card>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
