
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, RefreshCw, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';
import { RequestLog } from '../../types';
import { Button, Card, Badge } from '../../components/UI';
import { consoleService } from '../../services/console';

export const RequestLogs: React.FC = () => {
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].console;
    const [searchParams] = useSearchParams();
    const keyIdFilter = searchParams.get('key_id');
    
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await consoleService.getRequestLogs({
                page, 
                limit: 15,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: search || undefined,
                keyId: keyIdFilter || undefined
            });
            if (res.success && res.data) {
                setLogs(res.data.items || []);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setLogs([]);
            }
        } catch (e) {
            console.error("Failed to fetch logs", e);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLogs();
    }, [page, filterStatus, keyIdFilter]); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusColor = (code: number) => {
        if (code >= 200 && code < 300) return 'green';
        if (code >= 400 && code < 500) return 'yellow';
        return 'red';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.logs}</h1>
                {keyIdFilter && (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm border border-blue-100 dark:border-blue-900">
                        <Filter size={14} />
                        <span>Filtered by Key ID: {keyIdFilter.substr(0, 8)}...</span>
                        <a href="/console/logs" className="ml-2 p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full" onClick={(e) => {
                            e.preventDefault();
                            window.history.pushState({}, '', '/console/logs'); 
                            window.location.reload(); 
                        }}>
                            <X size={14} />
                        </a>
                    </div>
                )}
            </div>
            
            <Card>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search paths..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select 
                            value={filterStatus} 
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success (2xx)</option>
                            <option value="error">Error (4xx/5xx)</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={fetchLogs} isLoading={loading}>
                            <RefreshCw size={16}/>
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Method</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Path</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Key (Owner)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Status</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Latency</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading && logs.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No requests found.</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {log.method}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400 text-xs">
                                        {log.path}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {log.keyName ? (
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                    <Key size={12} /> {log.keyName}
                                                </span>
                                                {log.keyOwner && (
                                                    <span className="text-slate-400 text-[10px] ml-4">
                                                        by {log.keyOwner}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusColor(log.statusCode)}>{log.statusCode}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {log.latency}ms
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-mono">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                    <span className="text-xs text-slate-500">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1 || loading}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
