
import React from 'react';
import { ScanLine, Fingerprint, UserSquare2, Globe, ListFilter, Zap } from 'lucide-react';
import { CustomSelect } from '../UI';
import { COUNTRY_CAPABILITIES, EnhancedCountryConfig, FEATURE_CONFIG } from '../../constants';

interface PlaygroundSidebarProps {
    selectedCountryCode: string;
    selectedFeature: string;
    onCountryChange: (code: string) => void;
    onFeatureSelect: (feature: string) => void;
    currentCapabilities: {
        country: EnhancedCountryConfig;
        features: string[];
    } | null;
    t: any; // Translation object
}

export const PlaygroundSidebar: React.FC<PlaygroundSidebarProps> = ({
    selectedCountryCode,
    selectedFeature,
    onCountryChange,
    onFeatureSelect,
    currentCapabilities,
    t
}) => {
    
    // Helper to render groups
    const renderGroup = (title: string, items: string[], icon: React.ReactNode, themeColor: string) => {
        if (items.length === 0) return null;
        
        return (
            <div className="mb-6">
                <div className="flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-500 mb-1">
                    {icon}
                    <span className="ml-2">{title}</span>
                </div>
                <div className={`space-y-1 ml-2 border-l-2 border-slate-100 dark:border-slate-700 pl-1`}>
                    {items.map((item) => {
                        const isActive = selectedFeature === item;
                        return (
                            <button
                                key={item}
                                data-testid={`feature-item-${item}`}
                                onClick={() => onFeatureSelect(item)}
                                className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex items-center justify-between group relative overflow-hidden ${
                                    isActive 
                                    ? `bg-${themeColor}-50 dark:bg-${themeColor}-900/20 text-${themeColor}-700 dark:text-${themeColor}-300 font-medium` 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="truncate relative z-10">{t.products.items[item] || item}</span>
                                {isActive && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-${themeColor}-500`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Calculate groups if capabilities exist
    const groupedFeatures = currentCapabilities ? {
        ocr: currentCapabilities.features.filter(f => FEATURE_CONFIG[f]?.category === 'ocr'),
        face: currentCapabilities.features.filter(f => FEATURE_CONFIG[f]?.category === 'face'),
        liveness: currentCapabilities.features.filter(f => FEATURE_CONFIG[f]?.category === 'liveness'),
    } : null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-y-auto custom-scrollbar h-fit lg:max-h-[800px] flex flex-col">
             {/* Region Context Selector */}
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Target Region</label>
                <div className="relative">
                    <CustomSelect 
                        options={COUNTRY_CAPABILITIES.map(c => ({
                            value: c.code,
                            label: c.name,
                            icon: c.flag
                        }))}
                        value={selectedCountryCode}
                        onChange={onCountryChange}
                        placeholder="Select Region..."
                    />
                </div>
                {currentCapabilities && (
                    <div className="mt-2 flex items-center gap-1.5 justify-center opacity-75">
                        <span className="text-[10px] text-slate-400">Viewing Solutions for</span>
                        <span className={`text-[10px] font-bold text-${currentCapabilities.country.themeColor}-600 dark:text-${currentCapabilities.country.themeColor}-400 uppercase tracking-wide`}>
                            {currentCapabilities.country.name}
                        </span>
                    </div>
                )}
             </div>

             <div className="p-2 flex-1">
                {currentCapabilities && groupedFeatures ? (
                    <>
                        {renderGroup(t.products.categories.ocr || 'Identity Documents', groupedFeatures.ocr, <ScanLine size={14} />, currentCapabilities.country.themeColor)}
                        {renderGroup(t.products.categories.face || 'Biometrics', groupedFeatures.face, <UserSquare2 size={14} />, currentCapabilities.country.themeColor)}
                        {renderGroup(t.products.categories.liveness || 'Anti-Spoofing', groupedFeatures.liveness, <Fingerprint size={14} />, currentCapabilities.country.themeColor)}
                        
                        {/* Fallback for uncategorized or if translation missing */}
                        {Object.values(groupedFeatures).every(g => g.length === 0) && (
                            <div className="text-center p-4 text-slate-400 text-xs">
                                No features available for this region.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 h-full">
                        <Globe size={32} className="mb-3 opacity-20" />
                        <p className="text-xs text-center font-medium opacity-70">
                            Please select a region above to explore available capabilities.
                        </p>
                    </div>
                )}
             </div>
        </div>
    );
};
