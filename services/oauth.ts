
import { ServiceResponse, OAuthClient } from '../types';
import { mockDb } from './mockDb';
import { apiClient } from '../lib/api';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const oauthService = {
    async getClients(): Promise<ServiceResponse<OAuthClient[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            const freshUser = mockDb.getUserById(user.id);
            return { success: true, data: freshUser?.oauthClients || [] };
        } else {
            return apiClient.get<OAuthClient[]>('/console/oauth/clients');
        }
    },

    async registerClient(userId: string, data: { name: string, description?: string, redirect_uri: string, scopes: string }): Promise<ServiceResponse<OAuthClient>> {
        if (CONFIG.USE_MOCK) {
            await delay(600);
            const client = mockDb.registerOAuthClient(userId, data);
            return { success: true, data: client };
        } else {
            return apiClient.post<OAuthClient>('/console/oauth/clients/register', data);
        }
    },

    async deleteClient(userId: string, clientId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            mockDb.deleteOAuthClient(userId, clientId);
            return { success: true };
        } else {
            return apiClient.delete<void>(`/console/oauth/clients/${clientId}`);
        }
    },

    async revealSecret(userId: string, clientId: string): Promise<ServiceResponse<{ secret: string }>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const secret = mockDb.revealOAuthSecret(userId, clientId);
            return { success: true, data: { secret: secret } };
        } else {
            // Assuming endpoint structure for fetching secret if it exists, or handling via reset mostly
            // If backend doesn't support revealing, this method should return error.
            // But for now, we assume a path exists or we simulate it.
            // NOTE: The user prompt asked to implement management page, backend might only support create.
            // If real backend has no reveal endpoint, this might fail in prod.
            // However, based on "action should support secret viewing", we add it.
            return apiClient.get<{ secret: string }>(`/console/oauth/clients/${clientId}/secret`);
        }
    },

    async resetSecret(userId: string, clientId: string): Promise<ServiceResponse<{ client_secret: string }>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            const secret = mockDb.resetOAuthSecret(userId, clientId);
            return { success: true, data: { client_secret: secret } };
        } else {
            return apiClient.post<{ client_secret: string }>(`/console/oauth/clients/${clientId}/reset-secret`);
        }
    }
};
