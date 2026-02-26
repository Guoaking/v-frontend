
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowRight, LogOut, Loader2, Inbox, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { orgService } from '../services/org';
import { Button, Card, Badge, ConfirmDialog } from '../components/UI';
import { useToast } from '../components/Toast';
import { Invitation } from '../types';
import { CONFIG } from '../services/config';

export const Onboarding: React.FC = () => {
    const { user, logout, refreshUser, switchOrganization } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [orgName, setOrgName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const [inviteToAccept, setInviteToAccept] = useState<Invitation | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);

    if (!user) return null;

    useEffect(() => {
        const loadInvites = async () => {
            try {
                const res = await orgService.getUserInvitations();
                if (res.success && res.data) {
                    setInvitations(res.data);
                }
            } catch (e) {
                console.error("Failed to load invites", e);
            } finally {
                setLoadingInvites(false);
            }
        };
        loadInvites();
    }, []);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        setIsCreating(true);
        try {
            const res = await orgService.createOrganization(orgName);
            if (res.success && res.data) {
                toast.success(`Organization "${res.data.name}" created!`);
                await switchOrganization(res.data.id);
                setTimeout(() => navigate('/console'), 100);
            } else {
                toast.error(res.error || "Failed to create organization.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleAcceptInvite = async () => {
        if (!inviteToAccept) return;
        setIsAccepting(true);
        try {
            const res = await orgService.acceptInvitation(user.id, inviteToAccept.id);
            if (res.success) {
                toast.success("Invitation accepted! Entering organization...");
                await switchOrganization(inviteToAccept.organizationId);
                setTimeout(() => navigate('/console'), 100);
            } else {
                toast.error(res.error || "Failed to accept");
            }
        } catch (e) {
            toast.error("Error accepting invitation");
        } finally {
            setIsAccepting(false);
            setInviteToAccept(null);
        }
    };

    const formatExpiry = (isoStr: string) => {
        if (!isoStr) return 'N/A';
        try {
            const date = new Date(isoStr);
            const now = new Date();
            const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        } catch (e) { return 'Expiring soon'; }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            
            <ConfirmDialog 
                isOpen={!!inviteToAccept}
                onClose={() => setInviteToAccept(null)}
                onConfirm={handleAcceptInvite}
                title="Confirm Join"
                message={`Are you sure you want to join ${inviteToAccept?.organizationName}?`}
                isLoading={isAccepting}
                confirmText="Accept & Enter"
            />

            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                        <img src="/res/logo2.png" alt="Verilocale" className="w-10 h-10 object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Welcome, {user.full_name}!</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        To get started, create an organization or join an existing team.
                    </p>
                </div>

                {loadingInvites ? (
                    <div className="text-center text-slate-400 text-sm"><Loader2 className="animate-spin inline mr-2"/> Checking for invitations...</div>
                ) : invitations.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Pending Invitations</p>
                        {invitations.map(invite => (
                            <Card key={invite.id} className="border-l-4 border-l-primary-500 transform hover:translate-x-1 transition-transform cursor-default">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{invite.organizationName}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge color="blue" className="text-[10px] uppercase font-bold">{invite.role}</Badge>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock size={10} /> {formatExpiry(invite.expiresAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => setInviteToAccept(invite)} className="shrink-0">
                                        Accept <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Card className="shadow-xl border-t-4 border-t-slate-300 dark:border-t-slate-600">
                    <form onSubmit={handleCreateOrg} className="space-y-5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-center">Create New Organization</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Organization Name
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-3 text-base" isLoading={isCreating} disabled={!orgName.trim()}>
                            Create & Enter <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </form>
                </Card>

                <div className="text-center">
                    <button 
                        onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
