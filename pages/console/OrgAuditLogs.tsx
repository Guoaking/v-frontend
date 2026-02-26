
import React, { useState, useEffect } from 'react';
import { ChevronDown, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';
import { AuditLog } from '../../types';
import { Button, Card, Badge } from '../../components/UI';
import { consoleService } from '../../services/console';

export const OrgAuditLogs: React.FC = () => {
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].admin; 
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('all');
    
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const res = await consoleService.getAuditLogActions();
                if (res.success && res.data) {
                    setAvailableActions(res.data);
                }
            } catch (e) {
                console.error("Failed to load audit actions", e);
            }
        };
        fetchActions();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const res = await consoleService.getOrgAuditLogs({ page, limit: 15, action: actionFilter });
        if (res.success && res.data) {
            setLogs(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } else {
            setLogs([]);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await consoleService.exportOrgAuditLogs({ 
                action: actionFilter !== 'all' ? actionFilter : undefined 
            });
            
            if (res.success && res.data) {
                const url = window.URL.createObjectURL(res.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert("Failed to export logs: " + (res.error || "Unknown error"));
            }
        } catch (e) {
            console.error("Export error:", e);
            alert("An error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">Track security events and sensitive actions within your organization.</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <select 
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                            className="appearance-none block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Actions</option>
                            {availableActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>

                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleExport} 
                        isLoading={isExporting}
                        className="flex items-center gap-2"
                    >
                        <FileSpreadsheet size={16} />
                        Export
                    </Button>
                </div>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Timestamp</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">User</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Action</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Details</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">{TRANSLATIONS[lang].common.loading}</td></tr>
                             ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">No audit records found.</td></tr>
                             ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                {log.userName?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color="blue">{log.action}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {log.target}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                        {log.ip}
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
};
