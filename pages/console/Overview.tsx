
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Key, Filter, ChevronDown, Check, TrendingUp, CreditCard, Code, FileText, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { usePermissions } from '../../PermissionContext';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';
import { Card, Button } from '../../components/UI';
import { consoleService } from '../../services/console';
import { keyService } from '../../services/keys';
import { UsageMetric, ApiKey, DetailedUsageStats } from '../../types';
import { Link } from 'react-router-dom';

export const Overview: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang]; 
  
  const [detailedStats, setDetailedStats] = useState<DetailedUsageStats | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Scope Filter State
  const hasOrgAccess = can('org.usage.read');
  const [scope, setScope] = useState<'org' | 'personal'>(hasOrgAccess ? 'org' : 'personal');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Reset scope if permissions change
  useEffect(() => {
      if (!hasOrgAccess && scope === 'org') {
          setScope('personal');
      }
  }, [hasOrgAccess]);

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              // Fetch Data based on scope
              const [statsRes, keysRes] = await Promise.all([
                  consoleService.getDetailedUsageStats('30d'), // Scope is handled by backend based on user context/role usually, or we add scope param to detailed stats if needed. For now assuming detailed stats respects auth context.
                  keyService.getKeys()
              ]);

              if (statsRes.success && statsRes.data) {
                  setDetailedStats(statsRes.data);
              }

              let filteredKeys = keysRes.success && keysRes.data ? keysRes.data : [];
              if (scope === 'personal') {
                  filteredKeys = filteredKeys.filter(k => k.createdBy?.userId === user?.id);
              }
              setApiKeys(filteredKeys);

          } catch (e) {
              console.error("Failed to load dashboard", e);
          } finally {
              setLoading(false);
          }
      }
      loadData();
  }, [scope, user?.id]); 

  if (!user) return null;

  const usageData = detailedStats?.timeline || [];
  const maxReq = usageData.length > 0 ? Math.max(...usageData.map(u => u.requests)) : 100;
  
  const activeKeysCount = apiKeys.filter(k => k.status === 'active').length;
  const errorRate = detailedStats?.totalRequests && detailedStats.totalRequests > 0 
      ? ((detailedStats.totalErrors / detailedStats.totalRequests) * 100).toFixed(2) 
      : '0.00';

  const stats = {
      totalReqs: detailedStats?.totalRequests || 0,
      errorRate,
      activeKeys: activeKeysCount
  };

  const isEmptyState = !loading && (detailedStats?.totalRequests || 0) === 0 && apiKeys.length === 0;

  return (
    <div className="space-y-6 animate-fade-in" onClick={() => isFilterOpen && setIsFilterOpen(false)}>
       {/* Header & Filter */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                   {t.console.overview} 
               </h1>
               <p className="text-sm text-slate-500 mt-1">
                   {scope === 'org' 
                       ? `Overview for ${user.organization?.name || 'Organization'}` 
                       : `Personal dashboard for ${user.name}`}
               </p>
           </div>
           
           <div className="relative">
               {hasOrgAccess ? (
                   <>
                       <button 
                           onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                           className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
                       >
                           <Filter size={16} className="text-slate-400" />
                           <span>{scope === 'org' ? 'All Organization' : 'My Personal Data'}</span>
                           <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                       </button>

                       {isFilterOpen && (
                           <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-20 animate-fade-in overflow-hidden">
                               <div className="p-1">
                                   <button onClick={() => setScope('org')} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${scope === 'org' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                       <span>All Organization</span>
                                       {scope === 'org' && <Check size={14} />}
                                   </button>
                                   <button onClick={() => setScope('personal')} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${scope === 'personal' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                       <span>My Personal Data</span>
                                       {scope === 'personal' && <Check size={14} />}
                                   </button>
                               </div>
                           </div>
                       )}
                   </>
               ) : (
                   <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed">
                       <Filter size={16} />
                       <span>My Personal Data</span>
                   </div>
               )}
           </div>
       </div>
       
       {/* Empty State / Onboarding */}
       {isEmptyState && (
           <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   <div>
                       <h2 className="text-2xl font-bold mb-2">Welcome to Verilocale! 🚀</h2>
                       <p className="text-blue-100 max-w-xl">
                           You haven't made any API requests yet. Get started by creating your first API Key and integrating our SDK.
                       </p>
                   </div>
                   <div className="flex gap-3">
                       <Link to="/console/credentials">
                           <Button variant="secondary" className="bg-white text-primary-600 border-none hover:bg-blue-50">Create API Key</Button>
                       </Link>
                       <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">Read Docs</Button>
                   </div>
               </div>
           </div>
       )}

       {/* Key Metrics Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
              icon={Activity} 
              label="Total Requests" 
              value={stats.totalReqs.toLocaleString()} 
              subValue="Last 30 days"
              color="blue"
              link="/console/usage" // 指向详细页面
          />
          <MetricCard 
              icon={AlertTriangle} 
              label="Error Rate" 
              value={`${stats.errorRate}%`} 
              subValue="Target < 1.0%"
              color={parseFloat(stats.errorRate) > 1 ? 'red' : 'green'}
              link="/console/usage" // 错误率详情也在 Usage 或 Logs
          />
          <MetricCard 
              icon={Key} 
              label="Active Keys" 
              value={stats.activeKeys} 
              subValue={scope === 'org' ? 'Across organization' : 'Owned by you'}
              color="purple"
              link="/console/credentials" // 指向 Keys 管理页
          />
          {scope === 'org' ? (
              <MetricCard 
                  icon={CreditCard} 
                  label="Est. Cost" 
                  value={`$${(stats.totalReqs * 0.001).toFixed(2)}`} // Mock calculation
                  subValue="Current month"
                  color="amber"
                  link="/console/billing" // 指向账单页
              />
          ) : (
              <MetricCard 
                  icon={Zap} 
                  label="Quota Used" 
                  value={`${detailedStats?.quotaStatus.percentUsed.toFixed(1) || '0.0'}%`}
                  subValue="Free Tier limit"
                  color="teal"
                  link="/console/usage" // 配额详情在 Usage
              />
          )}
       </div>

       {/* Main Content Split */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-6">
              <Card title="Traffic Volume">
                  {loading ? (
                      <div className="h-64 flex items-center justify-center text-slate-400">Loading activity...</div>
                  ) : usageData.length > 0 ? (
                      <div className="h-64 flex items-end justify-between gap-2 pt-6">
                         {usageData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                    {day.date}: {day.requests} reqs
                                </div>
                                <div 
                                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-t hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative flex flex-col justify-end overflow-hidden"
                                  style={{ height: '100%' }}
                                >
                                   {/* Success Bar */}
                                   <div 
                                      className="w-full bg-primary-500/80"
                                      style={{ height: day.requests > 0 ? `${((day.requests - day.errors) / (maxReq || 1)) * 100}%` : '0px' }}
                                   />
                                   {/* Error Bar Stacked */}
                                   <div 
                                      className="w-full bg-red-400/80"
                                      style={{ height: day.requests > 0 ? `${(day.errors / (maxReq || 1)) * 100}%` : '0px' }}
                                   />
                                </div>
                            </div>
                         ))}
                      </div>
                  ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                          <Activity size={32} className="mb-2 opacity-20" />
                          No traffic data available for this period.
                      </div>
                  )}
              </Card>

              {/* Active Keys List */}
              <Card title={scope === 'org' ? "Top Active Keys" : "My Active Keys"}>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                  <th className="px-4 py-3">Key Name</th>
                                  <th className="px-4 py-3">Prefix</th>
                                  {scope === 'org' && <th className="px-4 py-3">Owner</th>}
                                  <th className="px-4 py-3 text-right">24h Usage</th>
                              </tr>
                          </thead>
                          <tbody>
                              {apiKeys.slice(0, 5).map(key => (
                                  <tr key={key.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                          <div className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                              {key.name}
                                          </div>
                                      </td>
                                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{key.prefix}...</td>
                                      {scope === 'org' && (
                                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                              {key.createdBy?.name || 'System'}
                                          </td>
                                      )}
                                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                          {key.stats?.totalRequests24h?.toLocaleString() || 0}
                                      </td>
                                  </tr>
                              ))}
                              {apiKeys.length === 0 && (
                                  <tr>
                                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                          No keys found. <Link to="/console/credentials" className="text-primary-600 hover:underline">Create one</Link>
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </Card>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
              {/* Endpoint Breakdown */}
              <Card title="Usage by Service">
                  <div className="space-y-4 mt-2">
                      {detailedStats?.byService.map((stat, i) => (
                          <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="font-mono text-slate-600 dark:text-slate-300">{stat.label}</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{stat.percentage}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className={`h-full bg-primary-500`} style={{width: `${stat.percentage}%`}}></div>
                              </div>
                          </div>
                      ))}
                      {(!detailedStats?.byService || detailedStats.byService.length === 0) && (
                          <div className="text-center py-4 text-xs text-slate-400">No service usage data</div>
                      )}
                  </div>
              </Card>

              {/* Quick Resources */}
              <Card title="Quick Resources">
                  <div className="space-y-2">
                      <a href="#" className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                                      <FileText size={18} />
                                  </div>
                                  <div>
                                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600">API Documentation</div>
                                      <div className="text-xs text-slate-500">Integration guides & refs</div>
                                  </div>
                              </div>
                              <ExternalLink size={14} className="text-slate-400 group-hover:text-primary-500" />
                          </div>
                      </a>
                      
                      <Link to="/console/credentials" className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded">
                                      <Code size={18} />
                                  </div>
                                  <div>
                                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600">Developer Tools</div>
                                      <div className="text-xs text-slate-500">Manage keys & webhooks</div>
                                  </div>
                              </div>
                              <ExternalLink size={14} className="text-slate-400 group-hover:text-primary-500" />
                          </div>
                      </Link>
                  </div>
              </Card>
          </div>
       </div>
    </div>
  );
};

// Helper Component for consistent Metric Cards
const MetricCard = ({ icon: Icon, label, value, subValue, color, link }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
        red: 'bg-red-100 text-red-600 dark:bg-red-900/30',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
        teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30',
    };

    const CardContent = (
        <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon size={20} />
                </div>
                {link && <ExternalLink size={14} className="text-slate-300 hover:text-slate-500 transition-colors" />}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-xs text-slate-400 mt-1">{subValue}</p>
            </div>
        </div>
    );

    if (link) {
        return (
            <Link to={link} className="block h-full">
                <Card className="p-5 h-full hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    {CardContent}
                </Card>
            </Link>
        );
    }

    return (
        <Card className="p-5 h-full">
            {CardContent}
        </Card>
    );
};