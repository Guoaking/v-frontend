import { Translation, Language, Plan, ApiScope, OCRLanguageCode, CountryConfig } from './types';
import { ScanLine, Fingerprint, UserSquare2 } from 'lucide-react';
import { en } from './locales/en';
import { th } from './locales/th';
import { zh } from './locales/zh';
import { vi } from './locales/vi';
import { id } from './locales/id';
import { ms } from './locales/ms';
import { tl } from './locales/tl';
import { my } from './locales/my';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'th', 'vi', 'id', 'ms', 'tl', 'my'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  tl: 'Tagalog',
  my: 'မြန်မာ'
};

export interface OCRLanguageOption {
    code: OCRLanguageCode;
    label: string;
    flag: string; 
}

export const OCR_LANGUAGES: OCRLanguageOption[] = [
    { code: 'th', label: 'Thai', flag: '🇹🇭' },
    { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
    { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', label: 'Malay', flag: '🇲🇾' },
    { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
];

export const API_SCOPES: { id: ApiScope; label: string; desc: string }[] = [
  { id: 'ocr:read', label: 'OCR Read', desc: 'Allow reading document data' },
  { id: 'liveness:read', label: 'Liveness Check', desc: 'Perform liveness detection' },
  { id: 'face:read', label: 'Face Verify', desc: 'Perform 1:1 face verification' },
  { id: 'face:write', label: 'Face Enrollment', desc: 'Add faces to database' },
];

export const PRICING_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    requestsLimit: 1000,
    features: ['1,000 API Calls/mo', 'Standard Support', '1 API Key', 'Community Docs']
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 299,
    requestsLimit: 50000,
    features: ['50,000 API Calls/mo', 'Priority Email Support', '5 API Keys', '99.9% SLA', 'Data Retention']
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 999,
    requestsLimit: 500000,
    features: ['500,000 API Calls/mo', 'Dedicated Account Manager', 'Unlimited Keys', '99.95% SLA', 'On-Premise Option']
  }
];

// Product Hierarchy Definition (Legacy / Global View)
export const PRODUCT_STRUCTURE = [
  {
    id: 'ocr',
    icon: ScanLine,
    items: [
      'id_card_ocr',
      'driver_license_ocr',
      'vehicle_license_ocr',
      'bank_card_ocr',
      'business_license_ocr',
      'th_vat_ocr',
      'general_ocr'
    ]
  },
  {
    id: 'face',
    icon: UserSquare2,
    items: [
      'face_detection',
      'face_compare',
      'face_search',
    ]
  },
  {
    id: 'liveness',
    icon: Fingerprint,
    items: [
      'liveness_silent',
      'action_liveness',
      // 'liveness_video',
    ]
  }
];

// Extended Country Config with Visual Themes
export interface EnhancedCountryConfig extends CountryConfig {
    themeColor: string; // Tailwind class prefix or hex
    accentColor: string;
}

export const COUNTRY_CAPABILITIES: EnhancedCountryConfig[] = [
    {
        code: 'th',
        name: 'Thailand',
        flag: '🇹🇭',
        themeColor: 'indigo', // Purple/Indigo for Thai (Royal/Official feel)
        accentColor: '#6366f1',
        features: [
            'id_card_ocr', 'driver_license_ocr', 'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr', 'th_vat_ocr', 'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    },
    {
        code: 'vi',
        name: 'Vietnam',
        flag: '🇻🇳',
        themeColor: 'red', // Red for Vietnam
        accentColor: '#ef4444',
        features: [
            'id_card_ocr', 'driver_license_ocr', 'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr', 'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    },
    {
        code: 'id',
        name: 'Indonesia',
        flag: '🇮🇩',
        themeColor: 'emerald', // Emerald/Green for Indonesia
        accentColor: '#10b981',
        features: [
            'id_card_ocr', 'driver_license_ocr', 
            'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr','id_npwp_ocr',  'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    },
    {
        code: 'my',
        name: 'Malaysia',
        flag: '🇲🇾',
        themeColor: 'amber', // Amber/Orange for Malaysia
        accentColor: '#f59e0b',
        features: [
            'id_card_ocr', 'driver_license_ocr', 
            'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr',  'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    },
    {
        code: 'ph',
        name: 'Philippines',
        flag: '🇵🇭',
        themeColor: 'sky', // Sky Blue for Philippines
        accentColor: '#0ea5e9',
        features: [
            'id_card_ocr', 'driver_license_ocr', 
            'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr',  'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    },
    {
        code: 'global',
        name: 'Global / Other',
        flag: '🌏',
        themeColor: 'slate', // Neutral for Global
        accentColor: '#64748b',
        features: [
            'id_card_ocr', 'driver_license_ocr', 
            'vehicle_license_ocr', 'bank_card_ocr', 'business_license_ocr',  'general_ocr',
            'face_detection', 'face_compare', 'face_search', 'liveness_silent',
            'action_liveness', 'rgb_liveness'
        ]
    }
];

export type FeatureInputMode = 'single-image' | 'dual-image' | 'video';

export interface FeatureConfig {
    mode: FeatureInputMode;
    endpoint: string;
    label: string;
    description?: string;
    category: 'ocr' | 'face' | 'liveness'; 
}

export const FEATURE_CONFIG: Record<string, FeatureConfig> = {
    // OCR Features
    id_card_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'ID Card OCR', category: 'ocr' },
    driver_license_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'Driver License OCR', category: 'ocr' },
    vehicle_license_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'Vehicle License OCR', category: 'ocr' },
    bank_card_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'Bank Card OCR', category: 'ocr' },
    business_license_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'Business License OCR', category: 'ocr' },
    general_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'General OCR', category: 'ocr' },
    id_npwp_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'NPWP OCR', category: 'ocr' },
    th_vat_ocr: { mode: 'single-image', endpoint: '/kyc/ocr', label: 'Tax documents OCR', category: 'ocr' },
    
    // Face Features
    face_detection: { mode: 'single-image', endpoint: '/kyc/face/detect', label: 'Face Detection', category: 'face' },
    face_compare: { mode: 'dual-image', endpoint: '/kyc/face/compare', label: 'Face Comparison (1:1)', category: 'face' },
    face_search: { mode: 'single-image', endpoint: '/kyc/face/search', label: 'Face Search (1:N)', category: 'face' },
    
    // Liveness Features
    liveness_silent: { mode: 'single-image', endpoint: '/kyc/liveness/silent', label: 'Silent Liveness', category: 'liveness' },
    liveness_video: { mode: 'video', endpoint: '/kyc/liveness/video', label: 'Video Liveness', category: 'liveness' },
    action_liveness: { mode: 'video', endpoint: '/kyc/liveness/action/session', label: 'Action Liveness', category: 'liveness' },
    rgb_liveness: { mode: 'video', endpoint: '/kyc/liveness/rgb/session', label: 'RGB Liveness', category: 'liveness' },

};

export const OCR_TYPE_MAPPING: Record<string, string> = {
  id_card_ocr: 'id_card',
  driver_license_ocr: 'driver_license',
  vehicle_license_ocr: 'vehicle_license',
  bank_card_ocr: 'bank_card',
  business_license_ocr: 'business_license',
  general_ocr: 'general',
  id_npwp_ocr: 'NPWP',
  th_vat_ocr: 'vat_certificate',
};

export const TRANSLATIONS: Record<Language, Translation> = {
  en,
  th,
  zh,
  vi,
  id,
  ms,
  tl,
  my
};

export interface FeatureToggle {
    id: string;
    enabled: boolean;
    label?: string;
    description?: string;
}

// 灰度功能开关配置
// true = 开放, false = 灰度/隐藏
export const FEATURE_FLAGS: Record<string, boolean> = {
    INTEGRATION_PAGE: false, // 暂不开放 Integration 页面
    LOGS_PAGE: false, // 暂不开放 API Logs 页面
    WEBHOOKS_PAGE: false,
    AUDIT_LOGS: true,
    BILLING_PAGE: false,
    OAUTH_APPS: true,
};

export const MOCK_OCR_RESULT = {
  success: true,
  data: {
    id_number: "1 1005 01234 56 7",
    name_th: "นาย สมมติ นามสกุล",
    name_en: "Mr. Sommut Namsakul",
    date_of_birth: "2535-05-20",
    date_of_issue: "2564-01-15",
    date_of_expiry: "2572-05-19",
    religion: "พุทธ",
    address: "99/99 หมู่ 1 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี"
  },
  meta: {
    latency_ms: 145,
    request_id: "req_mock_123456789"
  }
};