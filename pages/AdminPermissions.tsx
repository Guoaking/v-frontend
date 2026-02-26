import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Search, ArrowLeft } from 'lucide-react';
import { adminService } from '../services/admin';
import { PermissionDefinition } from '../types';
import { Button, Card, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const AdminPermissions: React.FC = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Create State
    const [newPerm, setNewPerm] = useState<Partial<PermissionDefinition>>({ category: 'General' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await adminService.getPermissions();
        if (res.success && res.data) setPermissions(res.data);
        setLoading(false);
    };

    const handleAddPermission = async () => {
        if (!newPerm.id || !newPerm.name || !newPerm.category) return;
        
        const perm: PermissionDefinition = {
            id: newPerm.id,
            name: newPerm.name,
            category: newPerm.category,
            description: newPerm.description || ''
        };
        
        // Optimistic update - in real app call API
        await adminService.createPermission(perm);
        setPermissions([...permissions, perm]);
        setNewPerm({ category: 'General' });
        setIsCreating(false);
    };

    const handleDeletePermission = async (id: string) => {
        if (!confirm('Delete this permission definition? This will remove it from all roles immediately.')) return;
        await adminService.deletePermission(id);
        setPermissions(permissions.filter(p => p.id !== id));
    };

    const filteredPermissions = permissions.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group for display
    const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {} as Record<string, PermissionDefinition[]>);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => navigate('/admin/roles')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permission Definitions</h1>
                    </div>
                    <p className="text-sm text-slate-500 ml-7">Manage the granular capability points available in the system.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search permissions..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus size={16} className="mr-2" /> Add Definition
                    </Button>
                </div>
            </div>

            {/* Create Form - Inline for better UX than modal */}
            {isCreating && (
                <Card className="p-6 border-primary-200 dark:border-primary-900 bg-primary-50/30 dark:bg-primary-900/10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Define New Permission</h3>
                        <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">ID (Unique)</label>
                            <input 
                                type="text" 
                                value={newPerm.id || ''}
                                onChange={e => setNewPerm({...newPerm, id: e.target.value})}
                                placeholder="service.action"
                                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Display Name</label>
                            <input 
                                type="text" 
                                value={newPerm.name || ''}
                                onChange={e => setNewPerm({...newPerm, name: e.target.value})}
                                placeholder="e.g. Manage Users"
                                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                            <input 
                                type="text" 
                                value={newPerm.category || ''}
                                onChange={e => setNewPerm({...newPerm, category: e.target.value})}
                                placeholder="e.g. System"
                                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                            />
                        </div>
                        <Button onClick={handleAddPermission} disabled={!newPerm.id || !newPerm.name || !newPerm.category}>
                            Save Definition
                        </Button>
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                        <input 
                            type="text" 
                            value={newPerm.description || ''}
                            onChange={e => setNewPerm({...newPerm, description: e.target.value})}
                            placeholder="Briefly describe what this permission allows..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                        />
                    </div>
                </Card>
            )}

            {/* Permissions List */}
            <div className="grid grid-cols-1 gap-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <Card key={category} title={category} className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 w-48">Permission ID</th>
                                        <th className="px-6 py-3 w-48">Name</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {perms.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{p.id}</td>
                                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                            <td className="px-6 py-3 text-slate-500">{p.description}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button 
                                                    onClick={() => handleDeletePermission(p.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title="Delete Definition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
                
                {permissions.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        No permissions found. Click "Add Definition" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};