
import { CONFIG } from '../services/config';

export interface ApiConfig {
  baseUrl: string;
  token?: string;
  language?: string;
  organizationId?: string;
}

// --- GO BACKEND RESPONSE STRUCTURES ---
// Strictly matches the provided Go struct
interface GoBaseResponse {
    code: number;       // Custom Business Code
    message: string;
    timestamp: number;
    request_id: string;
    path?: string;
    method?: string;
}

// Matches: type SuccessResponse struct
interface GoSuccessResponse<T> extends GoBaseResponse {
    data?: T;
}

// Matches: type ErrorResponse struct
interface GoErrorResponse extends GoBaseResponse {
    error?: string;      // Developer detail error
    errors?: any[];      // Field validation errors
}

// Frontend Internal Unified Format
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number; // HTTP Status Code
  meta?: {
      requestId: string;
      code: number; // Business Code
      timestamp: number;
  }
}

export class ApiClient {
  private config: ApiConfig;
  private static instance: ApiClient;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('vl_token') : undefined;
      const storedOrgId = typeof window !== 'undefined' ? localStorage.getItem('vl_org_id') : undefined;
      
      ApiClient.instance = new ApiClient({ 
          baseUrl: CONFIG.API_BASE_URL,
          token: storedToken || undefined,
          organizationId: storedOrgId || undefined
      });
    }
    return ApiClient.instance;
  }

  // Callback function to handle unauthorized access (401)
  private onUnauthorized: (() => void) | null = null;

  public setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  public setToken(token: string) {
    this.config.token = token;
  }

  public setOrganizationId(orgId: string) {
    this.config.organizationId = orgId;
    if (typeof window !== 'undefined') {
        localStorage.setItem('vl_org_id', orgId);
    }
  }

  public clearToken() {
    delete this.config.token;
    delete this.config.organizationId;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('vl_org_id');
    }
  }

  public updateConfig(newConfig: Partial<ApiConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    if (this.config.organizationId) {
      headers['X-Organization-ID'] = this.config.organizationId;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (response.status === 401) {
         console.warn('Unauthorized access detected.');
         if (this.onUnauthorized) {
             this.onUnauthorized();
         }
         return { success: false, error: 'Unauthorized access', status: 401 };
      }

      const responseData = await response.json().catch(() => null);
      const goRes = responseData as (GoSuccessResponse<T> & GoErrorResponse) | null;

      // Extract Meta from Go Response
      const meta = goRes ? {
          requestId: goRes.request_id,
          timestamp: goRes.timestamp,
          code: goRes.code
      } : undefined;

      // HTTP Error (4xx, 5xx)
      if (!response.ok) {
        // Prioritize Go error struct, fallback to message, then status text
        const errorMessage = goRes?.error || goRes?.message || response.statusText || `HTTP Error: ${response.status}`;
        return {
          success: false,
          data: goRes?.data, // Sometimes error responses have data
          error: errorMessage,
          status: response.status,
          meta
        };
      }

      // Business Logic Check based on Go `code` field
      // Assuming 0 is Success (Common in Go/gRPC style), or 200 (HTTP style mapping)
      // We accept both to be safe, but this should be standardized in backend.
      if (goRes && typeof goRes.code === 'number' && goRes.code !== 0 && goRes.code !== 200) {
          return {
              success: false,
              error: goRes.message || goRes.error || `Business Error Code: ${goRes.code}`,
              status: response.status,
              meta
          };
      }

      return {
        success: true,
        data: (goRes && 'data' in goRes) ? goRes.data : (goRes as unknown as T), 
        status: response.status,
        meta
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request Timeout', status: 408 };
      }
      return { success: false, error: error.message || 'Network Error', status: 0 };
    }
  }

  public async postFormData<T>(endpoint: string, formData: FormData): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    
    if (this.config.organizationId) {
      headers['X-Organization-ID'] = this.config.organizationId;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers, 
            body: formData,
        });
        
        const responseData = await response.json().catch(() => null);
        const goRes = responseData as (GoSuccessResponse<T> & GoErrorResponse) | null;
        
        
        const meta = goRes ? {
            requestId: goRes.request_id,
            timestamp: goRes.timestamp,
            code: goRes.code
        } : undefined;

        if (!response.ok) {
            return {
                success: false,
                data: goRes?.data,
                error: goRes?.error || `HTTP Error: ${response.status}`,
                message: goRes?.message || `HTTP Error: ${response.status}`,
                status: response.status,
                meta
            };
        }
        
        if (goRes && goRes.code !== 0 && goRes.code !== 200) {
          console.log("Go Response:", goRes);
             return {
                success: false,
                error: goRes.error || `Error: ${goRes.code}`,
                message: goRes.message || `Error: ${goRes.code}`,
                status: response.status,
                meta
            };
        }

        return {
            success: true,
            data: goRes?.data as T,
            status: response.status,
            meta
        };
    } catch (error: any) {
        return { success: false, error: error.message, status: 0 };
    }
  }

  // ... (Keep existing getBlob/get/put/patch/delete/post methods) ...
  public async getBlob(endpoint: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    if (this.config.organizationId) {
      headers['X-Organization-ID'] = this.config.organizationId;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            return { success: false, error: `Download failed: ${response.status}` };
        }

        const blob = await response.blob();
        return { success: true, data: blob };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
  }

  public get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  public put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }
  
  public patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  public delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = ApiClient.getInstance();
