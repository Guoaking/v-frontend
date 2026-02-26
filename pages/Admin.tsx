import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Users, Activity, ShieldAlert, Search, Ban, CheckCircle, Building, MonitorPlay, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Package, Edit3, Settings, Database, PlusCircle, MinusCircle, Plus, Trash2, ToggleLeft, ToggleRight, Lock, Key, CreditCard, ChevronDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Card, Badge, Button, Modal, ConfirmDialog } from '../components/UI';
import { CONFIG } from '../services/config';
import { adminService } from '../services/admin';
// FIX: Import QuotaItem for casting in OrgManagement
import { User, Organization, AuditLog, AdminStats, Plan, OrgQuota, QuotaItem } from '../types';
import { AdminRoles } from './AdminRoles'; 
import { AdminPermissions } from './AdminPermissions';

// --- Shared Pagination Component ---
const TablePagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
            <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

// ... [AdminDashboard, SystemMonitor components same as before] ...

const SortHeader: React.FC<{
    label: string;
    field: string;
    currentSort: string;
    currentOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}> = ({ label, field, currentSort, currentOrder, onSort }) => {
    return (
        <th 
            className="px-6 py-3 font-semibold text-slate-500 cursor-pointer hover:text-primary-600 transition-colors select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {currentSort === field ? (
                    currentOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                ) : (
                    <ArrowUpDown size={14} className="opacity-30" />
                )}
            </div>
        </th>
    );
};

const AdminDashboard: React.FC = () => {
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].admin;
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await adminService.getStats();
                if (res.success && res.data) {
                    setStats(res.data);
                }
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.dashboard}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Users size={20}/></div>
                        <span className="text-xs font-bold text-green-500">+12%</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.total_users}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {loading ? '...' : (stats?.totalUsers?.toLocaleString() ?? 0)}
                    </p>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Activity size={20}/></div>
                        <span className="text-xs font-bold text-green-500">+5%</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Requests (24h)</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {loading ? '...' : (stats?.totalRequests?.toLocaleString() ?? 0)}
                    </p>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><ShieldAlert size={20}/></div>
                        <span className="text-xs font-bold text-slate-400">Stable</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.active_keys}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {loading ? '...' : (stats?.activeKeys?.toLocaleString() ?? 0)}
                    </p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Quick Actions">
                     <div className="grid grid-cols-2 gap-4">
                         <Button variant="outline" className="justify-start">Add New Organization</Button>
                         <Button variant="outline" className="justify-start">Review Pending KYC</Button>
                         <Button variant="outline" className="justify-start">Export Audit Logs</Button>
                         <Button variant="outline" className="justify-start text-red-500 border-red-200">System Maintenance</Button>
                     </div>
                 </Card>
                 
                 <Card title={t.system_logs}>
                     <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
                         {[1,2,3,4,5].map(i => (
                             <div key={i} className="text-xs font-mono p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                                 <span className="text-blue-600 dark:text-blue-400">[INFO] Service.OCR</span>
                                 <span className="text-slate-500">Processed request {Math.random().toString(36).substr(2,6)} in {Math.floor(Math.random()*500)}ms</span>
                             </div>
                         ))}
                     </div>
                 </Card>
            </div>
        </div>
    );
};

