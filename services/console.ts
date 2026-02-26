
import { ServiceResponse, RequestLog, PaginatedResponse,DetailedUsageStats, UsageMetric, UsageBreakdownItem,AuditLog } from '../types';
import { apiClient } from '../lib/api';
import { mockDb } from './mockDb';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LogQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    keyId?: string; // New: Filter by specific API Key
}

export interface AuditLogQueryParams {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
}

export const consoleService = {
    async getRequestLogs(params: LogQueryParams = {}): Promise<ServiceResponse<PaginatedResponse<RequestLog>>> {
        const { page = 1, limit = 20, search = '', status, startDate, endDate, keyId } = params;

        if (CONFIG.USE_MOCK) {
            await delay(400);
            // Get current user from local storage to simulate session context in mock
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            
            // Pass keyId to mockDb to filter
            let logs = mockDb.getRequestLogsForUser(user.id, keyId);

            if (search) {
                logs = logs.filter(l => l.path.includes(search) || l.method.includes(search));
            }
            if (status && status !== 'all') {
                if (status === 'success') logs = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300);
                if (status === 'error') logs = logs.filter(l => l.statusCode >= 400);
            }

            // Mock Sorting desc
            logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const total = logs.length;
            const start = (page - 1) * limit;
            const items = logs.slice(start, start + limit);

            return {
                success: true,
                data: { items, total, page, limit, totalPages: Math.ceil(total / limit) }
            };
        }

        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && status !== 'all' && { status }),
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
            ...(keyId && { key_id: keyId })
        });

        return apiClient.get<PaginatedResponse<RequestLog>>(`/console/logs?${query.toString()}`);
    },

    async getUsageStats(period: '30d' | '7d' = '30d', scope: 'org' | 'personal' = 'org'): Promise<ServiceResponse<UsageMetric[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(300);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            // In Mock mode, we generate random daily stats
            // In real app, this endpoint is /orgs/{id}/usage/daily
            const user = JSON.parse(userStr);
            const data: UsageMetric[] = [];
            const today = new Date();
            const days = period === '30d' ? 30 : 7;
            
            // Mock difference based on scope
            const multiplier = scope === 'org' ? 1 : 0.2; // Personal usage is lower

            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                data.push({
                    date: d.toISOString().split('T')[0],
                    requests: Math.floor((Math.random() * 500 + 50) * multiplier),
                    errors: Math.floor((Math.random() * 20) * multiplier),
                });
            }
            return { success: true, data: data };
        }
        
        return apiClient.get<UsageMetric[]>(`/orgs/usage/daily?period=${period}&scope=${scope}`);
    },

    // New: Detailed Usage Stats for Dashboard
    async getDetailedUsageStats(period: '30d' | '7d' = '30d'): Promise<ServiceResponse<DetailedUsageStats>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            
            // Generate Timeline
            const timeline: UsageMetric[] = [];
            const today = new Date();
            const days = period === '30d' ? 30 : 7;
            let totalRequests = 0;
            let totalErrors = 0;

            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const reqs = Math.floor(Math.random() * 800 + 100);
                const errs = Math.floor(reqs * (Math.random() * 0.05)); // 0-5% error rate
                
                // Mock Service Breakdown per day
                const ocr = Math.floor(reqs * 0.6);
                const face = Math.floor(reqs * 0.3);
                const liveness = reqs - ocr - face;

                totalRequests += reqs;
                totalErrors += errs;

                timeline.push({
                    date: d.toISOString().split('T')[0],
                    requests: reqs,
                    errors: errs,
                    services: { ocr, face, liveness }
                });
            }

            // Mock Aggregates
            const byService: UsageBreakdownItem[] = [
                { id: 'ocr', label: 'OCR', count: Math.floor(totalRequests * 0.6), percentage: 60, trend: 5.2 },
                { id: 'face', label: 'Face Verification', count: Math.floor(totalRequests * 0.3), percentage: 30, trend: 1.8 },
                { id: 'liveness', label: 'Liveness Detection', count: Math.floor(totalRequests * 0.1), percentage: 10, trend: -0.5 },
            ];

            const byEndpoint: UsageBreakdownItem[] = [
                { id: '/kyc/ocr/id-card', label: 'ID Card OCR', count: Math.floor(totalRequests * 0.4), percentage: 40 },
                { id: '/kyc/face/compare', label: 'Face Compare', count: Math.floor(totalRequests * 0.25), percentage: 25 },
                { id: '/kyc/ocr/driver-license', label: 'Driver License OCR', count: Math.floor(totalRequests * 0.2), percentage: 20 },
                { id: '/kyc/liveness', label: 'Liveness Check', count: Math.floor(totalRequests * 0.1), percentage: 10 },
                { id: '/kyc/other', label: 'Other', count: Math.floor(totalRequests * 0.05), percentage: 5 },
            ];

            const byKey: UsageBreakdownItem[] = user.apiKeys?.map((k: any) => ({
                id: k.id,
                label: k.name,
                count: Math.floor(totalRequests / (user.apiKeys.length || 1)), // Distribute evenly for mock
                percentage: Math.floor(100 / (user.apiKeys.length || 1))
            })) || [];

            // Mock Quota Status
            const limit = user.organization?.quotas?.['global']?.limit || 50000;
            const used = totalRequests; // Just using the period total as 'used' for simplicity in mock
            const remaining = Math.max(0, limit - used);
            const percentUsed = (used / limit) * 100;
            
            // Forecast: Simple linear projection
            const avgDaily = totalRequests / days;
            const daysLeft = avgDaily > 0 ? Math.floor(remaining / avgDaily) : 999;
            const forecastDate = new Date();
            forecastDate.setDate(forecastDate.getDate() + daysLeft);

            return {
                success: true,
                data: {
                    totalRequests,
                    totalErrors,
                    period,
                    timeline,
                    byService,
                    byEndpoint,
                    byKey,
                    quotaStatus: {
                        used,
                        limit,
                        remaining,
                        percentUsed,
                        resetDate: user.organization?.quotas?.['global']?.resetAt || null,
                        forecastDepletionDate: daysLeft < 90 ? forecastDate.toISOString().split('T')[0] : undefined
                    }
                }
            };
        }

        return apiClient.get<DetailedUsageStats>(`/orgs/usage/detailed?period=${period}`);
    },

    // Updated: Fetch Organization Audit Logs with backend mapping
    async getOrgAuditLogs(params: AuditLogQueryParams = {}): Promise<ServiceResponse<PaginatedResponse<AuditLog>>> {
        const { page = 1, limit = 15, action, startDate, endDate } = params;

        if (CONFIG.USE_MOCK) {
            await delay(400);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            
            let logs = mockDb.getOrgAuditLogs(user.organization?.id || 'org_1');
            
            if (action && action !== 'all') {
                logs = logs.filter(l => l.action === action);
            }
            // Mock date filter logic omitted for brevity in mock mode

            const total = logs.length;
            const start = (page - 1) * limit;
            const items = logs.slice(start, start + limit);

            return {
                success: true,
                data: { items, total, page, limit, totalPages: Math.ceil(total / limit) }
            };
        }

        const query = new URLSearchParams({
            page: page.toString(),
            page_size: limit.toString(),
            ...(action && action !== 'all' && { action }),
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
        });

        // The response data structure is { items: [], pagination: {} }
        const res = await apiClient.get<{ items: any[], pagination: any }>(`/orgs/audit-logs?${query.toString()}`);
        
        if (res.success && res.data) {
            // Map backend fields to frontend types
            const backendItems = res.data.items || [];
            const pagination = res.data.pagination || {};

            const items: AuditLog[] = backendItems.map((log: any) => ({
                id: String(log.id),
                organizationId: log.org_id,
                userId: log.user_id,
                userName: log.user_name || log.user_id, // Fallback if name is missing
                action: log.action,
                target: log.message || log.resource || '', // Prefer message as it's more descriptive
                ip: log.ip,
                timestamp: log.created_at,
                status: log.status
            }));

            return {
                success: true,
                data: { 
                    items, 
                    total: pagination.total || 0, 
                    page: pagination.page || 1, 
                    limit: pagination.page_size || 15, 
                    totalPages: pagination.total_page || 1 
                }
            };
        }
        return { success: false, error: res.error || "Failed to fetch audit logs" };
    },

    // New: Fetch Available Audit Log Actions
    async getAuditLogActions(): Promise<ServiceResponse<string[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(200);
            return {
                success: true,
                data: [
                    'login',
                    'create_key',
                    'revoke_key',
                    'member.invite',
                    'member.remove',
                    'member.role_update',
                    'update_plan',
                    'view_organization_members',
                    'export_audit_logs'
                ]
            };
        }
        return apiClient.get<string[]>('/orgs/audit-logs/actions');
    },

    // New: Export Audit Logs
    async exportOrgAuditLogs(params: AuditLogQueryParams = {}): Promise<ServiceResponse<Blob>> {
        const { action, startDate, endDate } = params;
        const query = new URLSearchParams({
            format: 'xlsx', // Default format
            ...(action && action !== 'all' && { action }),
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
        });

        if (CONFIG.USE_MOCK) {
            await delay(1000);
            return { success: true, data: new Blob(["Mock Export Data"], { type: 'text/plain' }) };
        }

        return apiClient.getBlob(`/orgs/audit-logs/export?${query.toString()}`);
    }
};
