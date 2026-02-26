
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { TRANSLATIONS } from '../constants';
import { Button, Card, Badge } from '../components/UI';
import { Copy, Check, LogOut, Shield, Key, Mail, Building, Inbox, Clock, X } from 'lucide-react';
import { orgService } from '../services/org';
import { Invitation } from '../types';
import { useToast } from '../components/Toast';

export const Profile: React.FC = () => {
  const { user, logout, refreshUser, switchOrganization } = useAuth();
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang];
  const toast = useToast();
  const navigate = useNavigate();
  
  const [copied, setCopied] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
      const fetchInvites = async () => {
          if (!user) return;
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
      fetchInvites();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get the first active key or the first key available
  const activeKey = user.apiKeys?.find(k => k.status === 'active') || user.apiKeys?.[0];
  // Casting to any because secret is not on ApiKey type
  const displayKey = (activeKey as any)?.secret || '';

  const handleCopyKey = () => {
    if (displayKey) {
        navigator.clipboard.writeText(displayKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAcceptInvite = async (invite: Invitation) => {
      if (confirm(`Accept invitation to join ${invite.organizationName}?`)) {
          try {
              const res = await orgService.acceptInvitation(user.id, invite.id);
              if (res.success) {
                  toast.success("Invitation accepted");
                  // Refresh user to update org list
                  await refreshUser();
                  // Switch context to new org
                  await switchOrganization(invite.organizationId);
                  navigate('/console');
              } else {
                  toast.error(res.error || "Failed to accept invitation");
              }
          } catch (e) {
              toast.error("An unexpected error occurred");
          }
      }
  };

  const handleDeclineInvite = async (inviteId: string) => {
      if (confirm("Decline this invitation?")) {
          try {
              const res = await orgService.declineInvitation(user.id, inviteId);
              if (res.success) {
                  setInvitations(prev => prev.filter(i => i.id !== inviteId));
                  toast.info("Invitation declined");
              } else {
                  toast.error(res.error || "Failed to decline");
              }
          } catch (e) {
              toast.error("Error declining invitation");
          }
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t.profile.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 space-y-6">
           <Card className="text-center">
              <div className="flex flex-col items-center pb-4">
                  <img 
                    src={user.avatar} 
                    alt={user.full_name || user.name} 
                    className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-700 mb-4 shadow-md bg-slate-100 dark:bg-slate-800"
                  />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                  <Badge color="blue">{t.profile.pro_plan}</Badge>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 text-left space-y-3">
                 <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <Mail size={16} className="mr-3" />
                    <span className="truncate">{user.email}</span>
                 </div>
                 <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <Building size={16} className="mr-3" />
                    <span className="truncate">{user.company || t.profile.no_company}</span>
                 </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
                    <LogOut size={16} className="mr-2" /> {t.common.logout}
                </Button>
              </div>
           </Card>
        </div>

        {/* Settings Column */}
        <div className="md:col-span-2 space-y-6">
           {/* API Key Card */}
           <Card title={t.common.api_key}>
               <div className="flex flex-col gap-2">
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                       {t.profile.key_desc}
                   </p>
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                       <Key size={18} className="text-primary-500 flex-shrink-0"/>
                       <code className="flex-grow font-mono text-sm text-slate-700 dark:text-slate-300 truncate">
                           {displayKey || t.profile.no_key}
                       </code>
                       <button 
                        onClick={handleCopyKey}
                        disabled={!displayKey}
                        className="text-slate-500 hover:text-primary-600 p-1 rounded disabled:opacity-50"
                       >
                           {copied ? <Check size={18}/> : <Copy size={18}/>}
                       </button>
                   </div>
               </div>
           </Card>

           {/* Security Card */}
           <Card title={t.profile.security_overview}>
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{t.profile.account_protected}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t.profile.mfa_enabled}</p>
                            </div>
                        </div>
                        <span className="text-green-600 text-sm font-bold">{t.common.active}</span>
                   </div>
                   
                   <div className="text-right">
                       <Button variant="secondary" size="sm">{t.common.save}</Button>
                   </div>
               </div>
           </Card>

           {/* Pending Invitations Card */}
           <Card title="Team Invitations">
               {loadingInvites ? (
                   <div className="text-center py-6 text-slate-400 text-sm">Loading invitations...</div>
               ) : invitations.length === 0 ? (
                   <div className="text-center py-6 flex flex-col items-center">
                       <Inbox size={32} className="text-slate-300 mb-2" />
                       <p className="text-slate-500 text-sm">No pending invitations.</p>
                   </div>
               ) : (
                   <div className="space-y-3">
                       {invitations.map(invite => (
                           <div key={invite.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800/50">
                               <div>
                                   <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                       Join <span className="text-primary-600 dark:text-primary-400">{invite.organizationName}</span>
                                   </p>
                                   <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                       <span className="capitalize bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{invite.role}</span>
                                       <span>Invited by {invite.inviterName}</span>
                                       <span className="flex items-center gap-1 text-orange-500">
                                           <Clock size={10} /> Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                                       </span>
                                   </div>
                               </div>
                               <div className="flex gap-2 w-full sm:w-auto">
                                   <Button size="sm" onClick={() => handleAcceptInvite(invite)} className="flex-1 sm:flex-none">
                                       Accept
                                   </Button>
                                   <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(invite.id)} className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                                       Decline
                                   </Button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </Card>
        </div>
      </div>
    </div>
  );
};
