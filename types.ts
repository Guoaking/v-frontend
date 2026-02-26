
// ... 保持原有导入 ...

export type Language = 'en' | 'th' | 'zh' | 'vi' | 'id' | 'ms' | 'tl' | 'my';
export type OCRLanguageCode = 'th' | 'vi' | 'id' | 'ms' | 'tl' | 'en' | 'zh';

export type ApiScope = 
  | 'ocr:read'
  | 'liveness:read'
  | 'face:read'
  | 'face:write'
  | 'system:admin';

export type OrgRole = 'owner' | 'admin' | 'developer' | 'viewer' | string;

export interface PermissionDefinition {
    id: string;
    name: string;
    category: string;
    description: string;
}

export interface RoleDefinition {
    id: OrgRole;
    name: string;
    description: string;
    isSystem?: boolean;
    permissions: string[];
}

export interface KeyStats {
    totalRequests24h: number;
    successRate: number;
    lastError?: string;
    lastErrorAt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  secret?: string;
  status: 'active' | 'revoked' | 'expired' | 'rate_limited'; 
  scopes: ApiScope[];
  organizationId: string; 
  createdBy: {
      userId: string;
      name: string;
      avatar: string;
  };
  createdAt: string;
  lastUsedAt?: string;
  lastIp?: string;
  ipWhitelist?: string[];
  stats?: KeyStats;
}

export interface ApiKeyWithSecret extends ApiKey {
    secret: string;
}

export interface OAuthClient {
    client_id: string;
    client_secret?: string;
    name: string;
    description?: string;
    redirect_uri: string;
    scopes: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[]; 
  secret: string; 
  status: 'active' | 'inactive';
  lastDelivery?: string;
  lastStatus?: number;
}

export interface UsageMetric {
  date: string;
  requests: number;
  errors: number;
  cost?: number;
  services?: Record<string, number>; // Breakdown by service (e.g., { ocr: 10, face: 5 })
}

export interface UsageBreakdownItem {
    id: string;
    label: string;
    count: number;
    percentage: number;
    trend?: number; // +10% or -5%
}

export interface DetailedUsageStats {
    totalRequests: number;
    totalErrors: number;
    period: string;
    timeline: UsageMetric[]; 
    byService: UsageBreakdownItem[];
    byKey: UsageBreakdownItem[];
    byEndpoint: UsageBreakdownItem[];
    quotaStatus: {
        used: number;
        limit: number;
        remaining: number;
        percentUsed: number;
        resetDate: string | null;
        forecastDepletionDate?: string; // Estimated date to hit 100%
    };
}

export interface PlanQuotaConfigItem {
    limit: number;
    period: 'monthly' | 'lifetime' | 'yearly';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency?: string;
  requestsLimit?: number;
  features?: any; 
  quotaConfig?: Record<string, PlanQuotaConfigItem>;
  isActive?: boolean;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: OrgRole;
  avatar: string;
  status: 'active' | 'suspended';
  joinedAt: string;
  lastActive?: string;
}

export interface Invitation {
    id: string;
    email: string;
    role: OrgRole;
    organizationId: string;
    organizationName: string;
    inviterName: string;
    status: 'pending' | 'accepted' | 'expired';
    sentAt: string;
    expiresAt: string;
}

export interface Notification {
    id: string;
    type: 'invitation' | 'alert' | 'info';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
}

export interface UsageSummary {
    totalRequests: number;
    limit: number;
    percentUsed: number;
    period: string;
}

export interface QuotaItem {
    limit: number;
    used: number;
    remaining: number;
    resetAt: string | null;
}

export interface OrgQuota {
    [key: string]: QuotaItem | undefined;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  plan: Plan;
  billingEmail: string;
  members?: Member[]; 
  invoices?: Invoice[];
  usageSummary?: UsageSummary;
  quotas?: OrgQuota;
  balance?: number;
  createdAt?: string;
}

export interface RequestLog {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    statusCode: number;
    latency: number;
    timestamp: string;
    clientIp: string;
    keyId?: string; 
    keyName?: string;
    keyOwner?: string;
    requestBody?: string; 
    responseBody?: string; 
}

