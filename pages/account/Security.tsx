import React, { useState } from 'react';
import { Smartphone, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../components/Toast';
import { Card, Button, ConfirmDialog } from '../../components/UI';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';

export const AccountSecurity: React.FC = () => {
    const { user, updatePassword, deleteAccount } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang];
    const toast = useToast();

    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(true);
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setIsUpdatingPassword(true);
        const res = await updatePassword(passwordData.current, passwordData.new);
        setIsUpdatingPassword(false);
        
        if (res.success) {
            toast.success("Password updated successfully");
            setPasswordData({ current: '', new: '', confirm: '' });
        } else {
            toast.error(res.error || "Failed to update password");
        }
    };

    const confirmDeleteAccount = async () => {
        setIsDeleting(true);
        const res = await deleteAccount();
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        
        if (!res.success) {
            toast.error(res.error || "Failed to delete account");
        }
    };

    const toggleMfa = () => {
        setMfaEnabled(!mfaEnabled);
        toast.info(mfaEnabled ? "MFA Disabled" : "MFA Enabled");
    };

    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteAccount}
                title={t.console.delete_account}
                message={t.settings.danger_desc}
                confirmText="Yes, Delete Account"
                isDestructive
                isLoading={isDeleting}
                verificationText="DELETE" 
            />

            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your password and security settings.</p>
            </div>

            <Card title={t.settings.change_password}>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.settings.current_password}</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 rounded border dark:bg-slate-900 dark:border-slate-600"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t.settings.new_password}</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 rounded border dark:bg-slate-900 dark:border-slate-600"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirm</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 rounded border dark:bg-slate-900 dark:border-slate-600"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" isLoading={isUpdatingPassword}>{t.settings.update_password}</Button>
                    </div>
                </form>
            </Card>

            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 h-fit">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{t.settings.mfa_title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{t.settings.mfa_desc}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={mfaEnabled} onChange={toggleMfa} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-base font-bold text-red-600">{t.console.danger_zone}</h3>
                        <p className="text-sm text-slate-500">{t.settings.danger_desc}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteConfirm(true)}
                        isLoading={isDeleting}
                    >
                        {t.console.delete_account}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