const SystemMonitor: React.FC = () => {
    const { theme, lang } = useTheme();
    const t = TRANSLATIONS[lang].admin;
    const [activeDashboardId, setActiveDashboardId] = useState(CONFIG.GRAFANA.DASHBOARDS[0].id);
    
    const getUrl = (dashboardPath: string) => {
        const separator = dashboardPath.includes('?') ? '&' : '?';
        return `${CONFIG.GRAFANA.BASE_URL}${dashboardPath}${separator}theme=${theme}&kiosk`;
    }

    const currentDashboard = CONFIG.GRAFANA.DASHBOARDS.find(d => d.id === activeDashboardId) || CONFIG.GRAFANA.DASHBOARDS[0];

    return (
        <div className="space-y-4 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <MonitorPlay className="text-red-500" /> {t.monitor}
                </h1>
            </div>

            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 overflow-x-auto">
                {CONFIG.GRAFANA.DASHBOARDS.map(db => (
                    <button
                        key={db.id}
                        onClick={() => setActiveDashboardId(db.id)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                            activeDashboardId === db.id 
                            ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {t.monitor_tabs[db.name as keyof typeof t.monitor_tabs] || db.name}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative shadow-inner">
                 {CONFIG.USE_MOCK ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900">
                         <Activity size={64} className="mb-4 opacity-20" />
                         <p className="text-lg font-medium">Grafana Integration Demo</p>
                         <p className="text-sm opacity-60 mt-1">Active Panel: {activeDashboardId.toUpperCase()}</p>
                     </div>
                 ) : (
                     <iframe 
                        src={getUrl(currentDashboard.path)}
                        width="100%" 
                        height="100%" 
                        frameBorder="0"
                        className="w-full h-full"
                        title="Grafana Dashboard"
                     />
                 )}
            </div>
        </div>
    );
}

const UserManagement: React.FC = () => {
    const { toggleUserStatus } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].admin;
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Sort State
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Pagination State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Editing State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
    const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await adminService.getUsers({
            page, 
            limit: 10,
            search: searchTerm,
            sortBy,
            sortOrder,
            status: statusFilter || undefined,
            role: roleFilter || undefined
        });
        if (res.success && res.data) {
            setUsers(res.data.items);
            setTotalPages(res.data.totalPages);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUsers();
    }, [page, sortBy, sortOrder, statusFilter, roleFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditRole(user.role);
        setEditStatus(user.status);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        
        if (newPassword && newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                role: editRole,
                status: editStatus
            };
            if (newPassword) {
                payload.password = newPassword;
            }

            await adminService.updateUser(editingUser.id, payload);
            setEditingUser(null);
            fetchUsers(); // Refresh list
        } catch (e) {
            console.error(e);
            alert("Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.user_management}</h1>
                <Button size="sm" variant="outline" onClick={fetchUsers} isLoading={loading}>
                    <RefreshCw size={16}/>
                </Button>
            </div>

            {/* User Edit Modal */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Edit User"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={handleSaveUser} isLoading={isSaving}>Save Changes</Button>
                    </>
                }
            >
                {editingUser && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-3">
                            <img src={editingUser.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{editingUser.name}</p>
                                <p className="text-xs text-slate-500">{editingUser.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">System Role</label>
                                <div className="relative">
                                    <select 
                                        value={editRole} 
                                        onChange={(e) => setEditRole(e.target.value as any)}
                                        className="appearance-none block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600 pr-8 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Platform Admin</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <div className="relative">
                                    <select 
                                        value={editStatus} 
                                        onChange={(e) => setEditStatus(e.target.value as any)}
                                        className="appearance-none block w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600 pr-8 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Lock size={14} /> Change Password
                            </h4>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    placeholder="New Password (leave blank to keep current)" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600 text-sm"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Confirm New Password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600 text-sm"
                                    disabled={!newPassword}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Card>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={t.search_placeholder} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none block px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                        <div className="relative">
                            <select 
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="appearance-none block px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none cursor-pointer"
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <SortHeader label={t.columns.user} field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                <SortHeader label={t.columns.role} field="role" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.org}</th>
                                <SortHeader label={t.columns.status} field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t.columns.action}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">{TRANSLATIONS[lang].common.loading}</td></tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found matching criteria.</td>
                                </tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            <Building size={14} className="text-slate-400"/>
                                            {/* Fix: removed access to non-existent property user.org_name */}
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{user.organization?.name || user.company || 'N/A'}</span>
                                         </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={user.status === 'active' ? 'green' : 'red'}>
                                          {user.status === 'active' ? TRANSLATIONS[lang].common.active : TRANSLATIONS[lang].common.suspended}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-primary-600 transition-colors"
                                                title="Edit User Details"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => toggleUserStatus(user.id)}
                                                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${user.status === 'active' ? 'text-red-500' : 'text-green-500'}`}
                                                title={user.status === 'active' ? t.suspend : t.activate}
                                            >
                                                {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <TablePagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                    isLoading={loading}
                />
            </Card>
        </div>
    );
}

const PlanManagement: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        const res = await adminService.getPlans();
        if (res.success && res.data) setPlans(res.data);
        setLoading(false);
    }

    useEffect(() => { fetchPlans(); }, []);

    const handleCreate = () => {
        setEditingPlan({
            id: '',
            name: '',
            price: 0,
            currency: 'USD',
            requestsLimit: 0,
            features: {},
            quotaConfig: {
                ocr: { limit: 1000, period: 'monthly' },
                face: { limit: 1000, period: 'monthly' }
            },
            isActive: true
        } as Plan);
        setIsCreating(true);
    };

    const handleSave = async () => {
        if (!editingPlan || !editingPlan.name || !editingPlan.id) return;
        
        if (isCreating) {
            await adminService.createPlan(editingPlan);
        } else {
            await adminService.updatePlan(editingPlan.id, editingPlan);
        }
        
        setEditingPlan(null);
        setIsCreating(false);
        fetchPlans();
    }

    const handleDelete = async (planId: string) => {
        if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
            await adminService.deletePlan(planId);
            fetchPlans();
        }
    };

    const togglePlanStatus = async (plan: Plan) => {
        await adminService.updatePlan(plan.id, { isActive: !plan.isActive });
        fetchPlans();
    };

    const updateQuotaConfig = (service: string, field: 'limit' | 'period', value: any) => {
        if (!editingPlan) return;
        setEditingPlan({
            ...editingPlan,
            quotaConfig: {
                ...editingPlan.quotaConfig,
                [service]: {
                    ...editingPlan.quotaConfig?.[service],
                    [field]: value
                }
            }
        } as any);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Plan Management</h1>
                <Button onClick={handleCreate} size="sm">
                    <Plus size={16} className="mr-2"/> Create Plan
                </Button>
            </div>

            <Modal
                isOpen={!!editingPlan}
                onClose={() => { setEditingPlan(null); setIsCreating(false); }}
                title={isCreating ? "Create New Plan" : "Edit Plan"}
                footer={<><Button variant="outline" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>Cancel</Button><Button onClick={handleSave}>Save</Button></>}
            >
                {editingPlan && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ID</label>
                                <input 
                                    className="w-full border rounded p-2 bg-transparent dark:border-slate-600 disabled:opacity-50" 
                                    value={editingPlan.id} 
                                    onChange={e => setEditingPlan({...editingPlan, id: e.target.value})} 
                                    disabled={!isCreating}
                                    placeholder="e.g. starter_v2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input className="w-full border rounded p-2 bg-transparent dark:border-slate-600" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price ({editingPlan.currency || 'USD'})</label>
                                <input type="number" className="w-full border rounded p-2 bg-transparent dark:border-slate-600" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={editingPlan.isActive} 
                                        onChange={e => setEditingPlan({...editingPlan, isActive: e.target.checked})}
                                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm">Is Active</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-3 border-b pb-1 dark:border-slate-700">
                                <h4 className="text-sm font-bold">Quota Configuration</h4>
                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => updateQuotaConfig('new_service', 'limit', 1000)}>
                                    <Plus size={12} className="mr-1"/> Add Service
                                </Button>
                            </div>
                            
                            {editingPlan.quotaConfig ? (
                                <div className="space-y-4">
                                    {Object.entries(editingPlan.quotaConfig).map(([service, config]) => {
                                        const conf = config as import('../types').PlanQuotaConfigItem;
                                        return (
                                        <div key={service} className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-xs font-bold uppercase text-slate-500">{service}</div>
                                                {service === 'new_service' && (
                                                    <input 
                                                        className="text-xs border rounded p-1" 
                                                        placeholder="Service Name" 
                                                        onBlur={(e) => {
                                                            if(e.target.value && e.target.value !== 'new_service') {
                                                                const newConf = { ...editingPlan.quotaConfig };
                                                                newConf[e.target.value] = newConf['new_service']!;
                                                                delete newConf['new_service'];
                                                                setEditingPlan({...editingPlan, quotaConfig: newConf});
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs mb-1">Limit</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full border rounded p-1.5 text-sm bg-white dark:bg-slate-900 dark:border-slate-600"
                                                        value={conf.limit}
                                                        onChange={(e) => updateQuotaConfig(service, 'limit', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs mb-1">Period</label>
                                                    <div className="relative">
                                                        <select 
                                                            className="appearance-none block w-full border rounded p-1.5 text-sm bg-white dark:bg-slate-900 dark:border-slate-600 pr-6 cursor-pointer"
                                                            value={conf.period}
                                                            onChange={(e) => updateQuotaConfig(service, 'period', e.target.value)}
                                                        >
                                                            <option value="monthly">Monthly</option>
                                                            <option value="lifetime">Lifetime</option>
                                                            <option value="yearly">Yearly</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No specific quota configuration.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className={`relative transition-all ${!plan.isActive ? 'opacity-75 grayscale bg-slate-100 dark:bg-slate-800/50' : ''}`}>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => setEditingPlan(plan)} className="p-2 text-slate-400 hover:text-primary-600 bg-white dark:bg-slate-900 rounded-full shadow-sm"><Edit3 size={16} /></button>
                            <button onClick={() => togglePlanStatus(plan)} className={`p-2 rounded-full shadow-sm bg-white dark:bg-slate-900 ${plan.isActive ? 'text-green-500 hover:text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                {plan.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-900 rounded-full shadow-sm"><Trash2 size={16} /></button>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold mb-4">${plan.price} <span className="text-sm font-normal text-slate-500">/ {plan.quotaConfig?.ocr?.period || 'mo'}</span></div>
                        
                        <div className="space-y-2 mb-4">
                            {plan.quotaConfig ? (
                                Object.entries(plan.quotaConfig).map(([key, conf]) => (
                                    <div key={key} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-700 pb-1 last:border-0">
                                        <span className="uppercase text-slate-500 font-semibold text-xs pt-0.5">{key}</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{conf.limit.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                // Fallback safe access
                                <p className="text-sm text-slate-500">Limit: {plan.requestsLimit?.toLocaleString() ?? 0}</p>
                            )}
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            {plan.isActive ? <Badge color="green">Active</Badge> : <Badge color="red">Inactive</Badge>}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- Paginated Organization Management (Updated with Quota) ---
const OrgManagement: React.FC = () => {
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].admin;
    
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]); // NEW: Store available plans
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Quota Modal
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [quotaAdjustment, setQuotaAdjustment] = useState(0);
    const [adjustService, setAdjustService] = useState('ocr');
    const [selectedPlanId, setSelectedPlanId] = useState(''); // NEW: Selected Plan in Modal
    
    const [fetchingQuotas, setFetchingQuotas] = useState(false);
    // Local state for quotas in modal since we need to fetch them fresh
    const [currentQuotas, setCurrentQuotas] = useState<OrgQuota | null>(null);

    // Confirmation Dialog State
    const [showPlanConfirm, setShowPlanConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchOrgs = async () => {
        setLoading(true);
        const res = await adminService.getOrganizations({ page, limit: 10, sortBy, sortOrder });
        if (res.success && res.data) {
            setOrgs(res.data.items);
            setTotalPages(res.data.totalPages);
        }
        setLoading(false);
    }

    const fetchPlans = async () => {
        const res = await adminService.getPlans();
        if(res.success && res.data) {
            setPlans(res.data.filter(p => p.isActive));
        }
    }

    // Function to fetch specific org quotas for the modal
    const openQuotaModal = async (org: Organization) => {
        setSelectedOrg(org);
        setSelectedPlanId(org.plan.id); // Initialize select with current plan
        setFetchingQuotas(true);
        
        // Ensure we fetch real-time quota from backend instead of relying on cached list data
        try {
            const res = await adminService.getOrgQuotas(org.id);
            if (res.success && res.data) {
                setCurrentQuotas(res.data);
            } else {
                // Fallback to existing data if fetch fails
                setCurrentQuotas(org.quotas || {});
            }
        } catch (e) {
            console.error("Failed to fetch quotas", e);
            setCurrentQuotas(org.quotas || {});
        } finally {
            setFetchingQuotas(false);
        }
    };

    useEffect(() => { fetchOrgs(); fetchPlans(); }, [page, sortBy, sortOrder]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleSaveClick = () => {
        if (!selectedOrg) return;

        // Check if Plan Changed
        if (selectedPlanId !== selectedOrg.plan.id) {
            setShowPlanConfirm(true); // Trigger confirmation flow
        } else {
            executeSave(); // Directly save if plan hasn't changed
        }
    };

    const executeSave = async () => {
        if (!selectedOrg) return;
        setIsSaving(true);

        try {
            // 1. Update Plan (if changed)
            if (selectedPlanId !== selectedOrg.plan.id) {
                await adminService.updateOrgPlan(selectedOrg.id, selectedPlanId);
            }

            // 2. Adjust Quota (if adjusted)
            if (quotaAdjustment !== 0) {
                await adminService.adjustOrgQuota(selectedOrg.id, adjustService, quotaAdjustment);
            }

            // 3. Cleanup & Refresh
            setSelectedOrg(null);
            setQuotaAdjustment(0);
            setCurrentQuotas(null);
            setShowPlanConfirm(false);
            fetchOrgs(); 
        } catch (e) {
            console.error("Failed to save organization updates", e);
            alert("An error occurred while saving changes.");
        } finally {
            setIsSaving(false);
        }
    };

    // Derived dynamic options for services
    const serviceOptions = currentQuotas 
        ? Array.from(new Set([...Object.keys(currentQuotas), 'ocr', 'face', 'liveness'])) 
        : ['ocr', 'face', 'liveness'];

    const targetPlanName = plans.find(p => p.id === selectedPlanId)?.name || 'New Plan';

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.org_management}</h1>
            
            <Modal
                isOpen={!!selectedOrg}
                onClose={() => setSelectedOrg(null)}
                title={`Manage Organization: ${selectedOrg?.name}`}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setSelectedOrg(null)}>Cancel</Button>
                        {/* Fix: use onClick instead of handleSaveClick which is not a valid prop on Button */}
                        <Button onClick={handleSaveClick} isLoading={isSaving}>Save Changes</Button>
                    </>
                }
            >
                <div className="space-y-6">
                    
                    {/* Plan Selection Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
                            <CreditCard size={16} />
                            <span className="font-semibold text-sm">Subscription Plan</span>
                        </div>
                        <div className="relative">
                            <select 
                                className="appearance-none block w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-primary-500 outline-none pr-10 transition-shadow cursor-pointer"
                                value={selectedPlanId}
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                            >
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                        {selectedPlanId !== selectedOrg?.plan.id && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Changing plan will reset quotas.
                            </p>
                        )}
                    </div>

                    {/* Visualization of Current Quotas */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
                            <Database size={16} />
                            <span className="font-semibold text-sm">Current Consumption</span>
                        </div>
                        {fetchingQuotas ? (
                            <div className="text-center py-4 text-slate-400 flex items-center justify-center gap-2">
                                <RefreshCw className="animate-spin" size={16} /> Loading quotas...
                            </div>
                        ) : (
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                        <tr>
                                            <th className="p-3 border-r border-slate-200 dark:border-slate-700">Service</th>
                                            <th className="p-3 border-r border-slate-200 dark:border-slate-700">Limit</th>
                                            <th className="p-3 border-r border-slate-200 dark:border-slate-700">Used</th>
                                            <th className="p-3">Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {currentQuotas && Object.entries(currentQuotas).length > 0 ? (
                                            Object.entries(currentQuotas).map(([key, q]) => {
                                                // FIX: explicitly handle QuotaItem casting
                                                const quota = q as QuotaItem;
                                                return (
                                                <tr key={key} className="bg-white dark:bg-slate-900">
                                                    <td className="p-3 font-bold uppercase text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{key}</td>
                                                    <td className="p-3 border-r border-slate-100 dark:border-slate-700 font-mono">{quota?.limit?.toLocaleString() ?? 0}</td>
                                                    <td className="p-3 border-r border-slate-100 dark:border-slate-700 text-slate-500 font-mono">{quota?.used?.toLocaleString() ?? 0}</td>
                                                    <td className={`p-3 font-bold font-mono ${(quota?.remaining || 0) < 100 ? 'text-red-500' : 'text-green-600'}`}>{quota?.remaining?.toLocaleString() ?? 0}</td>
                                                </tr>
                                            )})
                                        ) : (
                                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">No active quotas found for this organization.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Manual Quota Adjustment</p>
                        <p className="text-xs text-slate-500 mb-4">
                            Directly add or remove quota credits. Use negative numbers to deduct. 
                            <br/>Example: <code>+500</code> adds credit, <code>-200</code> removes credit.
                        </p>
                        <div className="flex gap-4">
                            <div className="relative w-1/3">
                                <select 
                                    className="appearance-none block w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-primary-500 outline-none pr-8 cursor-pointer"
                                    value={adjustService} 
                                    onChange={e => setAdjustService(e.target.value)}
                                >
                                    {serviceOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <div className="flex-1 relative">
                                <input 
                                    type="number" 
                                    placeholder="Amount (e.g. 100)" 
                                    className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-slate-900 dark:border-slate-600 text-sm focus:ring-2 focus:ring-primary-500 outline-none pr-20" 
                                    value={quotaAdjustment} 
                                    onChange={e => setQuotaAdjustment(Number(e.target.value))} 
                                />
                                <div className="absolute right-1 top-1 flex gap-1">
                                    <button onClick={() => setQuotaAdjustment(quotaAdjustment + 100)} className="px-1.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-slate-500 font-medium">+100</button>
                                    <button onClick={() => setQuotaAdjustment(quotaAdjustment + 1000)} className="px-1.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-slate-500 font-medium">+1K</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Confirm Dialog moved to end to ensure stacking context priority if needed */}
            <ConfirmDialog 
                isOpen={showPlanConfirm}
                onClose={() => setShowPlanConfirm(false)}
                onConfirm={executeSave}
                title="Confirm Plan Change"
                message={
                    <div className="space-y-2">
                        <p>Are you sure you want to change the plan to <strong>{targetPlanName}</strong>?</p>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 text-xs rounded border border-yellow-200 dark:border-yellow-900/50 flex gap-2">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>Warning: This will RESET the organization's current quota usage and limits to the defaults of the new plan immediately.</span>
                        </div>
                    </div>
                }
                confirmText="Yes, Change Plan"
                isLoading={isSaving}
            />

            <Card>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <SortHeader label={t.columns.org} field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.plan}</th>
                                <SortHeader label={t.columns.usage} field="totalUsage" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Quota</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">{TRANSLATIONS[lang].common.loading}</td></tr>
                             ) : orgs.map(org => (
                                <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{org.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={org.plan.id === 'scale' ? 'red' : org.plan.id === 'growth' ? 'blue' : 'green'}>{org.plan.name}</Badge>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                        {org.usageSummary?.totalRequests?.toLocaleString() || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="outline" onClick={() => openQuotaModal(org)}><Settings size={14} className="mr-1"/> Manage</Button>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
                <TablePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
            </Card>
        </div>
    );
};

const AuditLogs: React.FC = () => {
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].admin;
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('all');

    const fetchLogs = async () => {
        setLoading(true);
        const res = await adminService.getAuditLogs({ page, limit: 20, action: actionFilter });
        if (res.success && res.data) {
            setLogs(res.data.items || []);
            setTotalPages(res.data.totalPages);
        } else {
            setLogs([]);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.audit}</h1>
                <div className="relative">
                    <select 
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="appearance-none block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none cursor-pointer"
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login</option>
                        <option value="create_key">Create Key</option>
                        <option value="update_plan">Update Plan</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
            </div>
            <Card>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.timestamp}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.user}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.action}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.target}</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">{t.columns.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">{TRANSLATIONS[lang].common.loading}</td></tr>
                             ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{log.userName}</div>
                                        <div className="text-xs text-slate-500">{log.ip}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color="blue">{log.action}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {log.target}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.status === 'success' ? (
                                            <CheckCircle size={16} className="text-green-500"/>
                                        ) : (
                                            <Ban size={16} className="text-red-500"/>
                                        )}
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
                <TablePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
            </Card>
        </div>
    );
};

export const Admin: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/monitor" element={<SystemMonitor />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/organizations" element={<OrgManagement />} />
            <Route path="/plans" element={<PlanManagement />} /> {/* New Route */}
            <Route path="/roles" element={<AdminRoles />} />
            <Route path="/permissions" element={<AdminPermissions />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};