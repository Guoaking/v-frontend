
import { ServiceResponse, Webhook } from '../types';
import { mockDb } from './mockDb';
import { apiClient } from '../lib/api';
import { CONFIG } from './config';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const webhookService = {
    async getWebhooks(): Promise<ServiceResponse<Webhook[]>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const userStr = localStorage.getItem('vl_user_enterprise');
            if (!userStr) return { success: false, error: "No session" };
            const user = JSON.parse(userStr);
            return { success: true, data: user.webhooks || [] };
        } else {
            return apiClient.get<Webhook[]>('/integrations/webhooks');
        }
    },

    async createWebhook(userId: string, data: Partial<Webhook>): Promise<ServiceResponse<Webhook>> {
        if (CONFIG.USE_MOCK) {
            await delay(500);
            const user = mockDb.getUserById(userId);
            if (!user) return { success: false, error: "User not found" };

            const newWebhook: Webhook = {
                id: `wh_${Math.random().toString(36).substr(2, 9)}`,
                url: data.url || '',
                events: data.events || [],
                secret: `whsec_${Math.random().toString(36).substr(2, 20)}`,
                status: 'active',
                lastStatus: 200,
                ...data
            } as Webhook;

            // In a real app, this would append to DB. In mock, we update the user object.
            const currentWebhooks = user.webhooks || [];
            mockDb.updateUser(userId, { webhooks: [...currentWebhooks, newWebhook] });
            
            return { success: true, data: newWebhook };
        } else {
            return apiClient.post<Webhook>('/integrations/webhooks', data);
        }
    },

    async deleteWebhook(userId: string, webhookId: string): Promise<ServiceResponse<void>> {
        if (CONFIG.USE_MOCK) {
            await delay(400);
            const user = mockDb.getUserById(userId);
            if (!user) return { success: false, error: "User not found" };

            const updated = (user.webhooks || []).filter(w => w.id !== webhookId);
            mockDb.updateUser(userId, { webhooks: updated });
            return { success: true };
        } else {
            return apiClient.delete<void>(`/integrations/webhooks/${webhookId}`);
        }
    }
};
