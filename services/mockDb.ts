
// ... existing imports ...
import { 
    User, Organization, Member, ApiKey, ApiScope, Webhook, RequestLog, 
    RoleDefinition, PermissionDefinition, Invitation, Notification, OrgRole, AuditLog, OrgQuota, Plan, ApiKeyWithSecret, OAuthClient, UserOrg 
} from '../types';

// ... (Keep existing generateApiKey, MOCK_PLANS, MOCK_ROLES, MOCK_PERMISSIONS) ...
export const generateApiKey = (name: string, scopes: ApiScope[], creator: { id: string, name: string, avatar: string }, organizationId: string): ApiKeyWithSecret => {
    return {
        id: `key_${Math.random().toString(36).substr(2, 9)}`,
        name,
        prefix: `pk_test_${Math.random().toString(36).substr(2, 4)}`,
        secret: `sk_live_${Math.random().toString(36).substr(2, 24)}`, // Only returned once
        status: 'active',
        scopes,
        organizationId,
        createdBy: { userId: creator.id, name: creator.name, avatar: creator.avatar },
        createdAt: new Date().toISOString(),
        stats: { totalRequests24h: 0, successRate: 100 }
    };
};

// ... (Preserve MOCK_PLANS, MOCK_ROLES, MOCK_PERMISSIONS) ...
const MOCK_PLANS: Record<string, Plan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 0,
        currency: 'USD',
        requestsLimit: 0, 
        features: {}, 
        quotaConfig: {
            ocr: { limit: 50, period: 'lifetime' }, // Fallback generic
            id_card_ocr: { limit: 50, period: 'lifetime' },
            driver_license_ocr: { limit: 20, period: 'lifetime' },
            vehicle_license_ocr: { limit: 20, period: 'lifetime' },
            bank_card_ocr: { limit: 20, period: 'lifetime' },
            business_license_ocr: { limit: 20, period: 'lifetime' },
            general_ocr: { limit: 20, period: 'lifetime' },
            face: { limit: 100, period: 'lifetime' }
        },
        isActive: true,
        updatedAt: new Date().toISOString()
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        price: 299,
        currency: 'USD',
        requestsLimit: 0,
        features: {},
        quotaConfig: {
            ocr: { limit: 5000, period: 'monthly' },
            id_card_ocr: { limit: 5000, period: 'monthly' },
            driver_license_ocr: { limit: 1000, period: 'monthly' },
            vehicle_license_ocr: { limit: 1000, period: 'monthly' },
            bank_card_ocr: { limit: 1000, period: 'monthly' },
            business_license_ocr: { limit: 1000, period: 'monthly' },
            general_ocr: { limit: 2000, period: 'monthly' },
            face: { limit: 10000, period: 'monthly' }
        },
        isActive: true,
        updatedAt: new Date().toISOString()
    },
    scale: {
        id: 'scale',
        name: 'Scale',
        price: 999,
        currency: 'USD',
        requestsLimit: 0,
        features: {},
        quotaConfig: {
            ocr: { limit: 100000, period: 'monthly' },
            id_card_ocr: { limit: 100000, period: 'monthly' },
            driver_license_ocr: { limit: 20000, period: 'monthly' },
            vehicle_license_ocr: { limit: 20000, period: 'monthly' },
            bank_card_ocr: { limit: 20000, period: 'monthly' },
            business_license_ocr: { limit: 20000, period: 'monthly' },
            general_ocr: { limit: 50000, period: 'monthly' },
            face: { limit: 200000, period: 'monthly' }
        },
        isActive: true,
        updatedAt: new Date().toISOString()
    }
};

const MOCK_ROLES: RoleDefinition[] = [
    { id: 'owner', name: 'Owner', description: 'Full access to organization', isSystem: true, permissions: ['*'] },
    { id: 'admin', name: 'Admin', description: 'Can manage members and billing', isSystem: true, permissions: ['keys.*', 'billing.*', 'team.*', 'logs.read', 'oauth.*'] },
    { id: 'developer', name: 'Developer', description: 'Can manage API keys and integration', isSystem: true, permissions: ['keys.*', 'logs.read', 'webhooks.*', 'oauth.*'] },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access', isSystem: true, permissions: ['keys.read', 'logs.read', 'billing.read', 'team.read', 'oauth.read'] },
];

