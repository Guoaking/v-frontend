
import { ServiceResponse, Member, Invitation, OrgRole, RoleDefinition, Notification, Plan, Invoice, UsageSummary, OrgQuota, Organization } from '../types';
import { mockDb } from './mockDb';
import { apiClient } from '../lib/api';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to map backend invitation (handles PascalCase from Go)
const mapInvitation = (i: any): Invitation => ({
    id: i.id || i.ID || '',
    email: i.email || i.Email || '',
    role: i.role || i.Role || 'viewer',
    organizationId: i.organization_id || i.OrganizationID || '',
    organizationName: i.organization_name || i.OrganizationName || '',
    inviterName: i.inviter_name || i.InviterName || 'System',
    status: (i.status || i.Status || 'pending').toLowerCase() as any,
    sentAt: i.sent_at || i.SentAt || '',
    expiresAt: i.expires_at || i.ExpiresAt || ''
});

export const orgService = {
    async getMembers(): Promise<ServiceResponse<Member[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const freshUser = mockDb.getUserById(user.id);
            const members = freshUser?.organization?.members || [];
            return { success: true, data: members };
        }
        
        const res = await apiClient.get<{ items: any[], total: number }>('/orgs/members');
        if (res.success && res.data && Array.isArray(res.data.items)) {
            const mappedMembers: Member[] = res.data.items.map(m => ({
                id: m.id || m.ID,
                userId: m.userId || m.UserID,
                name: m.name || m.Name,
                email: m.email || m.Email,
                role: m.role || m.Role,
                avatar: m.avatar || m.Avatar,
                status: (m.status || m.Status || 'active').toLowerCase() as any,
                joinedAt: m.joinedAt || m.JoinedAt,
                lastActive: m.last_active_at || m.LastActiveAt || m.lastActive
            }));
            return { success: true, data: mappedMembers };
        }
        return { success: false, error: res.error || "Failed to fetch members" };
    },

    async getInvitations(): Promise<ServiceResponse<Invitation[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const orgId = user.organization?.id;
            if (!orgId) return { success: true, data: [] };
            const invites = mockDb.getInvitationsByOrg(orgId);
            return { success: true, data: invites };
        }
        const res = await apiClient.get<any[]>('/orgs/invitations');
        if (res.success && res.data) {
            return { success: true, data: res.data.map(mapInvitation) };
        }
        return res;
    },

    async getUserInvitations(): Promise<ServiceResponse<Invitation[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(300);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const invites = mockDb.getInvitationsByUserEmail(user.email);
            return { success: true, data: invites };
        }
        const res = await apiClient.get<any[]>('/users/me/invitations');
        if (res.success && res.data) {
            return { success: true, data: res.data.map(mapInvitation) };
        }
        return res;
    },

    async getAvailableRoles(): Promise<ServiceResponse<RoleDefinition[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(200);
            return { success: true, data: mockDb.getRoles().filter(r => !r.isSystem || r.id !== 'owner') };
        }
        return apiClient.get<RoleDefinition[]>('/meta/roles');
    },

    async inviteMember(userId: string, email: string, role: OrgRole): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            try {
                mockDb.createInvitation(userId, email, role);
                return { success: true };
            } catch (e: any) {
                return { success: false, error: e.message };
            }
        } else {
            return apiClient.post<void>('/orgs/invitations', { email, role });
        }
    },

    async cancelInvitation(userId: string, invitationId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            mockDb.cancelInvitation(userId, invitationId);
            return { success: true };
        }
        return apiClient.delete<void>(`/orgs/invitations/${invitationId}`);
    },

    async acceptInvitation(userId: string, invitationId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            try {
                const success = mockDb.acceptInvitation(userId, invitationId);
                if (success) return { success: true };
                return { success: false, error: "Failed to accept invitation" };
            } catch (e: any) {
                return { success: false, error: e.message || "Failed to accept" };
            }
        }
        return apiClient.post<void>(`/users/me/invitations/${invitationId}/accept`);
    },

    async declineInvitation(userId: string, invitationId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const success = mockDb.declineInvitation(userId, invitationId);
            if (success) return { success: true };
            return { success: false, error: "Failed to decline invitation" };
        }
        return apiClient.post<void>(`/users/me/invitations/${invitationId}/decline`);
    },

    async updateMemberRole(userId: string, memberId: string, role: OrgRole): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const user = mockDb.getUserById(userId);
            if (user?.organization?.members) {
                const memberIndex = user.organization.members.findIndex(m => m.id === memberId);
                if (memberIndex !== -1) {
                    user.organization.members[memberIndex].role = role;
                    mockDb.updateUser(userId, { organization: user.organization });
                }
            }
            return { success: true };
        }
        return apiClient.patch<void>(`/orgs/members/${memberId}`, { role });
    },

    async updateMemberPassword(userId: string, memberId: string, newPassword: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            const user = mockDb.getUserById(userId);
            const targetMember = user?.organization?.members?.find(m => m.id === memberId);
            if (targetMember) {
                mockDb.updateUser(targetMember.userId, { password: newPassword });
            }
            return { success: true };
        }
        return apiClient.put<void>(`/orgs/members/${memberId}/password`, { password: newPassword });
    },

    async removeMember(userId: string, memberId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const user = mockDb.getUserById(userId);
            if (user?.organization?.members) {
                user.organization.members = user.organization.members.filter(m => m.id !== memberId);
                mockDb.updateUser(userId, { organization: user.organization });
            }
            return { success: true };
        }
        return apiClient.delete<void>(`/orgs/members/${memberId}`);
    },

    async toggleMemberStatus(userId: string, memberId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const user = mockDb.getUserById(userId);
            if (user?.organization?.members) {
                const member = user.organization.members.find(m => m.id === memberId);
                if (member) {
                    member.status = member.status === 'active' ? 'suspended' : 'active';
                    mockDb.updateUser(userId, { organization: user.organization });
                }
            }
            return { success: true };
        }
        return apiClient.post<void>(`/orgs/members/${memberId}/toggle-status`);
    },

    async toggleUserStatus(adminId: string, targetUserId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const target = mockDb.getUserById(targetUserId);
            if (target) {
                const newStatus = target.status === 'active' ? 'suspended' : 'active';
                mockDb.updateUser(targetUserId, { status: newStatus });
            }
            return { success: true };
        }
        return apiClient.post<void>(`/admin/users/${targetUserId}/toggle-status`);
    },

    async getBilling(): Promise<ServiceResponse<{ plan: Plan, invoices: Invoice[], usageSummary: UsageSummary }>> {
        if (CONFIG.USE_MOCK) {
            await delay(600);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const freshUser = mockDb.getUserById(user.id);
            
            const org = freshUser?.organization;
            if (!org) return { success: false, error: "No organization" };

            const invoices: Invoice[] = [
                { id: 'inv_2023_10', date: '2023-10-01', amount: org.plan.price, status: 'paid', pdfUrl: '#' },
                { id: 'inv_2023_09', date: '2023-09-01', amount: org.plan.price, status: 'paid', pdfUrl: '#' }
            ];

            return {
                success: true,
                data: {
                    plan: org.plan,
                    invoices,
                    usageSummary: org.usageSummary || { totalRequests: 0, limit: 1000, percentUsed: 0, period: 'current' }
                }
            };
        }
        return apiClient.get<{ plan: Plan, invoices: Invoice[], usageSummary: UsageSummary }>('/orgs/billing');
    },

    async updatePlan(userId: string, planId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(800);
            const user = mockDb.getUserById(userId);
            if (user?.organization) {
                const planName = planId === 'scale' ? 'Scale' : planId === 'growth' ? 'Growth' : 'Starter';
                const price = planId === 'scale' ? 999 : planId === 'growth' ? 299 : 0;
                const limit = planId === 'scale' ? 500000 : planId === 'growth' ? 50000 : 1000;
                
                user.organization.plan = {
                    id: planId,
                    name: planName,
                    price,
                    requestsLimit: limit,
                    features: []
                };
                mockDb.updateUser(userId, { organization: user.organization });
            }
            return { success: true };
        }
        return apiClient.put<void>('/orgs/billing/plan', { planId });
    },

    async getQuotaStatus(): Promise<ServiceResponse<OrgQuota>> {
        if (CONFIG.USE_MOCK) {
            await delay(300);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const freshUser = mockDb.getUserById(user.id);
            const quotas = freshUser?.organization?.quotas;
            
            if (quotas) return { success: true, data: quotas };
            return { 
                success: true, 
                data: {
                    ocr: { limit: 50, used: 12, remaining: 38, resetAt: null },
                    face: { limit: 100, used: 20, remaining: 80, resetAt: null }
                } 
            };
        }
        return apiClient.get<OrgQuota>('/console/usage/quota');
    },

    async getNotifications(userId: string): Promise<ServiceResponse<Notification[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(300);
            return { success: true, data: mockDb.getNotifications(userId) };
        }
        return apiClient.get<Notification[]>('/users/me/notifications');
    },

    async markNotificationRead(userId: string, notifId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            mockDb.markNotificationRead(userId, notifId);
            return { success: true };
        }
        return apiClient.put<void>(`/users/me/notifications/${notifId}/read`);
    },

    async createOrganization(name: string): Promise<ServiceResponse<Organization>> {
        if (CONFIG.USE_MOCK) {
            await delay(600);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            
            const mockOrg: Organization = {
                id: `org_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                billingEmail: user.email,
                plan: { id: 'starter', name: 'Starter', price: 0 },
                createdAt: new Date().toISOString(),
                members: [{
                    id: `mem_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: 'owner',
                    avatar: user.avatar,
                    status: 'active',
                    joinedAt: new Date().toISOString()
                }]
            };
            
            return { success: true, data: mockOrg };
        }
        return apiClient.post<Organization>('/api/v1/orgs', { name });
    },

    async updateOrganization(orgId: string, data: Partial<Organization>): Promise<ServiceResponse<Organization>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            return { success: true, data: { id: orgId, ...data } as Organization };
        }
        return apiClient.patch<Organization>(`/api/v1/orgs/${orgId}`, data);
    },

    async deleteOrganization(orgId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(800);
            return { success: true };
        }
        return apiClient.delete<void>(`/api/v1/orgs/${orgId}`);
    },

    async leaveOrganization(orgId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            return { success: true };
        }
        return apiClient.post<void>(`/api/v1/orgs/${orgId}/leave`);
    }
};
