
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Activity, Filter, ChevronDown, Check, Clock, Zap } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../PermissionContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Card } from '../components/UI';
import { consoleService } from '../services/console';
import { DetailedUsageStats } from '../types';

export const Usage: React.FC = () => {
    const { user } = useAuth();
    const { can } = usePermissions();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang];
    
    const [period, setPeriod] = useState<'7d' | '30d'>('30d');
    const [stats, setStats] = useState<DetailedUsageStats | null>(null);
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
        const fetchUsage = async () => {
            setLoading(true);
            // In a real implementation, scope would be passed to getDetailedUsageStats
            const res = await consoleService.getDetailedUsageStats(period);
            if (res.success && res.data) {
                setStats(res.data);
            }
            setLoading(false);
        };
        fetchUsage();
    }, [period, scope]);

    if (!user) return null;

    const totalReqs = stats?.totalRequests || 0;
    const errorRate = totalReqs > 0 ? ((stats?.totalErrors || 0) / totalReqs * 100).toFixed(2) : '0';
    const maxReq = Math.max(...(stats?.timeline.map(d => d.requests) || []), 10);
    const usageData = stats?.timeline || [];

    return (
        <div className="space-y-6 animate-fade-in" onClick={() => isFilterOpen && setIsFilterOpen(false)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.console.usage}</h1>
                    <p className="text-sm text-slate-500 mt-1">Track your API consumption, quotas, and service breakdown.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Scope Filter */}
                    <div className="relative">
                        {hasOrgAccess ? (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-medium text-slate-700 dark:text-slate-200"
                                >
                                    <Filter size={14} className="text-slate-400" />
                                    <span>{scope === 'org' ? 'All Organization' : 'My Personal Data'}</span>
                                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-20 animate-fade-in overflow-hidden">
                                        <div className="p-1">
                                            <button
                                                onClick={() => setScope('org')}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors ${scope === 'org' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            >
                                                <span>All Organization</span>
                                                {scope === 'org' && <Check size={12} />}
                                            </button>
                                            <button
                                                onClick={() => setScope('personal')}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors ${scope === 'personal' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            >
                                                <span>My Personal Data</span>
                                                {scope === 'personal' && <Check size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed" title="You only have access to your own data">
                                <Filter size={14} />
                                <span>My Personal Data</span>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {/* Period Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setPeriod('7d')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === '7d' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                        >
                            7 Days
                        </button>
                        <button 
                            onClick={() => setPeriod('30d')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === '30d' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                        >
                            30 Days
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Requests</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalReqs.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-600">
                        <TrendingUp size={14} className="mr-1" />
                        <span>Active</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Error Rate</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{errorRate}%</h3>
                        </div>
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                        Target: &lt; 1.0%
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Quota Used</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats?.quotaStatus.percentUsed.toFixed(1)}%
                            </h3>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${(stats?.quotaStatus.percentUsed || 0) > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{width: `${Math.min(stats?.quotaStatus.percentUsed || 0, 100)}%`}}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{stats?.quotaStatus.remaining.toLocaleString()} remaining</p>
                </Card>

                {/* New: Forecast Card */}
                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Est. Depletion</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {stats?.quotaStatus.forecastDepletionDate ? stats.quotaStatus.forecastDepletionDate : 'Safe'}
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                        Based on {period} avg
                    </div>
                </Card>
            </div>

            {/* Main Chart */}
            <Card title="Request Volume & Breakdown">
                <div className="h-64 flex items-end justify-between gap-2 px-4 pb-2 pt-6">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Loading charts...</div>
                    ) : usageData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <div className="bg-slate-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                    <div className="font-bold">{d.date}</div>
                                    <div>{d.requests} requests</div>
                                    <div className="text-red-300">{d.errors} errors</div>
                                    {d.services && (
                                        <div className="mt-1 border-t border-slate-700 pt-1">
                                            {Object.entries(d.services).map(([svc, count]) => (
                                                <div key={svc} className="flex justify-between gap-4">
                                                    <span className="capitalize text-slate-400">{svc}:</span>
                                                    <span>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Bar Stack */}
                            <div className="w-full max-w-[30px] flex flex-col justify-end h-full rounded-t-sm overflow-hidden bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {/* Error segment */}
                                <div 
                                    className="w-full bg-red-400/80 transition-all duration-500"
                                    style={{ height: d.requests > 0 ? `${(d.errors / maxReq) * 100}%` : '0%' }}
                                ></div>
                                {/* Success segment */}
                                <div 
                                    className="w-full bg-primary-500/80 transition-all duration-500"
                                    style={{ height: d.requests > 0 ? `${((d.requests - d.errors) / maxReq) * 100}%` : '0px' }}
                                ></div>
                            </div>
                            
                            {/* X Axis Label */}
                            {i % Math.ceil(usageData.length / 7) === 0 && (
                                <div className="text-[10px] text-slate-400 mt-2 absolute top-full w-20 text-center">
                                    {d.date.split('-').slice(1).join('/')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Usage by Service */}
                 <Card title="Usage by Service">
                    <div className="space-y-4">
                        {stats?.byService.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                    <span className="text-slate-500">{item.percentage}% ({item.count})</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{width: `${item.percentage}%`}}></div>
                                </div>
                            </div>
                        ))}
                         {!stats?.byService.length && <p className="text-sm text-slate-500">No data available</p>}
                    </div>
                </Card>

                {/* Usage by Key */}
                <Card title="Usage by Key">
                    <div className="space-y-4">
                        {stats?.byKey.map(key => (
                            <div key={key.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div>
                                    <div className="font-medium text-sm text-slate-900 dark:text-white">{key.label}</div>
                                    <div className="text-xs text-slate-500 font-mono">ID: {key.id.substring(0,8)}...</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-700 dark:text-slate-300">{key.count.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500">{key.percentage}%</div>
                                </div>
                            </div>
                        ))}
                        {!stats?.byKey.length && <p className="text-sm text-slate-500">No data available</p>}
                    </div>
                </Card>

                {/* Usage by Endpoint */}
                <Card title="Usage by Endpoint">
                    <div className="space-y-3">
                        {stats?.byEndpoint.map((ep, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-mono text-slate-600 dark:text-slate-300">{ep.label}</span>
                                    <span className="text-slate-500">{ep.percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{width: `${ep.percentage}%`}}></div>
                                </div>
                            </div>
                        ))}
                         {!stats?.byEndpoint.length && <p className="text-sm text-slate-500">No data available</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