const MOCK_PERMISSIONS: PermissionDefinition[] = [
    { id: 'keys.read', name: 'View API Keys', category: 'Credentials', description: 'View list of API keys and their stats' },
    { id: 'keys.write', name: 'Manage API Keys', category: 'Credentials', description: 'Create, update, and revoke API keys' },
    { id: 'oauth.read', name: 'View OAuth Apps', category: 'Integration', description: 'View OAuth applications list' },
    { id: 'oauth.write', name: 'Manage OAuth Apps', category: 'Integration', description: 'Create and manage OAuth applications' },
    { id: 'billing.read', name: 'View Billing', category: 'Billing', description: 'View invoices and usage' },
    { id: 'billing.write', name: 'Manage Billing', category: 'Billing', description: 'Update payment methods and plans' },
    { id: 'team.read', name: 'View Team', category: 'Team', description: 'View team members list' },
    { id: 'team.write', name: 'Manage Team', category: 'Team', description: 'Invite and remove members' },
    { id: 'webhooks.read', name: 'View Webhooks', category: 'Integration', description: 'View configured webhooks' },
    { id: 'webhooks.write', name: 'Manage Webhooks', category: 'Integration', description: 'Configure webhook endpoints' },
    { id: 'logs.read', name: 'View Logs', category: 'Monitoring', description: 'Access API request logs' },
    { id: 'org.audit', name: 'Audit Logs', category: 'Security', description: 'View organization audit logs' },
];

// ... MockDB Class ...
class MockDB {
    private users: User[] = [];
    private organizations: Organization[] = [];
    private invitations: Invitation[] = [];
    private auditLogs: AuditLog[] = [];

    constructor() {
        this.loadFromStorage();
        if (this.users.length === 0) {
            this.seedData();
        }
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') return;
        const storedUsers = localStorage.getItem('vl_mock_users');
        const storedOrgs = localStorage.getItem('vl_mock_orgs');
        const storedInvites = localStorage.getItem('vl_mock_invites');
        
        if (storedUsers) this.users = JSON.parse(storedUsers);
        if (storedOrgs) this.organizations = JSON.parse(storedOrgs);
        if (storedInvites) this.invitations = JSON.parse(storedInvites);
    }

    private saveToStorage() {
        if (typeof window === 'undefined') return;
        localStorage.setItem('vl_mock_users', JSON.stringify(this.users));
        localStorage.setItem('vl_mock_orgs', JSON.stringify(this.organizations));
        localStorage.setItem('vl_mock_invites', JSON.stringify(this.invitations));
    }

    private instantiateQuotasFromPlan(planId: string): OrgQuota {
        const plan = MOCK_PLANS[planId] || MOCK_PLANS['starter'];
        const config = plan.quotaConfig || {};
        const quotas: OrgQuota = {};
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        const resetAt = nextMonth.toISOString();

        for (const [service, rule] of Object.entries(config) as [string, any][]) {
            quotas[service] = {
                limit: rule.limit,
                used: 0,
                remaining: rule.limit,
                resetAt: rule.period === 'monthly' ? resetAt : null
            };
        }
        return quotas;
    }

    private seedData() {
        const orgId = 'org_demo_123';
        const ownerId = 'user_demo_owner';
        const planId = 'growth';
        const planTemplate = MOCK_PLANS[planId];
        
        const org: Organization = {
            id: orgId,
            name: 'Acme Corp',
            billingEmail: 'billing@acme.com',
            plan: planTemplate,
            members: [],
            usageSummary: {
                totalRequests: 12450,
                limit: 50000,
                percentUsed: 24.9,
                period: '2024-05'
            },
            quotas: this.instantiateQuotasFromPlan(planId),
            createdAt: new Date().toISOString()
        };
        
        const owner: User = {
            id: ownerId,
            name: 'Demo Owner',
            email: 'demo@verilocale.com',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
            company: 'Acme Corp',
            role: 'user',
            orgRole: 'owner',
            organization: org,
            currentOrgId: orgId,
            organizations: [{ id: orgId, name: org.name, role: 'owner' }],
            permissions: ['*'],
            apiKeys: [
                {
                    id: 'key_prod',
                    name: 'Production Server',
                    prefix: 'pk_live_8372',
                    secret: 'sk_live_demo_secret_key_12345',
                    status: 'active',
                    scopes: ['ocr:read', 'face:read'],
                    organizationId: orgId,
                    createdBy: { userId: ownerId, name: 'Demo Owner', avatar: '' },
                    createdAt: new Date().toISOString(),
                    stats: { totalRequests24h: 1205, successRate: 99.8 }
                } as ApiKeyWithSecret
            ],
            webhooks: [],
            oauthClients: [],
            status: 'active',
            notifications: []
        };

        const admin: User = {
            id: 'admin_user',
            name: 'System Admin',
            email: 'admin@verilocale.com',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
            role: 'admin',
            isPlatformAdmin: true,
            orgRole: 'owner', 
            // Added required organizations property to fix User interface compliance
            organizations: [],
            permissions: [],
            apiKeys: [],
            oauthClients: [],
            status: 'active',
            notifications: []
        };

        org.members = [{
            id: 'mem_1',
            userId: ownerId,
            name: owner.name,
            email: owner.email,
            role: 'owner',
            avatar: owner.avatar,
            status: 'active',
            joinedAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        }];

        this.users = [owner, admin];
        this.organizations = [org];
        this.saveToStorage();
    }

