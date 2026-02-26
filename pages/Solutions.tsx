
import React from 'react';
import { Landmark, Stethoscope, Building2, ShoppingBag, Car, Phone } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';

export const Solutions: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang].solutions;
  
  const industryConfig = [
    { key: 'banking', icon: Landmark, color: 'blue' },
    { key: 'insurance', icon: Stethoscope, color: 'green' },
    { key: 'government', icon: Building2, color: 'yellow' },
    { key: 'commerce', icon: ShoppingBag, color: 'red' },
    { key: 'mobility', icon: Car, color: 'blue' },
    { key: 'telecom', icon: Phone, color: 'green' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            {t.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industryConfig.map((config, idx) => {
            const industryData = t.industries[config.key as keyof typeof t.industries];
            return (
                <Card key={idx} className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-lg ${config.color === 'blue' ? 'bg-blue-100 text-blue-600' : config.color === 'green' ? 'bg-teal-100 text-teal-600' : config.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    <config.icon size={24} />
                    </div>
                    <Badge color={config.color as any}>{industryData.title}</Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{industryData.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                    {industryData.desc}
                </p>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {industryData.kpis.map((k, i) => (
                        <span key={i}>{k}</span>
                    ))}
                    </div>
                </div>
                </Card>
            );
          })}
        </div>

        {/* Case Study Teaser */}
        <div className="mt-24 bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-700">
            <div className="md:w-2/3">
                <h4 className="text-primary-600 font-semibold uppercase tracking-wide mb-2">{t.case_study.title}</h4>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.case_study.subtitle}</h3>
                <p className="text-slate-600 dark:text-slate-400">
                    {t.case_study.desc}
                </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
                <Button variant="primary">{t.case_study.cta}</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
