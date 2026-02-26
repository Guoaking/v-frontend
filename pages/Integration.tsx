
import React, { useState } from 'react';
import { Code2, Smartphone, Server, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../App';
import { TRANSLATIONS } from '../constants';
import { Card, Button } from '../components/UI';
import { Link } from 'react-router-dom';

export const Integration: React.FC = () => {
    const { user } = useAuth();
    const { lang } = useTheme();
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState<'web' | 'ios' | 'android'>('web');
    const [copied, setCopied] = useState(false);

    // FIX: Safe access to API keys to prevent crash if array is empty or undefined
    const activeKey = user?.apiKeys?.find(k => k.status === 'active');
    // Fallback to first key if no active key, or a placeholder string
    // Secret is optional on ApiKey type, so we use optional chaining
    const apiKey = activeKey?.secret || user?.apiKeys?.[0]?.secret || '<YOUR_API_KEY>';
    const hasKeys = user?.apiKeys && user.apiKeys.length > 0;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const snippets = {
        web: `import { Verilocale } from '@verilocale/js-sdk';

// Initialize
const vl = new Verilocale('${apiKey}');

// Capture & Verify ID
vl.mount('#verify-container', {
  flow: 'document_verification',
  onSuccess: (result) => {
    console.log('Verification ID:', result.id);
  }
});`,
        ios: `import VerilocaleSDK

// AppDelegate.swift
Verilocale.configure(apiKey: "${apiKey}")

// ViewController.swift
let config = VLConfig(flow: .documentVerification)
let vc = VerilocaleViewController(config: config)
vc.delegate = self
present(vc, animated: true)`,
        android: `import com.verilocale.sdk.Verilocale

// MainActivity.kt
Verilocale.init(this, "${apiKey}")

// Launch Flow
val intent = Verilocale.createIntent(this, VerilocaleFlow.DOCUMENT_VERIFICATION)
startActivityForResult(intent, REQUEST_CODE)`
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.console.integration}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Drop-in SDKs for web and mobile applications.</p>
            </div>

            {!hasKeys && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">No API Key Detected</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            You need an API key to use the SDK. 
                            <Link to="/console/credentials" className="underline ml-1 font-medium hover:text-yellow-900">Create one here</Link>.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setActiveTab('web')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'web' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Code2 size={18} /> Web / JS
                </button>
                <button 
                    onClick={() => setActiveTab('ios')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ios' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Smartphone size={18} /> iOS
                </button>
                <button 
                    onClick={() => setActiveTab('android')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'android' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Smartphone size={18} /> Android
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-[#0d1117] border-slate-800 p-0 overflow-hidden text-slate-300">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-[#161b22]">
                            <span className="text-xs font-mono">
                                {activeTab === 'web' ? 'npm install @verilocale/js-sdk' : activeTab === 'ios' ? 'pod \'VerilocaleSDK\'' : 'implementation \'com.verilocale:sdk:1.0.0\''}
                            </span>
                            <button onClick={() => handleCopy(snippets[activeTab])} className="text-slate-400 hover:text-white">
                                {copied ? <Check size={16}/> : <Copy size={16}/>}
                            </button>
                        </div>
                        <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                            {snippets[activeTab]}
                        </pre>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <Card title="Resources">
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/developers" className="text-primary-600 hover:underline block">Full API Reference &rarr;</Link></li>
                            <li><a href="#" className="text-primary-600 hover:underline block">GitHub Repository &rarr;</a></li>
                            <li><a href="#" className="text-primary-600 hover:underline block">Status Page &rarr;</a></li>
                        </ul>
                    </Card>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm mb-2">Need Help?</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Our engineers are available on Slack for integration support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
