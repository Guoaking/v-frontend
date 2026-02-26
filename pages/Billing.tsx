
import React, { useEffect, useState } from 'react';
import { CreditCard, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Card, Button, Badge } from '../components/UI';
import { Skeleton } from '../components/Skeleton';
import { Plan, Invoice, UsageSummary } from '../types';
import { orgService } from '../services/org';

export const Billing: React.FC = () => {
    const { user } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang].billing;
    
    const [billingData, setBillingData] = useState<{ plan: Plan | null, invoices: Invoice[], usageSummary: UsageSummary | null }>({
        plan: null,
        invoices: [],
        usageSummary: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            setLoading(true);
            const res = await orgService.getBilling();
            if (res.success && res.data) setBillingData(res.data);
            setLoading(false);
        }
        fetchBilling();
    }, []);
    
    if (!user) return null;

    const { plan, invoices, usageSummary } = billingData;
    const currentUsage = usageSummary?.totalRequests || 0;
    const limit = usageSummary?.limit || plan?.requestsLimit || 1000;
    const usagePercent = usageSummary?.percentUsed || (currentUsage / limit) * 100;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{TRANSLATIONS[lang].console.billing}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div>
                                    <Skeleton width="150px" height="1.5rem" className="mb-2" />
                                    <Skeleton width="100px" height="1rem" />
                                </div>
                                <Skeleton width="60px" height="1.5rem" variant="rectangular" />
                            </div>
                            <Skeleton height="8px" className="w-full mt-4" variant="rectangular" />
                            <div className="flex gap-4 mt-6">
                                <Skeleton width="100px" height="2rem" variant="rectangular" />
                                <Skeleton width="100px" height="2rem" variant="rectangular" />
                            </div>
                        </div>
                    ) : (
                    <>
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{plan?.name || 'Free'} {t.plan}</h3>
                            <p className="text-sm text-slate-500">${plan?.price || 0}/{TRANSLATIONS[lang].common.month}</p>
                        </div>
                        <Badge color="blue">{TRANSLATIONS[lang].common.active}</Badge>
                    </div>
                    
                    <div className="mb-6">
                         <div className="flex justify-between text-sm mb-2">
                             <span className="text-slate-600 dark:text-slate-400">{t.usage_limit}</span>
                             <span className="font-medium text-slate-900 dark:text-white">{currentUsage.toLocaleString()} / {limit.toLocaleString()}</span>
                         </div>
                         <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                             ></div>
                         </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" size="sm">{t.upgrade}</Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">{t.cancel_sub}</Button>
                    </div>
                    </>
                    )}
                </Card>

                <Card title={t.payment_method}>
                    {loading ? <Skeleton height="60px" variant="rectangular" /> : (
                        <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Visa ending in 4242</p>
                                <p className="text-xs text-slate-500">{t.expires} 12/24</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">{t.update_card}</Button>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};
