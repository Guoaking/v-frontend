
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, AlertTriangle, Eye, RotateCw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../PermissionContext';
import { useTheme } from '../App';
import { TRANSLATIONS, API_SCOPES } from '../constants';
import { Button, Card, Badge, Modal, ConfirmDialog } from '../components/UI';
import { oauthService } from '../services/oauth';
import { OAuthClient, ApiScope } from '../types';

export const OAuth: React.FC = () => {
    const { user } = useAuth();
    const { can } = usePermissions(); // Use Permission Context
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].oauth;
    
    const [clients, setClients] = useState<OAuthClient[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Modal State
    const [isCreating, setIsCreating] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientDesc, setNewClientDesc] = useState('');
    const [redirectUri, setRedirectUri] = useState('');
    const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>(['ocr:read']);

    // Success/Secret Modal (Used for Creation, Reveal, Reset)
    const [secretModalData, setSecretModalData] = useState<{ id: string, secret: string, type: 'create' | 'reveal' | 'reset' } | null>(null);
    
    // Action States
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [revealId, setRevealId] = useState<string | null>(null);
    const [resetId, setResetId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Permission Checks
    const canWrite = can('oauth.write'); 
    const canRead = can('oauth.read');
    console.log('canRead:', canRead);
    console.log('canWrite:', canWrite);



    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await oauthService.getClients();
            if (res.success && res.data) {
                setClients(res.data);
            }
        } catch (e) {
            console.error("Failed to load OAuth clients", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && canRead) fetchClients();
        else setLoading(false);
    }, [user, canRead]);

    if (!user) return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">You must be logged in to manage OAuth applications.</p>
            <Button onClick={() => window.location.href = '#/login'}>Log In</Button>
        </div>
    );

    if (!canRead) return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900">
            <AlertTriangle className="text-red-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Access Denied</h3>
            <p className="text-sm text-red-600 dark:text-red-200">You do not have permission to view OAuth credentials.</p>
        </div>
    );

    const handleCreate = async () => {
        if (!newClientName) return;
        setCreateLoading(true);
        try {
            const res = await oauthService.registerClient(user.id, {
                name: newClientName,
                description: newClientDesc,
                redirect_uri: '',
                scopes: selectedScopes.join(' ')
            });

            if (res.success && res.data) {
                setSecretModalData({ 
                    id: res.data.client_id, 
                    secret: res.data.client_secret || '', 
                    type: 'create' 
                });
                setIsCreating(false);
                setNewClientName('');
                setNewClientDesc('');
                setRedirectUri('');
                setSelectedScopes(['ocr:read']);
                fetchClients();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await oauthService.deleteClient(user.id, deleteId);
        setDeleteId(null);
        fetchClients();
    };

    const handleReveal = async () => {
        if (!revealId) return;
        setIsActionLoading(true);
        try {
            const res = await oauthService.revealSecret(user.id, revealId);
            if (res.success && res.data) {
                setSecretModalData({
                    id: revealId,
                    secret: res.data.secret || '',
                    type: 'reveal'
                });
            } else {
                alert("Failed to retrieve secret.");
            }
        } finally {
            setIsActionLoading(false);
            setRevealId(null);
        }
    };

    const handleReset = async () => {
        if (!resetId) return;
        setIsActionLoading(true);
        try {
            const res = await oauthService.resetSecret(user.id, resetId);
            if (res.success && res.data) {
                setSecretModalData({
                    id: resetId,
                    secret: res.data.client_secret,
                    type: 'reset'
                });
            } else {
                alert("Failed to reset secret.");
            }
        } finally {
            setIsActionLoading(false);
            setResetId(null);
        }
    };

    const toggleScope = (scopeId: ApiScope) => {
        setSelectedScopes(prev => 
            prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
        );
    };

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-primary-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {t.title}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
                </div>
                {canWrite && (
                    <Button onClick={() => setIsCreating(true)} size="sm">
                        <Plus size={16} className="mr-2" /> {t.create_client}
                    </Button>
                )}
            </div>

            {/* Create Client Modal */}
            <Modal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title={t.create_client}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>{TRANSLATIONS[lang].common.cancel}</Button>
                        <Button onClick={handleCreate} isLoading={createLoading} disabled={!newClientName}>
                            {t.create_client}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Create a new OAuth client for server-to-server integration. 
                        This will generate a Client ID and Client Secret for use with the Client Credentials flow.
                    </p>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded border border-blue-100 dark:border-blue-900">
                        <p className="font-bold mb-1">Security Audit</p>
                        <p>Creation of OAuth clients is logged for security auditing purposes. No approval is required, but admins will be notified.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{t.client_name}</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="e.g. My Mobile App"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{t.description}</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Optional description"
                            value={newClientDesc}
                            onChange={(e) => setNewClientDesc(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t.scopes}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {API_SCOPES.map(scope => (
                                <div 
                                    key={scope.id} 
                                    onClick={() => toggleScope(scope.id)}
                                    className={`p-2 rounded-md border cursor-pointer flex items-center gap-2 text-sm ${
                                        selectedScopes.includes(scope.id) 
                                        ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${selectedScopes.includes(scope.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-400'}`}>
                                        {selectedScopes.includes(scope.id) && <Check size={10} className="text-white"/>}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300">{scope.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Secret Display Modal (Create/Reveal/Reset) */}
            <Modal
                isOpen={!!secretModalData}
                onClose={() => setSecretModalData(null)}
                title={secretModalData?.type === 'create' ? "Client Registered" : secretModalData?.type === 'reset' ? "Secret Reset Successful" : "Client Secret Revealed"}
                type={secretModalData?.type === 'reveal' ? 'default' : 'success'}
                footer={<Button onClick={() => setSecretModalData(null)}>Done</Button>}
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{t.secret_warning}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client ID</label>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                            <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200">{secretModalData?.id}</code>
                            <CopyButton text={secretModalData?.id || ''} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Secret</label>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                            <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all">{secretModalData?.secret}</code>
                            <CopyButton text={secretModalData?.secret || ''} />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Client"
                message="Are you sure you want to delete this OAuth client? Any applications using these credentials will stop working immediately."
                confirmText="Delete"
                isDestructive
            />

            {/* Reveal Confirmation */}
            <ConfirmDialog 
                isOpen={!!revealId}
                onClose={() => setRevealId(null)}
                onConfirm={handleReveal}
                title="Reveal Client Secret"
                message="Revealing the secret will create a security audit log. Ensure you are in a safe environment."
                confirmText="Reveal"
                isLoading={isActionLoading}
            />

            {/* Reset Confirmation */}
            <ConfirmDialog 
                isOpen={!!resetId}
                onClose={() => setResetId(null)}
                onConfirm={handleReset}
                title="Reset Client Secret"
                message="This will immediately invalidate the current secret. You must update your application with the new secret immediately."
                confirmText="Reset Secret"
                isDestructive
                isLoading={isActionLoading}
            />

            <Card>
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.client_name}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Client ID</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.scopes}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{TRANSLATIONS[lang].common.status}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">{TRANSLATIONS[lang].common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">{TRANSLATIONS[lang].common.loading}</td></tr>
                            ) : clients.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">No OAuth clients registered.</td></tr>
                            ) : clients.map(client => (
                                <tr key={client.client_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{client.name}</div>
                                        {client.description && <div className="text-xs text-slate-500 mt-0.5">{client.description}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
                                                {client.client_id}
                                            </code>
                                            <CopyButton text={client.client_id} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {client.scopes.split(' ').map(s => (
                                                <span key={s} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={client.status === 'active' ? 'green' : 'red'}>{client.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canWrite ? (
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setRevealId(client.client_id)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                                                    title="Reveal Secret"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setResetId(client.client_id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="Reset Secret"
                                                >
                                                    <RotateCw size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(client.client_id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Delete Client"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300 italic">Read Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
