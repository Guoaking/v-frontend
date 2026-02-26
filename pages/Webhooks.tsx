
import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Activity, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Button, Card, Badge } from '../components/UI';
import { Webhook as WebhookType } from '../types';
import { webhookService } from '../services/webhook';

export const Webhooks: React.FC = () => {
    const { user } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang];
    
    const [isCreating, setIsCreating] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newEvents, setNewEvents] = useState<string[]>(['kyc.completed']);
    const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchWebhooks = async () => {
        setLoading(true);
        const res = await webhookService.getWebhooks();
        if (res.success && res.data) {
            setWebhooks(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchWebhooks();
    }, []);

    if (!user) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl) return;

        await webhookService.createWebhook(user.id, {
            url: newUrl,
            events: newEvents
        });
        
        await fetchWebhooks();
        setIsCreating(false);
        setNewUrl('');
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this webhook?')) {
            await webhookService.deleteWebhook(user.id, id);
            await fetchWebhooks();
        }
    };

    const toggleEvent = (event: string) => {
        setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.console.webhooks}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive real-time notifications for async events.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} size="sm">
                    <Plus size={16} className="mr-2" /> Add Endpoint
                </Button>
            </div>

            {isCreating && (
                <Card className="border-primary-500 border shadow-lg">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Configure New Endpoint</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payload URL</label>
                            <input 
                                type="url" 
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://api.yourservice.com/callbacks/kyc"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Events</label>
                            <div className="flex gap-3">
                                {['kyc.completed', 'kyc.failed', 'kyc.review_required'].map(evt => (
                                    <button
                                        key={evt}
                                        type="button"
                                        onClick={() => toggleEvent(evt)}
                                        className={`px-3 py-1 text-xs rounded-full border ${
                                            newEvents.includes(evt) 
                                            ? 'bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {evt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>{t.common.cancel}</Button>
                            <Button type="submit">Add Webhook</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading webhooks...</div>
                ) : webhooks.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Webhook size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
                        <p className="text-slate-500">No webhooks configured.</p>
                    </div>
                ) : (
                    webhooks.map(wh => (
                        <Card key={wh.id} className="group hover:border-primary-300 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono font-semibold text-slate-900 dark:text-white truncate max-w-md">{wh.url}</span>
                                        <Badge color="green">Active</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {wh.events.map(e => (
                                            <span key={e} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">{e}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            Secret: <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">whsec_...{wh.secret.substr(-4)}</code>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 self-end md:self-auto">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">Last Delivery</p>
                                        <div className="flex items-center gap-1.5">
                                            {wh.lastStatus === 200 ? <CheckCircle size={14} className="text-green-500"/> : <AlertCircle size={14} className="text-red-500"/>}
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {wh.lastDelivery ? new Date(wh.lastDelivery).toLocaleTimeString() : 'Never'}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(wh.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