    // --- Helpers ---
    resolvePermissions(roleId: string): string[] {
        const role = MOCK_ROLES.find(r => r.id === roleId);
        return role ? role.permissions : [];
    }

    logAction(orgId: string, userId: string, userName: string, action: string, target: string) {
        const log: AuditLog = {
            id: `audit_${Date.now()}`,
            organizationId: orgId,
            userId,
            userName,
            action,
            target,
            ip: '127.0.0.1', 
            timestamp: new Date().toISOString(),
            status: 'success'
        };
        this.auditLogs.unshift(log); 
    }

    consumeQuota(userId: string, serviceType: string): { success: boolean; error?: string } {
        const user = this.getUserById(userId);
        if (!user || !user.organization) return { success: false, error: 'Organization not found' };

        const org = this.organizations.find(o => o.id === user.organization!.id);
        if (!org || !org.quotas) return { success: false, error: 'Quota config not found' };

        const quota = org.quotas[serviceType];
        if (!quota) {
             return { success: false, error: `Quota for ${serviceType} not defined` };
        }

        if (quota.remaining <= 0) {
            return { success: false, error: `Quota exceeded for ${serviceType}. Please upgrade your plan.` };
        }

        quota.used += 1;
        quota.remaining -= 1;

        if (org.usageSummary) {
            org.usageSummary.totalRequests += 1;
            org.usageSummary.percentUsed = (org.usageSummary.totalRequests / org.usageSummary.limit) * 100;
        }

        this.users.forEach(u => {
            if (u.currentOrgId === org.id) {
                u.organization = JSON.parse(JSON.stringify(org));
            }
        });

        this.saveToStorage();
        return { success: true };
    }

    getAllUsers() { return this.users; }
    getUserById(id: string) { return this.users.find(u => u.id === id); }
    getUserByEmail(email: string) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
    createUser(user: User) { this.users.push(user); this.saveToStorage(); }

    createNewUserObject(name: string, email: string): User {
        const id = `u_${Math.random().toString(36).substr(2, 8)}`;
        const orgId = `org_${id}`;
        
        const planId = 'starter';
        const planTemplate = MOCK_PLANS[planId];
        const initialQuotas = this.instantiateQuotasFromPlan(planId);

        const org: Organization = {
            id: orgId,
            name: `${name}'s Org`,
            billingEmail: email,
            plan: planTemplate,
            members: [],
            quotas: initialQuotas,
            createdAt: new Date().toISOString()
        };

        const user: User = {
            id,
            name,
            email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            company: '',
            role: 'user',
            orgRole: 'owner',
            permissions: ['*'],
            organization: org,
            currentOrgId: orgId,
            organizations: [{ id: orgId, name: org.name, role: 'owner' }],
            apiKeys: [
               generateApiKey('Default Demo Key', ['ocr:read', 'face:read', 'liveness:read'], { id, name, avatar: '' }, orgId)
            ],
            webhooks: [],
            oauthClients: [],
            status: 'active',
            notifications: []
        };

        org.members = [{
            id: `mem_${id}`,
            userId: id,
            name,
            email,
            role: 'owner',
            avatar: user.avatar,
            status: 'active',
            joinedAt: new Date().toISOString()
        }];
        
        this.organizations.push(org);
        return user;
    }

