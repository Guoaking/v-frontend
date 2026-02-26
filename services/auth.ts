
import { User, ServiceResponse,SwitchOrgResponse, OrgRole } from '../types';
import { mockDb } from './mockDb';
import { apiClient } from '../lib/api';
import { CONFIG } from './config';

// Simulate network delay for mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user?: User; // Optional: if backend returns user info immediately
}

export const authService = {
  async login(email: string, password?: string): Promise<ServiceResponse<User>> {
    if (CONFIG.USE_MOCK) {
        await delay(800);
        const user = mockDb.getUserByEmail(email);
        
        if (user) {
            // Mask secrets for security simulation
            const safeUser = {
                ...user,
                apiKeys: user.apiKeys?.map(k => {
                    const { secret, ...rest } = k as any;
                    return rest;
                }) || [],
                isPlatformAdmin: user.role === 'admin'
            };
            return { success: true, data: safeUser };
        }
        
        // Auto-create for demo convenience in mock mode
        const newUser = mockDb.createNewUserObject(email.split('@')[0], email);
        mockDb.createUser(newUser);
        // Mask secret for return
        // Casting to any to access secret from mock object
        const { secret, ...restKey } = (newUser.apiKeys?.[0] || {}) as any;
        const safeNewUser = { ...newUser, apiKeys: [restKey] };
        
        return { success: true, data: safeNewUser };
    } else {
        // Real Backend Call
        try {
            // 1. Authenticate to get Token
            const tokenRes = await apiClient.post<LoginResponse>('/auth/login', { 
                email, 
                password: password || 'password' 
            });

            if (!tokenRes.success || !tokenRes.data?.access_token) {
                return { success: false, error: tokenRes.error || "Authentication failed" };
            }

            // 2. Set Token for subsequent requests
            apiClient.setToken(tokenRes.data.access_token);
            localStorage.setItem('vl_token', tokenRes.data.access_token);

            // 3. Fetch User Profile
            let user: User | undefined = tokenRes.data.user;
            console.log('user', user);
            if (!user) {
                const userRes = await this.getCurrentUser();
                if (!userRes.success || !userRes.data) {
                    return { success: false, error: "Failed to fetch user profile" };
                }
                user = userRes.data;
            }
            
            // 4. Sanitize potentially unsafe user object immediately after login
            if (user) {
                if (!user.permissions) user.permissions = [];
                if (!user.apiKeys) user.apiKeys = [];
                // Fallback for platform admin if backend missed it
                if (user.role === 'admin' && user.isPlatformAdmin === undefined) {
                    user.isPlatformAdmin = true;
                }
                console.log('user2', user);
            }
            
            return { success: true, data: user };

        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
  },

  async adminLogin(): Promise<ServiceResponse<User>> {
      if (CONFIG.USE_MOCK) {
          await delay(600);
          const admin = mockDb.getAllUsers().find(u => u.role === 'admin');
          if (admin) {
              const safeAdmin = {
                  ...admin,
                  apiKeys: admin.apiKeys?.map(k => {
                      const { secret, ...rest } = k as any;
                      return rest;
                  }) || [],
                  isPlatformAdmin: true
              };
              return { success: true, data: safeAdmin };
          }
          return { success: false, error: "Admin account not found in mock DB" };
      } else {
          return this.login('admin@verilocale.com', 'admin123');
      }
  },

  async register(name: string, email: string, password?: string, company?: string): Promise<ServiceResponse<User>> {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    if (CONFIG.USE_MOCK) {
        await delay(800);
        const existing = mockDb.getUserByEmail(email);
        if (existing) {
            return { success: false, error: "Email already exists" };
        }
        const newUser = mockDb.createNewUserObject(name, email);
        newUser.avatar = defaultAvatar;
        mockDb.createUser(newUser);
        
        // Mask secret for return
        // Casting to any to access secret from mock object
        const { secret, ...restKey } = (newUser.apiKeys?.[0] || {}) as any;
        const safeNewUser = { ...newUser, apiKeys: [restKey] };

        return { success: true, data: safeNewUser };
    } else {
        const res = await apiClient.post<any>('/auth/register', { 
            full_name: name, 
            email, 
            password: password || 'password', 
            company: company || `${name}'s company`,
            avatar: defaultAvatar
        });
        
        if (res.success) {
            return this.login(email, password);
        }
        
        return { success: false, error: res.error };
    }
  },

  async requestPasswordReset(email: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          return { success: true };
      } else {
          return apiClient.post<void>('/auth/password-reset/request', { email });
      }
  },

  async updateProfile(userId: string, data: { name: string; company: string; avatar: string }): Promise<ServiceResponse<User>> {
    if (CONFIG.USE_MOCK) {
        await delay(500);
        const updated = mockDb.updateUser(userId, data);
        if (updated) {
             const safeUpdated = {
                ...updated,
                apiKeys: updated.apiKeys?.map(k => {
                    const { secret, ...rest } = k as any;
                    return rest;
                }) || []
            };
            return { success: true, data: safeUpdated };
        }
        return { success: false, error: "User not found" };
    } else {
        return apiClient.put<User>('/console/users/me', data);
    }
  },
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(600);
          return { success: true };
      } else {
          return apiClient.put<void>('/users/me/password', { 
              current_password: currentPassword, 
              new_password: newPassword 
          });
      }
  },

  async deleteAccount(userId: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(1000);
          const user = mockDb.getUserById(userId);
          
          // Backend Logic Simulation: Check if Owner
          if (user?.orgRole === 'owner') {
              // Check if they are the ONLY member or the primary owner
              // Simplified mock check:
              return { success: false, error: "Cannot delete account while you are the Owner of an organization. Please transfer ownership or delete the organization first." };
          }
          
          mockDb.updateUser(userId, { status: 'suspended' }); // Soft delete in mock
          return { success: true };
      } else {
          return apiClient.delete<void>('/users/me');
      }
  },

  async switchOrganization(orgId: string): Promise<ServiceResponse<SwitchOrgResponse>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          
          // Get current user from storage to find the role in target org
          const userStr = localStorage.getItem('vl_user_enterprise');
          let newRole: OrgRole = 'member';
          let newPerms: string[] = [];

          if (userStr) {
              const user = JSON.parse(userStr);
              const targetOrg = user.organizations?.find((o: any) => o.id === orgId);
              
              if (targetOrg) {
                  newRole = targetOrg.role;
                  newPerms = mockDb.resolvePermissions(newRole);
                  
                  // Update Mock DB state so subsequent refreshes work
                  mockDb.updateUser(user.id, { 
                      currentOrgId: orgId,
                      orgRole: newRole,
                      permissions: newPerms
                  });
              }
          }

          return { 
              success: true, 
              data: { 
                  current_org_id: orgId,
                  org_role: newRole,
                  permissions: newPerms
              } 
          };
      } else {
          // Explicitly call backend to switch context
          // This ensures the backend generates a new session/token if needed, 
          // or updates the current session's active organization.
          return apiClient.post<SwitchOrgResponse>('/orgs/switch', { org_id: orgId });
      }
  },

  async getCurrentUser(userId?: string): Promise<ServiceResponse<User>> {
      if (CONFIG.USE_MOCK) {
          if (!userId) return { success: false, error: "No session" };
          const user = mockDb.getUserById(userId);
          if (user) {
              // SECURITY SIMULATION: Remove secrets from nested API keys
              const safeUser = {
                  ...user,
                  apiKeys: user.apiKeys?.map(k => {
                      // Destructure secret out to exclude it
                      const { secret, ...rest } = k as any;
                      return rest;
                  }) || [],
                  isPlatformAdmin: user.role === 'admin'
              };
              return { success: true, data: safeUser };
          }
          return { success: false, error: "User not found" };
      } else {
          const response = await apiClient.get<User>('/console/users/me');
          if (response.success && response.data) {
              // Sanitize Response for Frontend Safety
              const u = response.data;
              // 1. Ensure permissions exist if backend misses it
              if (!u.permissions) u.permissions = [];
              
              // 2. Ensure apiKeys is array
              if (!u.apiKeys) u.apiKeys = [];
              
              // 3. Map Legacy Fields if necessary
              if (Array.isArray(u.apiKeys)) {
                  u.apiKeys = u.apiKeys.map((k: any) => ({
                      ...k,
                      createdAt: k.createdAt || k.created_at || new Date().toISOString(),
                      lastUsed: k.lastUsed || k.last_used_at || k.last_used || null,
                      // Ensure secret is NOT present (Backend should handle this, but double check)
                      secret: undefined
                  }));
              }

              // 4. Calculate Platform Admin flag
              u.isPlatformAdmin = u.role === 'admin' || !!u.isPlatformAdmin;
          }
          return response;
      }
  },

  logout(): void {
      if (!CONFIG.USE_MOCK) {
          apiClient.clearToken();
      }
  }
};
