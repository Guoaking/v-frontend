
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { useToast } from '../components/Toast';
import { TRANSLATIONS } from '../constants';
import { Card, Button, ConfirmDialog } from '../components/UI';
import { orgService } from '../services/org';
import { useNavigate } from 'react-router-dom';

export const OrgSettings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang];
    const toast = useToast();
    const navigate = useNavigate();
    
    const [orgData, setOrgData] = useState({ name: '' });
    const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
    const [isDeletingOrg, setIsDeletingOrg] = useState(false);
    const [showDeleteOrgConfirm, setShowDeleteOrgConfirm] = useState(false);

    useEffect(() => {
        if (user && user.organization) {
            setOrgData({ name: user.organization.name });
        }
    }, [user]);

    const isOrgOwner = user?.orgRole === 'owner';

    const handleOrgUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organization?.id) return;
        setIsUpdatingOrg(true);
        const res = await orgService.updateOrganization(user.organization.id, { name: orgData.name });
        setIsUpdatingOrg(false);
        if (res.success) {
            toast.success("Organization updated");
            await refreshUser();
        } else {
            toast.error(res.error || "Failed to update organization");
        }
    };

    const confirmDeleteOrg = async () => {
        if (!user?.organization?.id) return;
        setIsDeletingOrg(true);
        const res = await orgService.deleteOrganization(user.organization.id);
        setIsDeletingOrg(false);
        setShowDeleteOrgConfirm(false);
        if (res.success) {
            toast.success("Organization deleted");
            window.location.reload(); 
        } else {
            toast.error(res.error || "Failed to delete organization");
        }
    };

    if (!user) return null;

    if (!isOrgOwner) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                    <AlertCircle size={32} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
                <p className="text-slate-500 max-w-md">
                    You do not have permission to manage organization settings. Please contact your organization owner.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmDialog
                isOpen={showDeleteOrgConfirm}
                onClose={() => setShowDeleteOrgConfirm(false)}
                onConfirm={confirmDeleteOrg}
                title="Delete Organization"
                message="Are you sure you want to delete this organization? All data, members, and API keys will be permanently removed. This cannot be undone."
                confirmText="Delete Organization"
                isDestructive
                isLoading={isDeletingOrg}
                verificationText={user.organization?.name || "DELETE"} 
            />

            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your organization profile and danger zone.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Organization Details">
                        <form onSubmit={handleOrgUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Organization Name</label>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={orgData.name}
                                        onChange={(e) => setOrgData({name: e.target.value})}
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <Button type="submit" isLoading={isUpdatingOrg} disabled={isUpdatingOrg || !orgData.name}>
                                        Update Name
                                    </Button>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 pt-2">
                                ID: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{user.organization?.id}</code>
                            </div>
                        </form>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                                <AlertCircle size={18} /> Danger Zone
                            </h3>
                            <p className="text-sm text-slate-500">
                                Deleting an organization is permanent and cannot be undone. All members, keys, and data will be lost.
                            </p>
                            <div className="flex justify-end">
                                <Button 
                                    variant="danger" 
                                    onClick={() => setShowDeleteOrgConfirm(true)}
                                    isLoading={isDeletingOrg}
                                >
                                    Delete Organization
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

