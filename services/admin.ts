
import { ServiceResponse, User, Organization, AuditLog, PaginatedResponse, AdminStats, RoleDefinition, PermissionDefinition, Plan, OrgQuota } from '../types';
import { apiClient } from '../lib/api';
import { mockDb } from './mockDb';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AdminQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    role?: string;
}

export const adminService = {
  // Fetch Dashboard Stats
  async getStats(): Promise<ServiceResponse<AdminStats>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const users = mockDb.getAllUsers();
          return {
              success: true,
              data: {
                  totalUsers: users.length,
                  activeKeys: users.reduce((acc, u) => acc + u.apiKeys.filter(k => k.status === 'active').length, 0),
                  totalRequests: 154200, 
                  systemHealth: 100
              }
          };
      }
      return apiClient.get<AdminStats>('/admin/stats/overview');
  },

  // ... (Existing User methods kept same) ...
  async getUsers(params: AdminQueryParams = {}): Promise<ServiceResponse<PaginatedResponse<User>>> {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc', status, role } = params;

    if (CONFIG.USE_MOCK) {
        await delay(300);
        let allUsers = mockDb.getAllUsers();
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            allUsers = allUsers.filter(u => 
                (u.name && u.name.toLowerCase().includes(lowerSearch)) || 
                (u.email && u.email.toLowerCase().includes(lowerSearch))
            );
        }
        if (status) {
            allUsers = allUsers.filter(u => u.status === status);
        }
        if (role) {
            allUsers = allUsers.filter(u => u.role === role);
        }

        allUsers.sort((a: any, b: any) => {
            const valA = a[sortBy] || '';
            const valB = b[sortBy] || '';
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        const total = allUsers.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const items = allUsers.slice(start, end);
        
        return { 
            success: true, 
            data: { items, total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortOrder && { order: sortOrder }),
        ...(status && { status }),
        ...(role && { role })
    });

    try {
        const res = await apiClient.get<any>(`/admin/users?${query.toString()}`);
        if (res.success && res.data) {
            let items: User[] = [];
            let total = 0;
            if (res.data.items && Array.isArray(res.data.items)) {
                items = res.data.items;
                total = res.data.meta?.total || items.length;
            } else if (Array.isArray(res.data)) {
                items = res.data;
                total = items.length;
            }
            return { 
                success: true, 
                data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } 
            };
        }
        return { success: false, error: res.error || "Failed to fetch users" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
  },

  // NEW: Update User (Platform Admin)
  async updateUser(userId: string, data: { role?: 'admin' | 'user', status?: 'active' | 'suspended', password?: string }): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          mockDb.updateUser(userId, data);
          return { success: true };
      }
      return apiClient.put<void>(`/admin/users/${userId}`, data);
  },

  async getOrganizations(params: AdminQueryParams = {}): Promise<ServiceResponse<PaginatedResponse<Organization>>> {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = params;

    if (CONFIG.USE_MOCK) {
        await delay(300);
        let allOrgs = mockDb.getAllOrganizations();

        if (search) {
            const lowerSearch = search.toLowerCase();
            allOrgs = allOrgs.filter(o => o.name.toLowerCase().includes(lowerSearch));
        }

        const total = allOrgs.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const items = allOrgs.slice(start, end);

        return { 
            success: true, 
            data: { items, total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
        ...(sortBy && { sort_by: sortBy }),
        ...(sortOrder && { order: sortOrder })
    });

    try {
        const res = await apiClient.get<any>(`/admin/organizations?${query.toString()}`);
        if (res.success && res.data) {
            let items: Organization[] = [];
            let total = 0;
            if (res.data.items && Array.isArray(res.data.items)) {
                items = res.data.items;
                total = res.data.meta?.total || items.length;
            } else if (Array.isArray(res.data)) {
                 items = res.data;
                 total = items.length;
            }
            return { 
                success: true, 
                data: { items, total, page, limit, totalPages: Math.ceil(total / limit) }
            };
        }
        return { success: false, error: res.error || "Failed to fetch organizations" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
  },

  async getAuditLogs(params: any = {}): Promise<ServiceResponse<PaginatedResponse<AuditLog>>> {
      const { page = 1, limit = 20, action } = params;
      if (CONFIG.USE_MOCK) {
        await delay(300);
        let allLogs = mockDb.getAuditLogs();
        if (action && action !== 'all') allLogs = allLogs.filter(l => l.action === action);
        const total = allLogs.length;
        const start = (page - 1) * limit;
        // Fix: Ensure items is always an array
        return { success: true, data: { items: allLogs.slice(start, start + limit) || [], total, page, limit, totalPages: Math.ceil(total/limit) } };
      }
      return apiClient.get<PaginatedResponse<AuditLog>>(`/admin/audit-logs`);
  },

  // --- NEW: Plan Management ---
  async getPlans(): Promise<ServiceResponse<Plan[]>> {
      if (CONFIG.USE_MOCK) {
          await delay(300);
          // Return array from MOCK_PLANS object
          const plans = Object.entries(mockDb.getPlans()).map(([id, p]) => ({ id, ...p }));
          return { success: true, data: plans };
      }
      return apiClient.get<Plan[]>('/admin/plans');
  },

  async createPlan(plan: Plan): Promise<ServiceResponse<Plan>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          return { success: true, data: plan };
      }
      return apiClient.post<Plan>('/admin/plans', plan);
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<ServiceResponse<Plan>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          // Mock update logic
          return { success: true, data: { id, ...data } as Plan };
      }
      return apiClient.put<Plan>(`/admin/plans/${id}`, data);
  },

  async deletePlan(id: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          return { success: true };
      }
      return apiClient.delete<void>(`/admin/plans/${id}`);
  },

  // --- NEW: Quota Management ---
  
  // 1. Fetch Quotas for Org
  async getOrgQuotas(orgId: string): Promise<ServiceResponse<OrgQuota>> {
      if (CONFIG.USE_MOCK) {
          await delay(300);
          const org = mockDb.getAllOrganizations().find(o => o.id === orgId);
          return { success: true, data: org?.quotas || {} };
      }
      return apiClient.get<OrgQuota>(`/admin/organizations/${orgId}/quotas`);
  },

  // 2. Adjust Quota (Manual Override)
  async adjustOrgQuota(orgId: string, serviceType: string, adjustment: number): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(500);
          const orgs = mockDb.getAllOrganizations();
          const org = orgs.find(o => o.id === orgId);
          if (org && org.quotas && org.quotas[serviceType]) {
              org.quotas[serviceType]!.limit += adjustment;
              org.quotas[serviceType]!.remaining += adjustment;
              mockDb.logAction(orgId, 'admin', 'System Admin', 'quota.adjust', `Adjusted ${serviceType} by ${adjustment}`);
              return { success: true };
          }
          return { success: false, error: "Organization or service not found" };
      }
      return apiClient.post<void>(`/admin/organizations/${orgId}/quotas/adjust`, { service_type: serviceType, adjustment });
  },

  // 3. NEW: Update Organization Plan (Trigger Quota Reset)
  async updateOrgPlan(orgId: string, planId: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(600);
          const org = mockDb.getAllOrganizations().find(o => o.id === orgId);
          const plans = mockDb.getPlans();
          const newPlan = plans[planId];
          
          if (org && newPlan) {
              org.plan = newPlan;
              // Reset quotas based on new plan (Simple mock logic)
              if (newPlan.quotaConfig) {
                  const newQuotas: OrgQuota = {};
                  for (const [key, conf] of Object.entries(newPlan.quotaConfig)) {
                      newQuotas[key] = {
                          limit: conf.limit,
                          used: 0, // Reset usage on plan change (simplified)
                          remaining: conf.limit,
                          resetAt: null
                      };
                  }
                  org.quotas = newQuotas;
              }
              mockDb.logAction(orgId, 'admin', 'System Admin', 'org.plan_update', `Changed plan to ${newPlan.name}`);
              return { success: true };
          }
          return { success: false, error: "Org or Plan not found" };
      }
      return apiClient.put<void>(`/admin/organizations/${orgId}/plan`, { plan_id: planId });
  },

  // --- Role Management ---
  async getRoles(): Promise<ServiceResponse<RoleDefinition[]>> {
      if (CONFIG.USE_MOCK) {
          await delay(200);
          return { success: true, data: mockDb.getRoles() };
      }
      return apiClient.get<RoleDefinition[]>('/meta/roles');
  },

  async getPermissions(): Promise<ServiceResponse<PermissionDefinition[]>> {
      if (CONFIG.USE_MOCK) {
          await delay(200);
          return { success: true, data: mockDb.getPermissions() };
      }
      return apiClient.get<PermissionDefinition[]>('/meta/permissions');
  },

  async createPermission(perm: PermissionDefinition): Promise<ServiceResponse<PermissionDefinition>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          mockDb.addPermission(perm);
          return { success: true, data: perm };
      }
      return apiClient.post<PermissionDefinition>('/meta/permissions', perm);
  },

  async deletePermission(id: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          mockDb.deletePermission(id);
          return { success: true };
      }
      return apiClient.delete<void>(`/meta/permissions/${id}`);
  },

  async createRole(role: Partial<RoleDefinition>): Promise<ServiceResponse<RoleDefinition>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const newRole: RoleDefinition = {
              id: role.name?.toLowerCase().replace(/\s+/g, '_') || 'new_role',
              name: role.name || 'New Role',
              description: role.description || '',
              permissions: role.permissions || [],
              isSystem: false
          };
          return { success: true, data: mockDb.createRole(newRole) };
      }
      return apiClient.post<RoleDefinition>('/meta/roles', role);
  },

  async updateRole(id: string, updates: Partial<RoleDefinition>): Promise<ServiceResponse<RoleDefinition>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const updated = mockDb.updateRole(id, updates);
          if (updated) return { success: true, data: updated };
          return { success: false, error: "Role not found or system role" };
      }
      return apiClient.put<RoleDefinition>(`/meta/roles/${id}`, updates);
  },

  async deleteRole(id: string): Promise<ServiceResponse<void>> {
      if (CONFIG.USE_MOCK) {
          await delay(400);
          const success = mockDb.deleteRole(id);
          if (success) return { success: true };
          return { success: false, error: "Cannot delete role (System role or active assignments)" };
      }
      return apiClient.delete<void>(`/meta/roles/${id}`);
  },

  async getAuditLogActions(): Promise<ServiceResponse<string[]>> {
      return { success: true, data: ['login', 'update_plan', 'quota.adjust'] };
  },

  async exportOrgAuditLogs(): Promise<ServiceResponse<Blob>> {
      return { success: true, data: new Blob([]) };
  }
};
