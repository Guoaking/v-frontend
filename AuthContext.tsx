
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiScope, OrgRole, RoleDefinition, ServiceResponse, ApiKey, ApiKeyWithSecret, UserOrg } from './types';
import { authService } from './services/auth';
import { keyService } from './services/keys';
import { orgService } from './services/org';
import { apiClient } from './lib/api';
import { CONFIG } from './services/config';
import { mockDb } from './services/mockDb';
import { debug } from 'console';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  adminLogin: () => Promise<boolean>;
  register: (name: string, email: string, password?: string, company?: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: { name: string; company: string; avatar: string }) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (current: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  switchOrganization: (orgId: string) => Promise<boolean>;
  createApiKey: (name: string, scopes: ApiScope[]) => Promise<ServiceResponse<ApiKeyWithSecret>>;
  revokeApiKey: (id: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  inviteMember: (email: string, role: OrgRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: OrgRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  getAvailableRoles: () => Promise<RoleDefinition[]>;
  updatePlan: (planId: string) => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncApiClient = (u: User | null, token?: string) => {
      if (token) apiClient.setToken(token);
      const orgId = u?.currentOrgId || u?.org_id;
      if (orgId) {
          apiClient.setOrganizationId(orgId);
      }
  };

  const ensureOrgContext = (u: User, existingOrgs?: UserOrg[]): User => {
      // 1. 适配后端字段名 orgs -> organizations
      // 如果新数据里没给 orgs (比如简单的 profile 接口)，则尝试保留内存中已有的列表
    
      const newOrgs = (u as any).orgs || u.organizations || existingOrgs || [];
      const finalUser = { ...u, organizations: newOrgs };

      // 2. 确定激活 ID：优先级 运行时 > 后端 last_active > 后端 org_id > 列表第一个
      const activeOrgId = u.currentOrgId || u.last_active_org_id || u.org_id;
      
      if (!activeOrgId && newOrgs.length > 0) {
          const defaultOrg = newOrgs[0];
          finalUser.currentOrgId = defaultOrg.id;
          finalUser.orgRole = defaultOrg.role || u.org_role || 'member';
      } else if (activeOrgId) {
          finalUser.currentOrgId = activeOrgId;
          const membership = newOrgs.find((o: any) => o.id === activeOrgId);
          // Prioritize explicit role from response (u.org_role/u.orgRole) over cached membership list
          // This fixes the issue where stale organization lists override the fresh role after switching
          finalUser.orgRole = u.org_role || u.orgRole || membership?.role || 'member';
      }
      
      return finalUser;
  };

  const refreshUser = async () => {
      if (!user) return;
      const response = await authService.getCurrentUser(user.id);
      if (response.success && response.data) {
          // 刷新时传入当前的 organizations，防止 profile 接口没返回列表时导致列表丢失
          const freshUser = ensureOrgContext(response.data, user.organizations);
          setUser(freshUser);
          syncApiClient(freshUser);
          localStorage.setItem('vl_user_enterprise', JSON.stringify(freshUser));
      }
  };

  useEffect(() => {
    // 注册 401 拦截回调
    apiClient.setUnauthorizedCallback(() => {
        console.warn("Session expired (401). Logging out...");
        logout();
        // 可选：跳转到登录页，或者弹窗提示
        // window.location.href = '/login'; 
    });

    const initializeAuth = async () => {
        setIsLoading(true);
        const storedUserStr = localStorage.getItem('vl_user_enterprise');
        const storedToken = localStorage.getItem('vl_token');

        if (storedUserStr && storedToken) {
            try {
                let storedUser = JSON.parse(storedUserStr);
                // 恢复时确保上下文正确
                storedUser = ensureOrgContext(storedUser);
                syncApiClient(storedUser, storedToken);
                setUser(storedUser);

                // 异步验证并刷新最新状态
                authService.getCurrentUser(storedUser.id).then(res => {
                    if (res.success && res.data) {
                        // 注意：这里也要传入旧的组织列表作为 backup，除非后端接口确保每次都带 orgs
                        const freshUser = ensureOrgContext(res.data, storedUser.organizations);
                        setUser(freshUser);
                        syncApiClient(freshUser);
                        localStorage.setItem('vl_user_enterprise', JSON.stringify(freshUser));
                    }
                });
            } catch (e) {
                console.error("Session restore failed", e);
            }
        }
        setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Poll for user updates (permissions, roles, status) every 60 seconds
  useEffect(() => {
      if (!user) return;
      
      const interval = setInterval(() => {
          refreshUser().catch(console.error);
      }, 60000); // 1 minute polling

      return () => clearInterval(interval);
  }, [user?.id]); // Restart if user ID changes

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
        const response = await authService.login(email, password);
        console.log('login response', response);
        if (response.success && response.data) {
            const rawData = response.data as any;
            const token = rawData.access_token;
            const userData = response.data;
            

            if (token) localStorage.setItem('vl_token', token);
            
            // 登录时后端返回了完整的 orgs，直接处理
            const userWithContext = ensureOrgContext(userData);
            setUser(userWithContext);
            syncApiClient(userWithContext, token);
            localStorage.setItem('vl_user_enterprise', JSON.stringify(userWithContext));
            
            // 提示当前登录的组织
            if (userWithContext.organization?.name) {
                console.log(`Logged in to ${userWithContext.organization.name}`);
                // toast.success(`Logged in to ${userWithContext.organization.name}`); // 需确保 ToastContext 在此可用，但 AuthContext 通常在最外层
            }

            return { success: true, user: userWithContext };
        }
        return { success: false, error: response.error };
    } catch (e: any) {
        return { success: false, error: e.message };
    } finally {
        setIsLoading(false);
    }
  };

  const adminLogin = async () => {
      setIsLoading(true);
      try {
          const response = await authService.adminLogin();
          if (response.success && response.data) {
              const rawData = response.data as any;
              const token = rawData.access_token || "mock_admin_token";
              const userData = rawData.user || rawData;
              
              
              localStorage.setItem('vl_token', token);
              const userWithContext = ensureOrgContext(userData);
              setUser(userWithContext);
              syncApiClient(userWithContext, token);
              localStorage.setItem('vl_user_enterprise', JSON.stringify(userWithContext));
              return true;
          }
          return false;
      } finally {
          setIsLoading(false);
      }
  }

  const register = async (name: string, email: string, password?: string, company?: string) => {
    setIsLoading(true);
    try {
        const response = await authService.register(name, email, password, company);
        if (response.success && response.data) {
            return { success: true };
        }
        return { success: false, error: response.error };
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('vl_user_enterprise');
    localStorage.removeItem('vl_token');
    apiClient.clearToken();
  };

  const switchOrganization = async (orgId: string) => {
      if (!user) return false;
      
      try {
          // 1. 设置 API 客户端 header (Optimistic)
          apiClient.setOrganizationId(orgId);
          
          // 2. 调用后端切换接口 (Explicit Context Switch)
          // 这要求后端实现 POST /api/v1/orgs/switch 接口，返回更新后的 User 对象
          const response = await authService.switchOrganization(orgId);

          if (response.success && response.data) {
              const { access_token, permissions, org_role, current_org_id } = response.data;
              console.log('Switch Org Response:', { access_token, permissions, org_role, current_org_id });



              // 3. 处理 Token 更新 (Critical Fix)
              if (access_token) {
                  localStorage.setItem('vl_token', access_token);
                  apiClient.setToken(access_token);
              }

              // 4. 更新用户对象
              // Find role in local list to ensure we have a fallback if backend response is sparse
              // Using user.orgRole as fallback is risky because it holds the OLD org's role
              const targetOrgLocal = user.organizations?.find(o => o.id === (current_org_id || orgId));
              const fallbackRole = targetOrgLocal?.role || 'member';
              console.log('Fallback Role:', fallbackRole);

              const updatedUser = { 
                  ...user, 
                  currentOrgId: current_org_id || orgId,
                  org_id: current_org_id || orgId,
                  // 如果后端返回了新权限和角色，直接更新
                  permissions: permissions || user.permissions,
                  org_role: org_role || fallbackRole
              };
              const finalUser = ensureOrgContext(updatedUser, user.organizations);
              
              // 5. 持久化并更新状态
              setUser(finalUser);
              localStorage.setItem('vl_user_enterprise', JSON.stringify(finalUser));
              
              // 如果没有返回 permissions (例如旧后端)，则需要刷新
              if (!permissions && !CONFIG.USE_MOCK) {
                  await refreshUser();
              }
              
              return true;
          } else {
              // 切换失败，回滚 Header
              console.error("Switch failed:", response.error);
              apiClient.setOrganizationId(user.currentOrgId || '');
              return false;
          }
      } catch (e) {
          console.error("Organization switch failed", e);
          apiClient.setOrganizationId(user.currentOrgId || '');
          return false;
      }
  };

  // ... (其余方法保持不变)
  const createApiKey = async (name: string, scopes: ApiScope[]) => {
    if (!user) return { success: false, error: "User not authenticated" };
    console.log('Creating key for user:', user.id);
    const response = await keyService.createKey(user.id, name, scopes);
    console.log('Create key response:', response);
    if (response.success) {
        await refreshUser();
    }
    return response;
  };

  const revokeApiKey = async (id: string) => {
    if (!user) return;
    const response = await keyService.revokeKey(user.id, id);
    if (response.success) {
        await refreshUser();
    }
  };

  const toggleUserStatus = async (targetUserId: string) => {
      if (!user || !user.isPlatformAdmin) return;
      await orgService.toggleUserStatus(user.id, targetUserId);
  }

  const inviteMember = async (email: string, role: OrgRole) => {
      if (!user) return;
      await orgService.inviteMember(user.id, email, role);
      refreshUser();
  }

  const updateMemberRole = async (memberId: string, role: OrgRole) => {
      if (!user) return;
      await orgService.updateMemberRole(user.id, memberId, role);
      refreshUser();
  }

  const removeMember = async (memberId: string) => {
      if (!user) return;
      await orgService.removeMember(user.id, memberId);
      refreshUser();
  }

  const updatePlan = async (planId: string) => {
      if (!user) return;
      await orgService.updatePlan(user.id, planId);
      refreshUser();
  }

  const getAvailableRoles = async () => {
      const res = await orgService.getAvailableRoles();
      return res.data || [];
  }

  const requestPasswordReset = async (email: string) => {
      return authService.requestPasswordReset(email);
  }
  const updateUserProfile = async (data: any) => {
      const res = await authService.updateProfile(user?.id || '', data);
      if (res.success && res.data) {
          const freshUser = ensureOrgContext(res.data, user?.organizations);
          setUser(freshUser);
          localStorage.setItem('vl_user_enterprise', JSON.stringify(freshUser));
      }
      return res;
  }
  const updatePassword = async (curr: string, newP: string) => {
      return authService.updatePassword(user?.id || '', curr, newP);
  }

  const deleteAccount = async () => {
      if (!user) return { success: false, error: "Not logged in" };
      const res = await authService.deleteAccount(user.id);
      if (res.success) {
          logout();
      }
      return res;
  }

  return (
    <AuthContext.Provider value={{ 
        user, 
        login, adminLogin, register, requestPasswordReset, logout, 
        updateUserProfile, updatePassword, deleteAccount,
        switchOrganization,
        createApiKey, revokeApiKey, toggleUserStatus, 
        inviteMember, removeMember, updatePlan, updateMemberRole, getAvailableRoles,
        isLoading, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