    updateUser(id: string, updates: Partial<User>) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            this.saveToStorage();
            return this.users[index];
        }
        return null;
    }

    getAllOrganizations() { return this.organizations; }

    createInvitation(inviterId: string, email: string, role: OrgRole): Invitation {
        const inviter = this.getUserById(inviterId);
        if (!inviter || !inviter.organization) throw new Error("Inviter not valid");

        const invite: Invitation = {
            id: `inv_${Math.random().toString(36).substr(2, 8)}`,
            email,
            role,
            organizationId: inviter.organization.id,
            organizationName: inviter.organization.name,
            inviterName: inviter.name,
            status: 'pending',
            sentAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };

        this.invitations.unshift(invite);
        this.logAction(inviter.organization.id, inviter.id, inviter.name, 'member.invite', email);
        
        const existingUser = this.getUserByEmail(email);
        if (existingUser) {
            const notif: Notification = {
                id: `notif_${Date.now()}`,
                type: 'invitation',
                title: 'Team Invitation',
                message: `${inviter.name} invited you to join ${inviter.organization.name} as ${role}. Expires in 3 days.`,
                data: { invitationId: invite.id },
                read: false,
                createdAt: new Date().toISOString()
            };
            this.addNotification(existingUser.id, notif);
        }

        this.saveToStorage();
        return invite;
    }

    getInvitationsByOrg(orgId: string): Invitation[] {
        return this.invitations.filter(i => i.organizationId === orgId && i.status === 'pending');
    }

    getInvitationsByUserEmail(email: string): Invitation[] {
        const now = new Date();
        return this.invitations.filter(i => 
            i.email.toLowerCase() === email.toLowerCase() && 
            i.status === 'pending' &&
            new Date(i.expiresAt) > now
        );
    }

    cancelInvitation(inviterId: string, invitationId: string) {
        const index = this.invitations.findIndex(i => i.id === invitationId);
        if (index !== -1) {
            this.invitations.splice(index, 1);
            const inviter = this.getUserById(inviterId);
            if (inviter) {
                this.logAction(inviter.organization?.id || '', inviterId, inviter.name, 'member.invite_cancel', invitationId);
            }
            this.saveToStorage();
        }
    }

    acceptInvitation(userId: string, invitationId: string): boolean {
        const user = this.getUserById(userId);
        const invite = this.invitations.find(i => i.id === invitationId);
        
        if (!user || !invite) return false;

        if (new Date(invite.expiresAt) < new Date()) {
            invite.status = 'expired';
            this.saveToStorage();
            throw new Error("Invitation has expired");
        }

        if (invite.status !== 'pending') return false;

        const targetOrg = this.organizations.find(o => o.id === invite.organizationId);
        if (!targetOrg) return false;

        const newMember: Member = {
            id: `mem_${Date.now()}`,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: invite.role,
            avatar: user.avatar,
            status: 'active',
            joinedAt: new Date().toISOString()
        };

        targetOrg.members = [...(targetOrg.members || []), newMember];

        const userOrgEntry: UserOrg = {
            id: targetOrg.id,
            name: targetOrg.name,
            role: invite.role
        };
        if (!user.organizations) user.organizations = [];
        if (!user.organizations.find(o => o.id === targetOrg.id)) {
            user.organizations.push(userOrgEntry);
        }

        user.organization = JSON.parse(JSON.stringify(targetOrg)); 
        user.currentOrgId = targetOrg.id;
        user.orgRole = invite.role;
        user.permissions = this.resolvePermissions(invite.role);
        
        invite.status = 'accepted';
        
        this.logAction(targetOrg.id, user.id, user.name, 'member.join', 'Invitation Accepted');
        
        this.saveToStorage();
        return true;
    }

    declineInvitation(userId: string, invitationId: string): boolean {
        const invite = this.invitations.find(i => i.id === invitationId);
        if (!invite || invite.status !== 'pending') return false;

        invite.status = 'expired'; 
        this.saveToStorage();
        return true;
    }

    getNotifications(userId: string): Notification[] {
        const user = this.getUserById(userId);
        return user ? (user.notifications || []) : [];
    }

    addNotification(userId: string, notif: Notification) {
        const user = this.getUserById(userId);
        if (user) {
            user.notifications = [notif, ...(user.notifications || [])];
            this.updateUser(userId, { notifications: user.notifications });
        }
    }

    markNotificationRead(userId: string, notifId: string) {
        const user = this.getUserById(userId);
        if (user && user.notifications) {
            const updated = user.notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
            this.updateUser(userId, { notifications: updated });
        }
    }

    getOrgAuditLogs(orgId: string) { return this.auditLogs.filter(l => l.organizationId === orgId); }
    getAuditLogs() { return this.auditLogs; }

    getRoles() { return MOCK_ROLES; }
    getPermissions() { return MOCK_PERMISSIONS; }
    addPermission(perm: PermissionDefinition) {
        const idx = MOCK_PERMISSIONS.findIndex(p => p.id === perm.id);
        if (idx !== -1) return;
        MOCK_PERMISSIONS.push(perm);
    }
    deletePermission(id: string) {
        const idx = MOCK_PERMISSIONS.findIndex(p => p.id === id);
        if (idx !== -1) {
            MOCK_PERMISSIONS.splice(idx, 1);
        }
    }
    getPlans() { return MOCK_PLANS; } 
    createRole(role: RoleDefinition): RoleDefinition { MOCK_ROLES.push(role); return role; }
    updateRole(id: string, updates: Partial<RoleDefinition>) {
        const idx = MOCK_ROLES.findIndex(r => r.id === id);
        if (idx !== -1 && !MOCK_ROLES[idx].isSystem) {
            MOCK_ROLES[idx] = { ...MOCK_ROLES[idx], ...updates };
            return MOCK_ROLES[idx];
        }
        return null;
    }
    deleteRole(id: string) {
        const idx = MOCK_ROLES.findIndex(r => r.id === id);
        if (idx !== -1 && !MOCK_ROLES[idx].isSystem) {
            MOCK_ROLES.splice(idx, 1);
            return true;
        }
        return false;
    }
    
    getRequestLogsForUser(userId: string, keyId?: string): RequestLog[] {
        const logs: RequestLog[] = [];
        const methods = ['GET', 'POST'];
        const paths = ['/kyc/ocr', '/kyc/face/verify', '/kyc/liveness'];
        const now = Date.now();
        
        for(let i=0; i<50; i++) {
             logs.push({
                 id: `req_${i}`,
                 method: methods[Math.floor(Math.random()*methods.length)] as any,
                 path: paths[Math.floor(Math.random()*paths.length)],
                 statusCode: Math.random() > 0.1 ? 200 : 400,
                 latency: Math.floor(Math.random() * 500) + 50,
                 timestamp: new Date(now - i * 3600000).toISOString(),
                 clientIp: '127.0.0.1',
                 keyName: 'Mock Key',
                 keyOwner: 'Demo User'
             });
        }
        return logs;
    }

    registerOAuthClient(userId: string, data: { name: string, description?: string, redirect_uri: string, scopes: string }): OAuthClient {
        const user = this.getUserById(userId);
        if (!user) throw new Error("User not found");

        const client: OAuthClient = {
            client_id: `client_${Math.random().toString(36).substr(2, 12)}`,
            client_secret: `sec_${Math.random().toString(36).substr(2, 32)}`, 
            name: data.name,
            description: data.description,
            redirect_uri: data.redirect_uri,
            scopes: data.scopes,
            status: 'active',
            created_at: new Date().toISOString()
        };

        const storedClient = { ...client };
        delete storedClient.client_secret;

        const currentClients = user.oauthClients || [];
        this.updateUser(userId, { oauthClients: [...currentClients, storedClient as OAuthClient] });
        
        this.logAction(user.currentOrgId || user.organization?.id || 'org_unknown', userId, user.name, 'oauth.create', `Created OAuth Client: ${data.name}`);

        return client; 
    }

    revealOAuthSecret(userId: string, clientId: string): string {
        const user = this.getUserById(userId);
        const client = user?.oauthClients?.find(c => c.client_id === clientId);
        if (!client) throw new Error("Client not found");
        
        const mockSecret = `sec_revealed_${Math.random().toString(36).substr(2, 24)}`;
        this.logAction(user?.organization?.id || '', userId, user?.name || 'User', 'oauth.reveal', `Revealed secret for ${clientId}`);
        return mockSecret;
    }

    resetOAuthSecret(userId: string, clientId: string): string {
        const user = this.getUserById(userId);
        const client = user?.oauthClients?.find(c => c.client_id === clientId);
        if (!client) throw new Error("Client not found");

        const newSecret = `sec_reset_${Math.random().toString(36).substr(2, 24)}`;
        this.logAction(user?.organization?.id || '', userId, user?.name || 'User', 'oauth.reset', `Reset secret for ${clientId}`);
        return newSecret;
    }

    deleteOAuthClient(userId: string, clientId: string) {
        const user = this.getUserById(userId);
        if (!user) return;
        const updated = (user.oauthClients || []).filter(c => c.client_id !== clientId);
        this.updateUser(userId, { oauthClients: updated });
        
        this.logAction(user.currentOrgId || user.organization?.id || 'org_unknown', userId, user.name, 'oauth.delete', `Deleted OAuth Client: ${clientId}`);
    }
}

export const mockDb = new MockDB();
