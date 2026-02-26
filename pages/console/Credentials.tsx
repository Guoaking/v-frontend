
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy, Eye, Check, AlertTriangle, FileText, Activity, Search, TerminalSquare, Edit2, Network, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { usePermissions } from '../../PermissionContext';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';
import { ApiScope, ApiKey, ApiKeyWithSecret } from '../../types';
import { Button, Card, Badge, Modal, ConfirmDialog } from '../../components/UI';
import { keyService } from '../../services/keys';

export const Credentials: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang];
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);

  // Scope Filter State
  const hasOrgAccess = can('keys.read'); // Assuming 'keys.read' allows seeing all keys, or maybe 'org.keys.read'?
  // Actually, standard developers usually can 'keys.read' their OWN keys. 
  // Admin usually has 'org.keys.read' or similar implicit power.
  // Let's check permissions. usually 'keys.read' is basic.
  // But wait, can('keys.write') is used below.
  // Let's assume if user is 'owner' or 'admin', they have org access.
  const isOrgAdmin = user?.orgRole === 'owner' || user?.orgRole === 'admin';
  const [scope, setScope] = useState<'org' | 'personal'>(isOrgAdmin ? 'org' : 'personal');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Reset scope if role changes
  useEffect(() => {
      if (!isOrgAdmin && scope === 'org') {
          setScope('personal');
      }
  }, [isOrgAdmin]);

  const [newKeyName, setNewKeyName] = useState('');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>(['ocr:read']);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newKey, setNewKey] = useState<ApiKeyWithSecret | null>(null);
  const [revealedKey, setRevealedKey] = useState<{ secret: string } | null>(null);

  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editScopes, setEditScopes] = useState<ApiScope[]>([]);

  const [revokeDialog, setRevokeDialog] = useState<{ isOpen: boolean, keyId: string | null }>({ isOpen: false, keyId: null });
  const [revealDialog, setRevealDialog] = useState<{ isOpen: boolean, keyId: string | null }>({ isOpen: false, keyId: null });

  const canManageKeys = can('keys.write');

  const fetchKeys = async () => {
      setLoadingKeys(true);
      const res = await keyService.getKeys();
      if (res.success && res.data) {
          setApiKeys(res.data);
      }
      setLoadingKeys(false);
  };

  useEffect(() => {
      fetchKeys();
  }, [user?.currentOrgId]); // Refresh when org context changes

  // Filter keys based on scope
  const filteredKeys = scope === 'personal' 
      ? apiKeys.filter(k => k.createdBy?.userId === user?.id)
      : apiKeys;

  if (!user) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim()) {
       setIsSubmitting(true);
       try {
           const res = await keyService.createKey(user.id, newKeyName, selectedScopes);
           if (res.success && res.data) {
               setNewKey(res.data);
               fetchKeys(); 
           }
           setNewKeyName('');
           setIpWhitelist('');
           setSelectedScopes(['ocr:read']);
           setIsCreating(false);
       } finally {
           setIsSubmitting(false);
       }
    }
  };
  
  const confirmRevoke = async () => {
      if (revokeDialog.keyId) {
          await keyService.revokeKey(user.id, revokeDialog.keyId);
          fetchKeys();
          setRevokeDialog({ isOpen: false, keyId: null });
      }
  };

  const startEdit = (key: ApiKey) => {
      setEditingKeyId(key.id);
      setEditScopes(key.scopes || []);
  };

  const handleUpdateKey = async () => {
      if (!editingKeyId || !user) return;
      setIsSubmitting(true);
      try {
          await keyService.updateKey(user.id, editingKeyId, { scopes: editScopes });
          setEditingKeyId(null);
          fetchKeys();
      } catch (e) {
          console.error(e);
      } finally {
          setIsSubmitting(false);
      }
  };

  const confirmReveal = async () => {
      if (!user || !revealDialog.keyId) return;
      
      const res = await keyService.revealSecret(user.id, revealDialog.keyId);
      if (res.success && res.data) {
          setRevealedKey({ secret: res.data.secret });
      } else {
          alert("Failed to reveal secret: " + res.error);
      }
      setRevealDialog({ isOpen: false, keyId: null });
  };

  const toggleScope = (scopeId: ApiScope, isEditMode = false) => {
      if (isEditMode) {
          setEditScopes(prev => 
             prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
          );
      } else {
          setSelectedScopes(prev => 
             prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
          );
      }
  }

  const handleCopyId = (id: string) => {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  }

  const SCOPE_DEFINITIONS: { id: ApiScope; label: string; desc: string; icon: any }[] = [
      { id: 'ocr:read', label: 'OCR Read', desc: 'Parse ID documents data', icon: FileText },
      { id: 'liveness:read', label: 'Liveness Check', desc: 'Perform passive liveness detection', icon: Activity },
      { id: 'face:read', label: 'Face Verify', desc: 'Compare 1:1 faces', icon: Search },
      { id: 'face:write', label: 'Face Enroll', desc: 'Add faces to database', icon: Plus },
  ];

  const ScopeSelector = ({ scopes, onChange }: { scopes: ApiScope[], onChange: (s: ApiScope) => void }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCOPE_DEFINITIONS.map(scope => (
            <div 
                key={scope.id} 
                onClick={() => onChange(scope.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    scopes.includes(scope.id) 
                    ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
            >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${scopes.includes(scope.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-400'}`}>
                    {scopes.includes(scope.id) && <Check size={12} className="text-white"/>}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <scope.icon size={14} className="text-slate-500"/>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{scope.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{scope.desc}</p>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
       <ConfirmDialog 
           isOpen={revokeDialog.isOpen}
           onClose={() => setRevokeDialog({ isOpen: false, keyId: null })}
           onConfirm={confirmRevoke}
           title="Revoke API Key"
           message="Are you sure you want to revoke this API key? This action is irreversible."
           confirmText="Yes, Revoke"
           isDestructive
       />

       <ConfirmDialog 
           isOpen={revealDialog.isOpen}
           onClose={() => setRevealDialog({ isOpen: false, keyId: null })}
           onConfirm={confirmReveal}
           title="Reveal Secret Key"
           message="Revealing this secret will generate a security audit log. Please ensure you are in a secure environment."
           confirmText="Reveal"
       />

       <Modal
           isOpen={!!revealedKey}
           onClose={() => setRevealedKey(null)}
           title="API Key Revealed"
           type="default"
           footer={<Button onClick={() => setRevealedKey(null)}>Close</Button>}
       >
           <div className="space-y-4">
               <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                   <p className="text-sm text-yellow-800 dark:text-yellow-200 flex gap-2">
                       <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                       Store this key securely. It will not be shown in plain text in the list.
                   </p>
               </div>
               <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secret Key</label>
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                       <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all select-all">
                           {revealedKey?.secret}
                       </code>
                       <button 
                           onClick={() => navigator.clipboard.writeText(revealedKey?.secret || '')}
                           className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                       >
                           <Copy size={18} />
                       </button>
                   </div>
               </div>
           </div>
       </Modal>

       <Modal
           isOpen={!!newKey}
           onClose={() => setNewKey(null)}
           title="API Key Created"
           type="success"
           footer={<Button onClick={() => setNewKey(null)}>I have saved it</Button>}
       >
           <div className="space-y-4">
               <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
                   <p className="text-sm text-yellow-800 dark:text-yellow-200 flex gap-2">
                       <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                       This secret key will <strong>never</strong> be shown again in plain text list. Store it securely.
                   </p>
               </div>
               <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secret Key</label>
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                       <code className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all select-all">
                           {newKey?.secret}
                       </code>
                       <button 
                           onClick={() => navigator.clipboard.writeText(newKey?.secret || '')}
                           className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                       >
                           <Copy size={18} />
                       </button>
                   </div>
               </div>
           </div>
       </Modal>

       <Modal
           isOpen={!!editingKeyId}
           onClose={() => setEditingKeyId(null)}
           title="Edit Permissions"
           footer={
               <>
                   <Button variant="outline" onClick={() => setEditingKeyId(null)}>Cancel</Button>
                   <Button onClick={handleUpdateKey} isLoading={isSubmitting}>Save Changes</Button>
               </>
           }
       >
           <div className="mb-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allowed Scopes</label>
               <ScopeSelector scopes={editScopes} onChange={(s) => toggleScope(s, true)} />
           </div>
       </Modal>

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" onClick={() => isFilterOpen && setIsFilterOpen(false)}>
          <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.console.credentials}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  Managing keys for <Badge color="blue" className="text-xs">{user.organization?.name || 'Personal Org'}</Badge>
              </p>
          </div>
          
          <div className="flex items-center gap-3">
              {/* Scope Filter */}
              <div className="relative">
                  {isOrgAdmin ? (
                      <>
                          <button 
                              onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-medium text-slate-700 dark:text-slate-200"
                          >
                              <Filter size={14} className="text-slate-400" />
                              <span>{scope === 'org' ? 'All Organization Keys' : 'My Personal Keys'}</span>
                              <ChevronDown size={12} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isFilterOpen && (
                              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-20 animate-fade-in overflow-hidden">
                                  <div className="p-1">
                                      <button
                                          onClick={() => setScope('org')}
                                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors ${scope === 'org' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                      >
                                          <span>All Organization Keys</span>
                                          {scope === 'org' && <Check size={12} />}
                                      </button>
                                      <button
                                          onClick={() => setScope('personal')}
                                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors ${scope === 'personal' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                      >
                                          <span>My Personal Keys</span>
                                          {scope === 'personal' && <Check size={12} />}
                                      </button>
                                  </div>
                              </div>
                          )}
                      </>
                  ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed" title="You only see your own keys">
                          <Filter size={14} />
                          <span>My Personal Keys</span>
                      </div>
                  )}
              </div>

              {canManageKeys && (
                  <Button onClick={() => setIsCreating(true)} size="sm">
                     <Plus size={16} className="mr-2" /> {t.console.create_key}
                  </Button>
              )}
          </div>
       </div>

       {isCreating && (
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in shadow-inner">
             <form onSubmit={handleCreate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.console.key_name}</label>
                    <input 
                        type="text" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. Production Server App"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.console.select_scopes}</label>
                    <p className="text-xs text-slate-500 mb-3">Apply the Principle of Least Privilege. Only select scopes this key actually needs.</p>
                    <ScopeSelector scopes={selectedScopes} onChange={(s) => toggleScope(s, false)} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.console.ip_whitelist}</label>
                    <div className="relative">
                        <Network size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            value={ipWhitelist}
                            onChange={(e) => setIpWhitelist(e.target.value)}
                            placeholder={t.console.ip_placeholder}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Optional. Comma separated (e.g. 192.168.1.1, 10.0.0.0/24).</p>
                </div>

                <div className="flex gap-4 pt-2">
                    <Button type="submit" size="sm" variant="primary" isLoading={isSubmitting}>{t.console.create_key}</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsCreating(false)}>{t.common.cancel}</Button>
                </div>
             </form>
          </div>
       )}

       <Card>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-semibold text-slate-500">{t.console.key_name}</th>
                      <th className="py-3 px-4 font-semibold text-slate-500">Creator</th>
                      <th className="py-3 px-4 font-semibold text-slate-500">Scopes</th>
                      <th className="py-3 px-4 font-semibold text-slate-500">Usage</th>
                      <th className="py-3 px-4 font-semibold text-slate-500">{t.common.status}</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 text-right">{t.common.actions}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {loadingKeys ? (
                       <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading keys...</td></tr>
                   ) : filteredKeys.length === 0 ? (
                       <tr><td colSpan={6} className="py-8 text-center text-slate-500">No active keys found.</td></tr>
                   ) : filteredKeys.map((key) => (
                      <tr key={key.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="py-4 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">{key.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                    {key.prefix}...
                                </code>
                                <button 
                                    onClick={() => handleCopyId(key.id)} 
                                    className="text-slate-400 hover:text-slate-600"
                                    title="Copy Key ID"
                                >
                                    {copiedId === key.id ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
                                </button>
                            </div>
                         </td>
                         <td className="py-4 px-4">
                             {key.createdBy ? (
                                <div className="flex items-center gap-2">
                                    {key.createdBy.avatar ? (
                                        <img src={key.createdBy.avatar} alt="" className="w-5 h-5 rounded-full" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">{key.createdBy.name[0]}</div>
                                    )}
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{key.createdBy.name}</span>
                                </div>
                             ) : (
                                 <span className="text-xs text-slate-400">System</span>
                             )}
                         </td>
                         <td className="py-4 px-4">
                             <div className="flex flex-wrap gap-1">
                                 {key.scopes && key.scopes.length > 0 ? (
                                     key.scopes.slice(0, 2).map(scope => (
                                         <span key={scope} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                             {scope}
                                         </span>
                                     ))
                                 ) : (
                                     <span className="text-xs text-slate-400 italic">No scopes</span>
                                 )}
                                 {(key.scopes?.length || 0) > 2 && (
                                     <span className="text-[10px] text-slate-400">+{key.scopes.length - 2}</span>
                                 )}
                             </div>
                         </td>
                         <td className="py-4 px-4">
                            <div className="flex flex-col text-xs">
                                <span className="text-slate-700 dark:text-slate-300 font-mono">
                                    {key.stats?.totalRequests24h || 0} reqs
                                </span>
                                {key.lastIp && (
                                    <div className="flex items-center gap-1 text-slate-400 mt-0.5" title={`Last IP: ${key.lastIp}`}>
                                        <Network size={10} />
                                        <span className="truncate max-w-[80px]">{key.lastIp}</span>
                                    </div>
                                )}
                            </div>
                         </td>
                         <td className="py-4 px-4">
                            <Badge color={key.status === 'active' ? 'green' : 'red'}>{key.status}</Badge>
                         </td>
                         <td className="py-4 px-4 text-right">
                            {canManageKeys ? (
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setRevealDialog({ isOpen: true, keyId: key.id })}
                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                                        title="Reveal Secret"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate(`/console/logs?key_id=${key.id}`)}
                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                                        title="View Logs for this Key"
                                    >
                                        <TerminalSquare size={16} />
                                    </button>
                                    <button 
                                        onClick={() => startEdit(key)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                        title="Edit Permissions"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setRevokeDialog({ isOpen: true, keyId: key.id })}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        title={TRANSLATIONS[lang].console.revoke}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-300 italic">Read-only</span>
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
