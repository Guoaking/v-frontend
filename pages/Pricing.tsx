
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/UI';
import { PRICING_PLANS, TRANSLATIONS } from '../constants';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

export const Pricing: React.FC = () => {
    const { lang } = useTheme();
    const { user } = useAuth();
    const t = TRANSLATIONS[lang];

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Pricing Plans</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Transparent pricing for businesses of all sizes. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PRICING_PLANS.map((plan) => (
                        <div key={plan.id} className="relative p-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col hover:shadow-xl transition-shadow duration-300">
                            {plan.id === 'growth' && (
                                <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    POPULAR
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.price}</span>
                                <span className="ml-1 text-slate-500">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check size={18} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            {user ? (
                                <Link to="/console/billing">
                                    <Button variant={plan.id === 'growth' ? 'primary' : 'outline'} className="w-full">
                                        Choose Plan
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/register">
                                    <Button variant={plan.id === 'growth' ? 'primary' : 'outline'} className="w-full">
                                        Get Started
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
