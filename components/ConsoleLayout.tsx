
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Key, Plug, Webhook, TerminalSquare, FileText, 
  BarChart3, Users, CreditCard, Settings, MonitorPlay, Building, 
  BookKey, Shield, Menu, X, Sun, Moon, Globe, ChevronDown, Bell, 
  Mail, LogOut, Briefcase, BadgeCheck, Package, PlusCircle, Check,
  User as UserIcon, ExternalLink, RefreshCw, Loader2, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../PermissionContext';
import { useToast } from './Toast';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, LANGUAGE_LABELS, FEATURE_FLAGS } from '../constants';
import { orgService } from '../services/org';
import { Notification } from '../types';
import { Button, ConfirmDialog } from './UI';
import logoDark from '../res/logo2.png'; 

const UserAvatar = React.memo(({ src, alt, className }: { src: string, alt: string, className?: string }) => {
    return (
        <img 
            src={src} 
            alt={alt} 
            className={className} 
            decoding="async" 
            loading="lazy"
        />
    );
});

export const ConsoleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, lang, setLang } = useTheme();
  const { user, logout, refreshUser, switchOrganization } = useAuth();
  const { can } = usePermissions();
  const toast = useToast();
  const t = TRANSLATIONS[lang];
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false); // 新增：切换状态
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [inviteToProcess, setInviteToProcess] = useState<{inviteId: string, notifId: string, name: string} | null>(null);
  const [processingInvite, setProcessingInvite] = useState(false);

  const orgMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin');
  const hasPlatformAdmin = user?.isPlatformAdmin;

  const visibleLanguages = user?.isPlatformAdmin 
      ? SUPPORTED_LANGUAGES 
      : SUPPORTED_LANGUAGES.filter(l => l !== 'zh');

  // 核心修复：确保 userOrgs 总是最新的
  const userOrgs = user?.organizations || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setOrgMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadNotifs = async () => {
      if (!user) return;
      try {
          const res = await orgService.getNotifications(user.id);
          if (res.success && res.data) {
              const notifs = Array.isArray(res.data) ? res.data : [];
              setNotifications(notifs);
              setUnreadCount(notifs.filter(n => !n.read).length);
          }
      } catch (e) {
          console.error(e);
          setNotifications([]);
      }
  };

  useEffect(() => {
      loadNotifs();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 核心修复：增强切换逻辑
  const handleSwitchOrg = async (orgId: string) => {
      if (user?.currentOrgId === orgId) {
          setOrgMenuOpen(false);
          return;
      }
      
      setOrgMenuOpen(false);
      setIsSwitching(true); // 开启全局加载
      
      try {
          const targetOrgName = userOrgs.find(o => o.id === orgId)?.name || 'New Organization';
          const success = await switchOrganization(orgId);
          
          if (success) {
              toast.success(`Switched to ${targetOrgName}`);
              // 强制刷新当前路径下的数据，或者跳转回首页
              navigate('/console');
          } else {
              toast.error("Failed to switch organization context.");
          }
      } catch (e) {
          toast.error("An error occurred during switch.");
      } finally {
          setIsSwitching(false); // 关闭全局加载
      }
  };

  const handleAcceptInvite = async () => {
      if (!user || !inviteToProcess) return;
      setProcessingInvite(true);
      try {
          const { inviteId, notifId } = inviteToProcess;
          const res = await orgService.acceptInvitation(user.id, inviteId);
          if (res.success) {
              await orgService.markNotificationRead(user.id, notifId);
              await refreshUser();
              setNotifMenuOpen(false);
              setInviteToProcess(null);
              navigate('/console');
              window.location.reload();
          } else {
              toast.error(res.error || "Accept failed");
          }
      } finally {
          setProcessingInvite(false);
      }
  };

  const markAllRead = async () => {
      if (!user) return;
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
  };

  const userNavItems = [
    { icon: LayoutDashboard, label: t.console.overview, path: '/console', show: true },
    { icon: Key, label: t.console.credentials, path: '/console/credentials', show: can('keys.read') },
    { icon: BookKey, label: 'OAuth Apps', path: '/console/oauth', show: can('oauth.read') && FEATURE_FLAGS.OAUTH_APPS },
    { icon: Plug, label: t.console.integration, path: '/console/integration', show: FEATURE_FLAGS.INTEGRATION_PAGE }, // 灰度控制
    { icon: Webhook, label: t.console.webhooks, path: '/console/webhooks', show: can('webhooks.read') && FEATURE_FLAGS.WEBHOOKS_PAGE },
    { icon: TerminalSquare, label: t.console.logs, path: '/console/logs', show: can('logs.read') && FEATURE_FLAGS.LOGS_PAGE },
    { icon: FileText, label: t.admin.audit || 'Audit Logs', path: '/console/audit', show: can('org.audit') && FEATURE_FLAGS.AUDIT_LOGS },
    { icon: BarChart3, label: t.console.usage, path: '/console/usage', show: true }, // Usage should be visible to everyone (Developer & Admin)
    { icon: Users, label: t.console.team, path: '/console/team', show: can('team.read') },
    { icon: CreditCard, label: t.console.billing, path: '/console/billing', show: can('billing.read') && FEATURE_FLAGS.BILLING_PAGE },
    { icon: Settings, label: 'Org Settings', path: '/console/settings', show: can('org.update') },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: t.admin.dashboard, path: '/admin' },
    { icon: MonitorPlay, label: t.admin.monitor || 'System Monitor', path: '/admin/monitor' },
    { icon: Users, label: t.admin.users, path: '/admin/users' },
    { icon: Building, label: t.admin.organizations, path: '/admin/organizations' },
    { icon: Package, label: t.admin.plans || 'Plans', path: '/admin/plans' },
    { icon: BookKey, label: 'Roles', path: '/admin/roles' },
    { icon: Shield, label: 'Permissions', path: '/admin/permissions' },
    { icon: FileText, label: t.admin.audit, path: '/admin/audit' },
  ];

  const navItems = isAdminView ? adminNavItems : userNavItems.filter(i => i.show);
  
  // 核心修复：优先从组织列表中查找当前组织名称，确保 UI 响应及时
  const currentOrg = userOrgs.find(o => o.id === user?.currentOrgId);
  const displayOrgName = currentOrg?.name || user?.organization?.name || user?.company || 'My Organization';
  const displayOrgInitial = displayOrgName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 全局切换租户加载遮罩 */}
      {isSwitching && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                  <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-100 dark:border-slate-700 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Switching Workspace</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Applying your security context...</p>
                  </div>
              </div>
          </div>
      )}

      <ConfirmDialog 
        isOpen={!!inviteToProcess}
        onClose={() => setInviteToProcess(null)}
        onConfirm={handleAcceptInvite}
        title="Confirm Join Organization"
        message={`Are you sure you want to join ${inviteToProcess?.name}? You will be switched to this organization context immediately.`}
        isLoading={processingInvite}
      />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
           <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <img src={logoDark} alt="Verilocale" className="h-8 w-auto" />
              {isAdminView && (
                  <span className="text-red-300 text-xs font-mono border border-red-500/50 bg-red-900/30 px-1 rounded">ADMIN</span>
              )}
           </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           <div className="mb-6 px-2">
                {!isAdminView ? (
                    <div className="relative" ref={orgMenuRef}>
                        <button 
                            onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left group ${orgMenuOpen ? 'bg-slate-700 border-primary-500 shadow-lg' : 'bg-slate-800 border-slate-700/50 hover:bg-slate-750'}`}
                        >
                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border border-white/10 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                {displayOrgInitial}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate text-white">{displayOrgName}</p>
                                <div className="flex items-center gap-1">
                                    <BadgeCheck size={12} className="text-blue-400" />
                                    {/* 修复：优先使用 currentOrg.role (来自列表)，作为 UI 显示的 fallback */}
                                    <p className="text-[10px] text-slate-400 truncate capitalize">{user?.orgRole || currentOrg?.role || 'Member'}</p>
                                </div>
                            </div>
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${orgMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {orgMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-up origin-top">
                                <div className="p-2 border-b border-slate-700/50">
                                    <div className="flex items-center justify-between px-2 mb-2">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Select Organization</p>
                                        <RefreshCw size={10} className="text-slate-500 cursor-pointer hover:text-white" onClick={() => refreshUser()} />
                                    </div>
                                    <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                                        {userOrgs.length === 0 ? (
                                            <p className="text-[10px] text-slate-500 text-center py-2 italic">No organizations available</p>
                                        ) : userOrgs.map(org => (
                                            <button 
                                                key={org.id}
                                                onClick={() => handleSwitchOrg(org.id)}
                                                className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-xs transition-all ${user?.currentOrgId === org.id ? 'bg-primary-600/20 text-primary-300 font-bold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                            >
                                                <span className="truncate flex-1">{org.name}</span>
                                                {user?.currentOrgId === org.id && <Check size={12} className="text-primary-400 flex-shrink-0 ml-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Link 
                                        to="/onboarding"
                                        onClick={() => setOrgMenuOpen(false)}
                                        className="w-full flex items-center gap-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        <PlusCircle size={14} /> New Organization
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-center">
                        <Shield size={24} className="mx-auto text-red-400 mb-1" />
                        <p className="text-xs text-red-200 font-medium">Platform Admin</p>
                    </div>
                )}
           </div>

           <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/console' || item.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                    ? (isAdminView ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-primary-600 text-white shadow-lg shadow-primary-900/20') 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
           </nav>
        </div>

        {hasPlatformAdmin && (
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 space-y-3">
               <div className="pt-2 pb-2">
                   {isAdminView ? (
                       <button 
                         onClick={() => navigate('/console')}
                         className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-blue-200 transition-colors group"
                       >
                           <Briefcase size={14} className="group-hover:text-blue-400"/>
                           Back to Console
                       </button>
                   ) : (
                       <button 
                         onClick={() => navigate('/admin')}
                         className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-xs font-medium text-red-200 transition-colors group"
                       >
                           <Shield size={14} className="group-hover:text-red-400"/>
                           Switch to Admin Portal
                       </button>
                   )}
               </div>
            </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
         <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 transition-colors duration-300 shrink-0">
            <button className="lg:hidden p-2 -ml-2 text-slate-600" onClick={() => setSidebarOpen(true)}>
               <Menu size={24} />
            </button>
            
            <div className="flex-1 flex justify-end items-center gap-4">
               <div className="flex items-center gap-2">
                   <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                     {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                   </button>
                   <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                   
                   <div className="relative group">
                        <button className="flex items-center space-x-1 text-xs font-bold uppercase text-slate-500 hover:text-primary-500 p-2">
                            <Globe size={16} />
                            <span>{lang}</span>
                            <ChevronDown size={12} />
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right z-50">
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {visibleLanguages.map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLang(l)}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                                            lang === l ? 'text-primary-500 font-semibold' : 'text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        {LANGUAGE_LABELS[l]}
                                    </button>
                                ))}
                            </div>
                        </div>
                   </div>
               </div>

               <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

               <div className="relative" ref={notifMenuRef}>
                   <button 
                       onClick={() => setUnreadCount(0)} // 点击即假设已读
                       className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative"
                       onMouseEnter={() => setNotifMenuOpen(true)}
                   >
                       <Bell size={20} />
                       {unreadCount > 0 && (
                           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                       )}
                   </button>
                   
                   {notifMenuOpen && (
                       <div 
                        onMouseLeave={() => setNotifMenuOpen(false)}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden z-50"
                       >
                           <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                               <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                               {unreadCount > 0 && <span onClick={markAllRead} className="text-xs text-primary-500 cursor-pointer hover:underline">Mark all read</span>}
                           </div>
                           <div className="max-h-80 overflow-y-auto custom-scrollbar">
                               {notifications.length === 0 ? (
                                   <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                        <Bell size={32} className="mb-2 opacity-20" />
                                        <p className="text-xs">No notifications</p>
                                   </div>
                               ) : (
                                   notifications.map(n => (
                                       <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-primary-900/10' : ''}`}>
                                           <div className="flex gap-3">
                                               <div className="mt-1 flex-shrink-0">
                                                   {n.type === 'invitation' ? <Mail size={16} className="text-primary-500" /> : <Bell size={16} className="text-slate-400" />}
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                   <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                   </div>
                                                   <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                                   
                                                   <div className="mt-3 flex gap-2">
                                                        {n.type === 'invitation' && n.data?.invitationId && !n.read && (
                                                            <Button size="sm" className="h-7 px-3 py-0 text-[10px]" onClick={() => setInviteToProcess({
                                                                inviteId: n.data.invitationId,
                                                                notifId: n.id,
                                                                name: n.title.includes(':') ? n.title.split(':')[1] : 'Organization'
                                                            })}>Accept</Button>
                                                        )}
                                                        {n.data?.link && (
                                                            <Link 
                                                                to={n.data.link} 
                                                                onClick={() => { setNotifMenuOpen(false); orgService.markNotificationRead(user?.id || '', n.id); }}
                                                                className="h-7 flex items-center gap-1 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                                                            >
                                                                View <ExternalLink size={10} />
                                                            </Link>
                                                        )}
                                                   </div>
                                               </div>
                                           </div>
                                       </div>
                                   ))
                               )}
                           </div>
                       </div>
                   )}
               </div>

               <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 pl-2 focus:outline-none"
                    >
                      {user ? (
                        <UserAvatar 
                            src={user.avatar} 
                            alt={user.name || 'User'} 
                            className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-300"></div>
                      )}
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                    
                    {isUserMenuOpen && user && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden z-50">
                         <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            {/* 新增：右上角菜单展示当前组织信息 */}
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                               <span className="text-xs text-slate-400">Org:</span>
                               <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate max-w-[120px]">{displayOrgName}</span>
                           </div>
                        </div>
                        <Link to="/account" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                           <UserIcon size={16} /> User Settings
                        </Link>
                        <Link to="/console" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                           <LayoutDashboard size={16} /> {t.common.dashboard}
                        </Link>
                         {user.role === 'admin' && (
                             <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Shield size={16} /> {t.common.admin_portal}
                             </Link>
                         )}
                         <button 
                           onClick={handleLogout}
                           className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                         >
                           <LogOut size={16} /> {t.common.logout}
                         </button>
                      </div>
                    )}
               </div>
            </div>
         </header>
         
         <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
            {children}
         </main>
      </div>
    </div>
  );
};
