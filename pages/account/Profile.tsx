import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Save, Mail, Inbox, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../components/Toast';
import { Card, Button, ConfirmDialog } from '../../components/UI';
import { orgService } from '../../services/org';
import { Invitation } from '../../types';

export const AccountProfile: React.FC = () => {
    const { user, updateUserProfile, refreshUser, switchOrganization } = useAuth();
    const toast = useToast();
    
    const [profileData, setProfileData] = useState({
        name: '',
        company: '',
        avatar: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Invitation State
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);
    const [inviteToProcess, setInviteToProcess] = useState<{invite: Invitation, action: 'accept' | 'decline'} | null>(null);
    const [processingInvite, setProcessingInvite] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                company: user.company || '',
                avatar: user.avatar || ''
            });
            fetchInvitations();
        }
    }, [user]);

    const fetchInvitations = async () => {
        setLoadingInvites(true);
        try {
            const res = await orgService.getUserInvitations();
            if (res.success && res.data) {
                setInvitations(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingInvites(false);
        }
    };

    const handleRegenerateAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await updateUserProfile(profileData);
        if (res.success) {
            toast.success('Profile updated successfully');
            await refreshUser();
        } else {
            toast.error(res.error || 'Failed to update profile');
        }
        setIsLoading(false);
    };

    const executeInviteAction = async () => {
        if (!inviteToProcess) return;
        const { invite, action } = inviteToProcess;
        setProcessingInvite(true);
        try {
            const res = action === 'accept' 
                ? await orgService.acceptInvitation(user?.id || '', invite.id)
                : await orgService.declineInvitation(user?.id || '', invite.id);

            if (res.success) {
                toast.success(action === 'accept' ? "Invitation accepted" : "Invitation declined");
                if (action === 'accept') {
                    await refreshUser();
                    await switchOrganization(invite.organizationId);
                    window.location.href = '/console';
                } else {
                    setInvitations(prev => prev.filter(i => i.id !== invite.id));
                }
            } else {
                toast.error(res.error || `Failed to ${action}`);
            }
        } catch (e) {
            toast.error(`Error processing ${action}`);
        } finally {
            setProcessingInvite(false);
            setInviteToProcess(null);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
             <ConfirmDialog 
                isOpen={!!inviteToProcess}
                onClose={() => setInviteToProcess(null)}
                onConfirm={executeInviteAction}
                title={inviteToProcess?.action === 'accept' ? "Accept Invitation" : "Decline Invitation"}
                message={inviteToProcess ? (
                    inviteToProcess.action === 'accept' 
                        ? `Are you sure you want to join ${inviteToProcess.invite?.organizationName || 'this organization'}? Your account context will switch immediately.`
                        : `Are you sure you want to decline the invitation from ${inviteToProcess.invite?.organizationName || 'this organization'}?`
                    ) : ''
                }
                confirmText={inviteToProcess?.action === 'accept' ? "Accept" : "Decline"}
                isDestructive={inviteToProcess?.action === 'decline'}
                isLoading={processingInvite}
            />

            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your public profile and organization memberships.</p>
            </div>

            <Card title="Public Profile">
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <img 
                                    src={profileData.avatar} 
                                    alt="Avatar" 
                                    className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm object-cover bg-white dark:bg-slate-800"
                                />
                                <button
                                    type="button" 
                                    onClick={handleRegenerateAvatar}
                                    className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-500 hover:text-primary-600 shadow-sm transition-colors"
                                    title="Generate New Avatar"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleRegenerateAvatar}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                <Camera size={12} /> Regenerate
                            </button>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Display Name</label>
                                <input 
                                    type="text" 
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Company</label>
                                <input 
                                    type="text" 
                                    value={profileData.company}
                                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email (Read Only)</label>
                                <input 
                                    type="text" 
                                    value={user.email}
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                            <Save size={16} className="mr-2" /> Save Profile
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <Card title="Pending Invitations" className="border-l-4 border-l-primary-500">
                    <div className="space-y-3">
                        {invitations.map(invite => (
                            <div key={invite.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Join <span className="text-primary-600 dark:text-primary-400">{invite.organizationName}</span>
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span className="capitalize bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">{invite.role}</span>
                                        {invite.inviterName && <span>Invited by {invite.inviterName}</span>}
                                        <span className="flex items-center gap-1 text-orange-500">
                                            <Clock size={10} /> Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button size="sm" onClick={() => setInviteToProcess({invite, action: 'accept'})} className="flex-1 sm:flex-none">
                                        Accept
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setInviteToProcess({invite, action: 'decline'})} className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
