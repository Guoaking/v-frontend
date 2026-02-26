
const getEnvVar = (key: string, defaultValue: string): string => {
  // 1. Runtime Injection (Docker/Production)
  // This object is injected by entrypoint.sh into window object at runtime
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    // @ts-ignore
    return String(window.__ENV__[key]);
  }

  // 2. Build-time Injection (Vite Dev/Local)
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return String(import.meta.env[key]);
    }
  } catch {}

  return defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const v = getEnvVar(key, defaultValue ? 'true' : 'false').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
};

export const CONFIG = {
  USE_MOCK: getEnvBool('VITE_USE_MOCK', false), 
  
  // Base URL for the real backend API
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8082/api/v1'),
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: getEnvVar('VITE_GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'),

  // Grafana Monitoring Dashboards (Base URL + Dashboard Paths)
  GRAFANA: {
      BASE_URL: getEnvVar('VITE_GRAFANA_URL', 'http://localhost:3000'),
      DASHBOARDS: [
          { 
              id: 'kyc-api-performance-001', 
              name: 'overview', 
              path: '/d/kyc-api-performance-001/3a3ce70?orgId=1' 
          },
          { 
              id: 'business', 
              name: 'business', 
              path: '/d/kyc-core-business-001/cbecbaa?orgId=1s' 
          },
          { 
              id: 'security', 
              name: 'security', 
              path: '/d/kyc-business-operations-001/eef460c?orgId=1' 
          }
      ]
  }
};