export interface UserOrg {
    id: string;
    name: string;
    role?: OrgRole; // 后端 orgs 数组可能没给角色，给可选
}

export interface SwitchOrgResponse {
    current_org_id: string;
    access_token?: string;
    permissions?: string[];
    org_role?: OrgRole;
}

export interface User {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  avatar: string;
  company?: string;
  password?: string;
  org_id?: string; 
  org_role?: OrgRole;
  last_active_org_id?: string;
  role: 'admin' | 'user';
  isPlatformAdmin?: boolean; 
  currentOrgId?: string; 
  orgRole: OrgRole; 
  organization?: Organization; 
  organizations: UserOrg[]; // 对应后端返回的 data.user.orgs
  permissions: string[]; 
  apiKeys?: ApiKey[]; 
  oauthClients?: OAuthClient[];
  webhooks?: Webhook[];
  status: 'active' | 'suspended';
  lastLogin?: string;
  notifications?: Notification[];
}

export interface AdminStats {
  totalUsers: number;
  activeKeys: number;
  totalRequests: number;
  systemHealth: number;
}

export interface AuditLog {
    id: string;
    organizationId: string;
    userId: string;
    userName: string;
    action: string;
    target: string;
    ip: string;
    timestamp: string;
    status: 'success' | 'failure';
    metadata?: any;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number;
    meta?: {
        requestId?: string;
        code?: number;
        timestamp?: number;
    }
}

export interface Translation {
  common: { [key: string]: string };
  nav: { [key: string]: string };
  auth: { [key: string]: string };
  console: { [key: string]: string };
  profile: { [key: string]: string };
  settings: { [key: string]: string };
  billing: { [key: string]: string };
  team: { [key: string]: string };
  admin: any;
  hero: { [key: string]: string };
  home_stats: { [key: string]: string };
  features: { [key: string]: string };
  products: any;
  solutions: any;
  playground: any;
  chat: any;
  footer: any;
  oauth: any;
}

export interface FacialArea {
    x: number;
    y: number;
    w: number;
    h: number;
    left_eye?: number[];
    right_eye?: number[];
}

export interface FaceDetectionResult {
    is_face_exist: number;
    face_num: number;
    faces_detected: {
        facial_area: FacialArea;
        confidence: number;
    }[];
}

export interface FaceComparisonResult {
    is_face_exist: number;
    confidence_exist: number[];
    is_same_face: number;
    confidence: number;
    detection_result: string;
}

export interface FaceSearchResult {
    searched_similar_pictures: {
        picture: string; 
        confidence: number;
    }[];
    has_similar_picture: number;
}

export interface LivenessResult {
    is_face_exist?: number;
    face_confidence?: number;
    is_live?: number;
    liveness_confidence?: number;
    video_liveness_score?: number;
}

export interface OCRResult {
    parsing_results?: Record<string, { text: string; confidence: number }>;
    full_text?: string;
    filename?: string;
}

export interface AnalysisResult {
    error?: string;
    msg?: string;
    message?: string;
    code?: number;
    detection_results?: FaceDetectionResult;
    comparison_results?: FaceComparisonResult;
    searching_results?: FaceSearchResult;
    liveness_result?: LivenessResult; 
    parsing_results?: Record<string, { text: string; confidence: number }>;
    filename?: string | string[];
    meta?: {
        latency_ms: number;
        request_id: string;
    };
}

export interface ApiField {
    name: string;
    type: string; 
    required?: boolean;
    description: string;
    children?: ApiField[]; 
    enum?: string[]; 
}

export interface ApiResponseDef {
    code: number;
    description: string;
    schema: ApiField[]; 
    example: string; 
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: ApiField[];
  responses: ApiResponseDef[];
  playgroundLink?: string;
}

export interface DocSection {
  id: string;
  title: string;
  content?: string;
  api?: ApiEndpoint;
  subsections?: DocSection[];
  tableData?: {
      headers: string[];
      rows: string[][];
  };
}

export interface CountryConfig {
    code: string;
    name: string;
    flag: string;
    features: string[]; 
}
