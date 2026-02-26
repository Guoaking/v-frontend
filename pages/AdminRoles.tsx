
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Shield, Lock, Save, X, Info, Check, Square, CheckSquare } from 'lucide-react';
import { adminService } from '../services/admin';
import { RoleDefinition, PermissionDefinition } from '../types';
import { Button, Card, Badge, Modal } from '../components/UI';
import { useAuth } from '../AuthContext';

import { useNavigate } from 'react-router-dom';

// Helper Component for Permission Management (Removed)


export const AdminRoles: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [roles, setRoles] = useState<RoleDefinition[]>([]);
    const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edit Modal State
    const [editingRole, setEditingRole] = useState<Partial<RoleDefinition> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    // Permissions Management State
    // const [isManagingPerms, setIsManagingPerms] = useState(false);
    // const [newPerm, setNewPerm] = useState<Partial<PermissionDefinition>>({ category: 'General' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [rolesRes, permsRes] = await Promise.all([
            adminService.getRoles(),
            adminService.getPermissions()
        ]);
        
        if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
        if (permsRes.success && permsRes.data) setPermissions(permsRes.data);
        setLoading(false);
    };

    // Permission management functions moved to dedicated page

    const handleEdit = (role: RoleDefinition) => {
        setEditingRole({ ...role }); // Clone to avoid mutation
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingRole({
            name: '',
            description: '',
            permissions: [],
            isSystem: false
        });
        setIsCreating(true);
    };

    const handleSave = async () => {
        if (!editingRole || !editingRole.name) return;
        setSaveLoading(true);

        try {
            if (isCreating) {
                await adminService.createRole(editingRole);
            } else if (editingRole.id) {
                await adminService.updateRole(editingRole.id, editingRole);
            }
            await loadData();
            setEditingRole(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This will remove the role from all assigned users.")) {
            await adminService.deleteRole(id);
            await loadData();
        }
    };

    const togglePermission = (permId: string) => {
        if (!editingRole) return;
        // Don't allow editing system roles permissions if that logic is desired, but for flexible IAM we allow it.
        // if (editingRole.isSystem) return;

        const current = editingRole.permissions || [];
        const updated = current.includes(permId) 
            ? current.filter(p => p !== permId)
            : [...current, permId];
        setEditingRole({ ...editingRole, permissions: updated });
    };

    const toggleCategory = (category: string, permsInCategory: PermissionDefinition[]) => {
        if (!editingRole) return;
        const current = editingRole.permissions || [];
        const allCategoryIds = permsInCategory.map(p => p.id);
        
        // Check if all are already selected
        const allSelected = allCategoryIds.every(id => current.includes(id));
        
        let updated: string[];
        if (allSelected) {
            // Deselect all in category
            updated = current.filter(id => !allCategoryIds.includes(id));
        } else {
            // Select all in category (merge without duplicates)
            updated = Array.from(new Set([...current, ...allCategoryIds]));
        }
        setEditingRole({ ...editingRole, permissions: updated });
    };

    // Group permissions by category for the matrix
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {} as Record<string, PermissionDefinition[]>);

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">IAM Roles</h1>
                    <p className="text-sm text-slate-500">Define access policies for your organization members.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/admin/permissions')}>
                        <Shield size={16} className="mr-2" /> Manage Permissions
                    </Button>
                    <Button onClick={handleCreate} size="sm">
                        <Plus size={16} className="mr-2" /> New Role
                    </Button>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Roles List */}
                <div className="lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Loading roles...</div>
                    ) : (
                        roles.map(role => (
                            <div 
                                key={role.id} 
                                onClick={() => handleEdit(role)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                    editingRole?.id === role.id 
                                    ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 dark:bg-primary-900/20' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{role.name}</h3>
                                        {role.isSystem && (
                                            <Badge color="yellow">System</Badge>
                                        )}
                                    </div>
                                    {!role.isSystem && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(role.id); }}
                                            className="text-slate-400 hover:text-red-500 p-1 opacity-60 hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-3">{role.description}</p>
                                <div className="flex items-center gap-2">
                                    <Shield size={12} className="text-slate-400"/>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {role.permissions.length} actions allowed
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* IAM Policy Editor */}
                <div className="lg:col-span-2 h-full flex flex-col">
                    {editingRole ? (
                        <Card className="h-full flex flex-col p-0 overflow-hidden shadow-lg border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {isCreating ? 'Create Role' : 'Edit Role Policy'}
                                        {editingRole.isSystem && (
                                            <Badge color="yellow">System Managed</Badge>
                                        )}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingRole(null)}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave} isLoading={saveLoading}>Save Policy</Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role Name</label>
                                        <input 
                                            type="text" 
                                            value={editingRole.name}
                                            onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                            disabled={editingRole.isSystem} 
                                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                                        <input 
                                            type="text" 
                                            value={editingRole.description}
                                            onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Matrix */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-slate-900">
                                <div className="space-y-8">
                                    {Object.entries(groupedPermissions).map(([category, perms]) => {
                                        const permList = perms as PermissionDefinition[];
                                        const allSelected = permList.every(p => editingRole.permissions?.includes(p.id));
                                        const someSelected = permList.some(p => editingRole.permissions?.includes(p.id));
                                        
                                        return (
                                            <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                                {/* Category Header */}
                                                <div 
                                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                                                    onClick={() => toggleCategory(category, permList)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`text-slate-400 ${allSelected ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                                                            {allSelected ? <CheckSquare size={18} /> : someSelected ? <div className="w-4 h-4 bg-primary-600 rounded-sm opacity-50 mx-[1px]" /> : <Square size={18} />}
                                                        </div>
                                                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{category} Service</h4>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{permList.length} actions</span>
                                                </div>
                                                
                                                {/* Permission Items */}
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {permList.map(perm => {
                                                        const isSelected = editingRole.permissions?.includes(perm.id);
                                                        return (
                                                            <div 
                                                                key={perm.id}
                                                                onClick={() => togglePermission(perm.id)}
                                                                className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isSelected ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                                            >
                                                                <div className={`flex-shrink-0 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-300 dark:text-slate-600'}`}>
                                                                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-sm font-medium ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                            {perm.name}
                                                                        </span>
                                                                        <code className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-mono">
                                                                            {perm.id}
                                                                        </code>
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{perm.description}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 p-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Shield size={32} className="opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Select a Role to Edit</p>
                            <p className="text-sm mt-2 max-w-xs text-center">Configure granular access permissions for your organization members.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
