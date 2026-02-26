
import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Shield, Edit2, Check, X, Info, AlertTriangle, Ban, CheckCircle, Clock, UserPlus, Loader2, Key, Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../PermissionContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Badge, Modal, ConfirmDialog } from '../components/UI';
import { OrgRole, RoleDefinition, Member, Invitation } from '../types';
import { orgService } from '../services/org';
import { useToast } from '../components/Toast';

export const Team: React.FC = () => {
    const { user } = useAuth();
    const { can } = usePermissions();
    const { lang } = useTheme();
    const toast = useToast();
    const t = TRANSLATIONS[lang].team;
    
    const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<OrgRole>('viewer');
    const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>([]);
    
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<OrgRole>('viewer');

    const [passwordResetMember, setPasswordResetMember] = useState<Member | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    // B2B 交互优化: 使用 ConfirmDialog 状态
    const [revokeDialog, setRevokeDialog] = useState<{ isOpen: boolean, inviteId: string | null, email: string | null }>({ isOpen: false, inviteId: null, email: null });
    const [removeMemberDialog, setRemoveMemberDialog] = useState<{ isOpen: boolean, memberId: string | null, name: string | null }>({ isOpen: false, memberId: null, name: null });
    const [statusToggleDialog, setStatusToggleDialog] = useState<{ isOpen: boolean, memberId: string | null, currentStatus: string | null }>({ isOpen: false, memberId: null, currentStatus: null });

    const canInvite = can('team.invite');
    const canManage = can('team.write');

    const fetchMembers = async () => {
        setLoadingMembers(true);
        if (!user) {
            setLoadingMembers(false);
            return;
        }
        try {
            const [membersRes, invitesRes] = await Promise.all([
                orgService.getMembers(),
                canInvite ? orgService.getInvitations() : Promise.resolve({ success: true, data: [] })
            ]);

            if (membersRes.success && membersRes.data) {
                setMembers(membersRes.data);
            }
            if (invitesRes.success && invitesRes.data) {
                setInvitations(invitesRes.data as Invitation[]);
            }
        } catch (e) {
            console.error("Failed to fetch team data:", e);
        } finally {
            setLoadingMembers(false);
        }
    }

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const rolesRes = await orgService.getAvailableRoles();
                if(rolesRes.success && rolesRes.data) setAvailableRoles(rolesRes.data);
            } catch (e) {
                console.error("Failed to load roles", e);
            }
        }
        loadRoles();
        fetchMembers();
    }, []);

    if (!user) return null;

    const hasOrgContext = !!(user.currentOrgId || user.organization?.id);

    if (!hasOrgContext) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{TRANSLATIONS[lang].console.team}</h1>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-6 rounded-lg flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="text-yellow-500 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Organization Context</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                        Your session is not associated with an active organization. Please switch organizations or contact support.
                    </p>
                </div>
            </div>
        );
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteSuccess(null);
        setInviteError(null);
        if (!inviteEmail) {
            setInviteError("Please enter a valid email address.");
            return;
        }
        setIsInviting(true);
        try {
            const res = await orgService.inviteMember(user.id, inviteEmail, inviteRole);
            if (res.success) {
                setInviteEmail('');
                setInviteSuccess(`Invitation sent to ${inviteEmail}`);
                await fetchMembers();
                setActiveTab('pending');
                setTimeout(() => setInviteSuccess(null), 3000);
            } else {
                setInviteError(res.error || "Failed to send invitation.");
            }
        } catch (error) {
            setInviteError("An unexpected error occurred.");
        } finally {
            setIsInviting(false);
        }
    }

    const handleRevokeInvite = async () => {
        if (!user || !revokeDialog.inviteId) return;
        await orgService.cancelInvitation(user.id, revokeDialog.inviteId);
        setRevokeDialog({ isOpen: false, inviteId: null, email: null });
        fetchMembers();
        toast.success("Invitation revoked");
    }

    const startEdit = (member: Member) => {
        setEditingMember(member.id);
        setEditRole(member.role);
    }

    const saveEdit = async (memberId: string) => {
        if (!user) return;
        await orgService.updateMemberRole(user.id, memberId, editRole);
        setEditingMember(null);
        fetchMembers();
        toast.success("Role updated");
    }
    
    const handleRemoveMember = async () => {
        if (!user || !removeMemberDialog.memberId) return;
        await orgService.removeMember(user.id, removeMemberDialog.memberId);
        setRemoveMemberDialog({ isOpen: false, memberId: null, name: null });
        fetchMembers();
        toast.success("Member removed");
    }

    const handleToggleStatus = async () => {
        if (!user || !statusToggleDialog.memberId) return;
        await orgService.toggleMemberStatus(user.id, statusToggleDialog.memberId);
        setStatusToggleDialog({ isOpen: false, memberId: null, currentStatus: null });
        fetchMembers();
        toast.success("Status updated");
    }

    const openPasswordReset = (member: Member) => {
        setPasswordResetMember(member);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handlePasswordReset = async () => {
        if (!passwordResetMember || !user) return;
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsResetting(true);
        try {
            const res = await orgService.updateMemberPassword(user.id, passwordResetMember.id, newPassword);
            if (res.success) {
                setPasswordResetMember(null);
                toast.success("Password updated successfully");
            } else {
                toast.error(res.error || "Failed to update password");
            }
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <ConfirmDialog 
                isOpen={revokeDialog.isOpen}
                onClose={() => setRevokeDialog({ isOpen: false, inviteId: null, email: null })}
                onConfirm={handleRevokeInvite}
                title="Revoke Invitation"
                message={`Are you sure you want to revoke the invitation for ${revokeDialog.email}? They will no longer be able to join.`}
                isDestructive
                confirmText="Revoke"
            />

            <ConfirmDialog 
                isOpen={removeMemberDialog.isOpen}
                onClose={() => setRemoveMemberDialog({ isOpen: false, memberId: null, name: null })}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                message={`Are you sure you want to remove ${removeMemberDialog.name} from the organization? They will lose all access immediately.`}
                isDestructive
                confirmText="Remove Member"
            />

            <ConfirmDialog 
                isOpen={statusToggleDialog.isOpen}
                onClose={() => setStatusToggleDialog({ isOpen: false, memberId: null, currentStatus: null })}
                onConfirm={handleToggleStatus}
                title={statusToggleDialog.currentStatus === 'active' ? 'Suspend Member' : 'Activate Member'}
                message={statusToggleDialog.currentStatus === 'active' ? 'Suspending this member will temporarily block their access to all organization resources.' : 'Re-activating this member will restore their previously assigned permissions.'}
                confirmText={statusToggleDialog.currentStatus === 'active' ? 'Suspend' : 'Activate'}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{TRANSLATIONS[lang].console.team}</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage who has access to your organization.</p>
                </div>
            </div>

            <Modal
                isOpen={!!passwordResetMember}
                onClose={() => setPasswordResetMember(null)}
                title={`Reset Password: ${passwordResetMember?.name}`}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setPasswordResetMember(null)}>Cancel</Button>
                        <Button onClick={handlePasswordReset} isLoading={isResetting}>Update Password</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-4 rounded-lg flex gap-3">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Changing a user's password will require them to log in again with the new credentials immediately.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2 bg-white dark:bg-slate-900 dark:border-slate-600"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {canInvite && (
                <Card className="mb-8 border-primary-100 dark:border-primary-900/50 shadow-md">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invite New Member</h3>
                        <p className="text-sm text-slate-500">Send an invitation email to add a new user to your team.</p>
                    </div>
                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    value={inviteEmail}
                                    onChange={(e) => {
                                        setInviteEmail(e.target.value);
                                        if(inviteError) setInviteError(null);
                                    }}
                                    placeholder={t.invite_placeholder}
                                    disabled={isInviting}
                                    required
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inviteError ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'} dark:bg-slate-900 focus:ring-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                                />
                            </div>
                            {inviteError && <p className="text-xs text-red-500 mt-1 flex items-center"><Info size={12} className="mr-1" /> {inviteError}</p>}
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                            <select 
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                                disabled={isInviting}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                            >
                                {availableRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-6 w-full md:w-auto">
                            <Button type="submit" className="w-full md:w-auto" disabled={isInviting} isLoading={isInviting}>{t.invite_member}</Button>
                        </div>
                    </form>
                    {inviteSuccess && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center">
                            <CheckCircle size={16} className="mr-2" />
                            {inviteSuccess}
                        </div>
                    )}
                </Card>
            )}

            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Active Members ({members.length})
                </button>
                {canInvite && (
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending Invitations ({invitations.length})
                    </button>
                )}
            </div>

            <Card>
                <div className="overflow-x-auto min-h-[300px]">
                    {activeTab === 'members' ? (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="py-3 px-4 font-semibold text-slate-500">Member</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">{t.role}</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">Last Active</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">{t.status}</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loadingMembers ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading members...</td></tr>
                                ) : members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                        {member.name}
                                                        {member.userId === user.id && <Badge color="blue">You</Badge>}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {editingMember === member.id ? (
                                                <select 
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as OrgRole)}
                                                    className="px-2 py-1 rounded border border-primary-300 dark:border-primary-700 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-primary-500"
                                                    autoFocus
                                                >
                                                    {availableRoles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {member.role === 'owner' && <Shield size={14} className="text-amber-500"/>}
                                                    <span className={`capitalize text-sm ${member.role === 'owner' ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{member.role}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-slate-400" />
                                                {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge color={member.status === 'active' ? 'green' : member.status === 'suspended' ? 'red' : 'yellow'}>
                                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {canManage && member.role !== 'owner' ? (
                                                editingMember === member.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => saveEdit(member.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={14}/></button>
                                                        <button onClick={() => setEditingMember(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><X size={14}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openPasswordReset(member)} className="p-1.5 text-slate-400 hover:text-amber-600" title="Reset Password"><Key size={16} /></button>
                                                        <button onClick={() => startEdit(member)} className="p-1.5 text-slate-400 hover:text-blue-600" title="Edit Role"><Edit2 size={16} /></button>
                                                        <button onClick={() => setStatusToggleDialog({ isOpen: true, memberId: member.id, currentStatus: member.status })} className="p-1.5 text-slate-400 hover:text-yellow-600" title={member.status === 'active' ? 'Suspend' : 'Activate'}>
                                                            {member.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                        </button>
                                                        <button onClick={() => setRemoveMemberDialog({ isOpen: true, memberId: member.id, name: member.name })} className="p-1.5 text-slate-400 hover:text-red-500" title={t.remove_member}><Trash2 size={16} /></button>
                                                    </div>
                                                )
                                            ) : <span className="text-xs text-slate-300 italic">No actions</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="py-3 px-4 font-semibold text-slate-500">Email</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">Role</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">Sent By</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500">Sent At</th>
                                    <th className="py-3 px-4 font-semibold text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {invitations.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-slate-500">No pending invitations.</td></tr>
                                ) : invitations.map(invite => (
                                    <tr key={invite.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{invite.email}</td>
                                        <td className="py-4 px-4 capitalize">{invite.role}</td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{invite.inviterName}</td>
                                        <td className="py-4 px-4 text-xs text-slate-500">{new Date(invite.sentAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setRevokeDialog({ isOpen: true, inviteId: invite.id, email: invite.email })}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            >
                                                <Trash2 size={14} className="mr-1" /> Revoke
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};
