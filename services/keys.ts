
import { ServiceResponse, ApiScope, ApiKey, ApiKeyWithSecret } from '../types';
import { mockDb, generateApiKey } from './mockDb';
import { apiClient } from '../lib/api';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const keyService = {
  // GET /console/keys - Should return keys WITHOUT secrets
  async getKeys(): Promise<ServiceResponse<ApiKey[]>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const userStr = localStorage.getItem('vl_user_enterprise');
          if (!userStr) return { success: false, error: "No session" };
          const user = JSON.parse(userStr);
          
          let keys = user.apiKeys || [];
          
          // If Owner, simulate seeing keys from other members (Mock Only)
          if (user.orgRole === 'owner' || user.orgRole === 'admin') {
              const otherMemberKey = generateApiKey('Mobile App (Dev Team)', ['ocr:read'], { 
                  id: 'u_dev1', 
                  name: 'Dev 1', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev1' 
              }, user.currentOrgId || 'org_mock');
              if (!keys.find((k: ApiKey) => k.name === otherMemberKey.name)) {
                  keys = [...keys, otherMemberKey];
              }
          }
          
          // SECURITY SIMULATION: Strip secrets
          const safeKeys = keys.map((k: any) => {
              const { secret, ...rest } = k;
              return rest;
          });
          
          return { success: true, data: safeKeys };
      } else {
          const response = await apiClient.get<any[]>('/console/keys');
          if (response.success && response.data) {
              // Map backend snake_case to frontend camelCase
              const mappedKeys: ApiKey[] = response.data.map(k => ({
                  id: k.id,
                  name: k.name,
                  prefix: k.prefix,
                  status: k.status,
                  scopes: k.scopes || [],
                  organizationId: k.organization_id || k.org_id,
                  createdBy: {
                      userId: k.created_by?.user_id || k.created_by?.id,
                      name: k.created_by?.name || 'Unknown',
                      avatar: k.created_by?.avatar || ''
                  },
                  createdAt: k.created_at,
                  lastUsedAt: k.last_used_at,
                  lastIp: k.last_ip,
                  ipWhitelist: k.ip_whitelist,
                  stats: k.stats ? {
                      totalRequests24h: k.stats.total_requests_24h || 0,
                      successRate: k.stats.success_rate || 0,
                      lastError: k.stats.last_error,
                      lastErrorAt: k.stats.last_error_at
                  } : undefined
              }));
              return { success: true, data: mappedKeys };
          }
          return { success: false, error: response.error };
      }
  },

  // POST /console/keys - Returns the key WITH secret (One time only)
  async createKey(userId: string, name: string, scopes: ApiScope[]): Promise<ServiceResponse<ApiKeyWithSecret>> {
    if (CONFIG.USE_MOCK) {
        await delay(500);
        const user = mockDb.getUserById(userId);
        if (!user) return { success: false, error: "User not found" };

        const newKey = generateApiKey(
            name, 
            scopes, 
            { id: user.id, name: user.name, avatar: user.avatar },
            user.organization?.id || user.currentOrgId || 'org_unknown'
        );
        const updatedKeys = [...(user.apiKeys || []), newKey];
        
        mockDb.updateUser(userId, { apiKeys: updatedKeys });
        return { success: true, data: newKey as ApiKeyWithSecret };
    } else {
        console.log('Creating key for user:', userId, 'with name:', name, 'and scopes:', scopes);
        return apiClient.post<ApiKeyWithSecret>('/console/keys', { name, scopes });
    }
  },

  async updateKey(userId: string, keyId: string, data: { scopes: ApiScope[] }): Promise<ServiceResponse<ApiKey>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const user = mockDb.getUserById(userId);
          if (!user) return { success: false, error: "User not found" };

          let updatedKey: ApiKey | undefined;
          const updatedKeys = (user.apiKeys || []).map((k: any) => {
              if (k.id === keyId) {
                  updatedKey = { ...k, scopes: data.scopes };
                  return updatedKey;
              }
              return k;
          });

          if (!updatedKey) return { success: false, error: "Key not found" };

          mockDb.updateUser(userId, { apiKeys: updatedKeys });
          // Strip secret for return
          const { secret, ...safeKey } = updatedKey as any;
          return { success: true, data: safeKey };
      } else {
          return apiClient.patch<ApiKey>(`/console/keys/${keyId}`, data);
      }
  },

  async revokeKey(userId: string, keyId: string): Promise<ServiceResponse<void>> {
    if (CONFIG.USE_MOCK) {
        await delay(400);
        const user = mockDb.getUserById(userId);
        if (!user) return { success: false, error: "User not found" };

        const updatedKeys = (user.apiKeys || []).map((k: any) => 
          k.id === keyId ? { ...k, status: 'revoked' as const } : k
        );

        mockDb.updateUser(userId, { apiKeys: updatedKeys });
        return { success: true };
    } else {
        return apiClient.delete<void>(`/console/keys/${keyId}`);
    }
  },

  // GET /console/keys/:id/secret - Explicit Reveal Endpoint (Audited)
  async revealSecret(userId: string, keyId: string): Promise<ServiceResponse<{ secret: string, masked_secret: string }>> {
      if (CONFIG.USE_MOCK) {
          await delay(300);
          const user = mockDb.getUserById(userId);
          if (!user) return { success: false, error: "User not found" };
          
          const key = (user.apiKeys || []).find((k: any) => k.id === keyId);
          // In mock, we grab the secret from the persisted DB object. 
          // In real life, DB stores hash, and this endpoint might access a Vault or fail if only hash is stored.
          // Usually, keys are only showable once. 
          // However, for this demo "reveal" pattern, we assume we can retrieve it or regenerate it.
          // Casting to any to access secret for mock logic
          const mockSecret = (key as any)?.secret || `sk_live_mock_revealed_${Math.random().toString(36).substr(2, 16)}`;
          
          // Log audit in mock
          mockDb.logAction(user.organization?.id || '', user.id, user.name, 'key.reveal', `Revealed key ${keyId}`);

          return { 
              success: true, 
              data: { 
                  secret: mockSecret, 
                  masked_secret: (key?.prefix || "pk_test") + "..." + mockSecret.substr(-4) 
              } 
          };
      } else {
          return apiClient.get<{ secret: string, masked_secret: string }>(`/console/keys/${keyId}/secret`);
      }
  }
};
