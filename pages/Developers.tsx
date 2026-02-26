
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, Play, Copy, Check, Hash, FileText, Server, Code, Layers, ChevronDown, ChevronUp, Globe, AlertTriangle, ShieldCheck, ChevronLeft, Menu } from 'lucide-react';
import { Button, Badge, Card } from '../components/UI';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { DOCS_DATA } from '../apiDocs';
import { DocSection, ApiEndpoint, ApiField } from '../types';
import { OAuth } from './OAuth'; 
import { CONFIG } from '../services/config';

export const Developers: React.FC = () => {
  const { lang } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const docs = DOCS_DATA[lang];
  const [activeSectionId, setActiveSectionId] = useState(docs[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for sidebar expansion
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
      const initial: Record<string, boolean> = {};
      docs.forEach(d => initial[d.id] = true); // Default expand all top levels
      return initial;
  });

  const toggleSection = (id: string) => {
      setExpandedSections(prev => ({
          ...prev,
          [id]: !prev[id]
      }));
  };

  // Helper to flatten docs for easier navigation finding
  const findSection = (sections: DocSection[], id: string): DocSection | undefined => {
    for (const sec of sections) {
      if (sec.id === id) return sec;
      if (sec.subsections) {
        const found = findSection(sec.subsections, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const activeDoc = findSection(docs, activeSectionId) || docs[0];

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen flex flex-col lg:flex-row relative">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* 1. Sidebar Navigation (Collapsible) */}
      <div 
        className={`fixed lg:sticky top-20 h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-40 flex flex-col
            ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden opacity-0 lg:opacity-100 lg:border-none'}`}
      >
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${!isSidebarOpen && 'hidden'}`}>
          <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest text-opacity-70 flex items-center gap-2">
                  <Code size={16} className="text-primary-500" /> API Reference
              </h5>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                  <ChevronLeft size={20} />
              </button>
          </div>

          <nav className="space-y-1 mb-8">
            {docs.map((section) => (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => {
                      if (section.subsections && section.subsections.length > 0) {
                          toggleSection(section.id);
                      } else {
                          setActiveSectionId(section.id);
                          if(window.innerWidth < 1024) setIsSidebarOpen(false);
                      }
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-between group ${
                    activeSectionId === section.id 
                      ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate pr-2">{section.title}</span>
                  {section.subsections && section.subsections.length > 0 && (
                      <span className="text-slate-400 flex-shrink-0">
                          {expandedSections[section.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                  )}
                </button>
                
                {/* Subsections */}
                {section.subsections && expandedSections[section.id] && (
                   <div className="mt-1 ml-3 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-3 animate-fade-in">
                      {section.subsections.map(sub => (
                         <button
                            key={sub.id}
                            onClick={() => {
                                setActiveSectionId(sub.id);
                                if(window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-between ${
                                activeSectionId === sub.id 
                                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                            }`}
                         >
                             <span className="truncate pr-2">{sub.title}</span>
                             {activeSectionId === sub.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>}
                         </button>
                      ))}
                   </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* My Apps Section at Bottom - REMOVED, Moved to Console */}
        {/* <div className={`p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 ${!isSidebarOpen && 'hidden'}`}>
            <button
                onClick={() => {
                    handleMyAppClick();
                    if(window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSectionId === 'my_apps' 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
                }`}
            >
                <ShieldCheck size={20} />
                <span className="font-bold text-sm">My App</span>
            </button>
        </div> */}
      </div>

      {/* Toggle Button (Visible when sidebar closed) */}
      {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-24 left-4 z-30 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-slate-500 hover:text-primary-600 transition-colors"
          >
              <Menu size={20} />
          </button>
      )}

      {/* 2. Main Content Column */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
          <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
             <div className="animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                             <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 shadow-sm">
                                {activeDoc.api ? <Server size={28} /> : <FileText size={28} />}
                             </div>
                             <div className="min-w-0">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 truncate">{activeDoc.title}</h1>
                                {activeDoc.api && (
                                    <p className="text-sm text-slate-500 font-mono break-all">{activeDoc.api.method} {activeDoc.api.path}</p>
                                )}
                             </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed mb-10 whitespace-pre-wrap">
                            <ReactMarkdown
                                components={{
                                    code({children}) {
                                        return <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono text-sm">{children}</code>
                                    },
                                    pre({children}) {
                                        return <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">{children}</pre>
                                    }
                                }}
                            >
                                {activeDoc.content || ''}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Structured Table Data (e.g., Error Codes) */}
                        {activeDoc.tableData && (
                            <div className="mb-12 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80">
                                            <tr>
                                                {activeDoc.tableData.headers.map((h, i) => (
                                                    <th key={i} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                                            {activeDoc.tableData.rows.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                                            {cIdx === 0 ? <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{cell}</span> : 
                                                             cIdx === 1 ? <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{cell}</code> :
                                                             cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* API Definition */}
                        {activeDoc.api && (
                            <div className="space-y-12">
                                
                                {/* 1. Endpoint & Headers */}
                                <section>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <Globe size={18} className="mr-2 text-slate-400"/> Endpoint & Headers
                                    </h3>
                                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 mb-6">
                                        <div className="flex items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
                                            <Badge color={activeDoc.api.method === 'POST' ? 'blue' : 'green'}>{activeDoc.api.method}</Badge>
                                            <span className="ml-3 font-mono text-sm text-white truncate flex-1">{activeDoc.api.path}</span>
                                            <div className="ml-auto flex gap-2">
                                                <CopyButton text={`${CONFIG.API_BASE_URL}${activeDoc.api.path}`} label="URL" />
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="flex text-xs font-mono text-slate-400">
                                                <span className="w-32 shrink-0">Content-Type:</span>
                                                <span className="text-slate-300">{activeDoc.api.requestBody?.some(f=>f.type==='file') ? 'multipart/form-data' : 'application/json'}</span>
                                            </div>
                                            <div className="flex text-xs font-mono text-slate-400">
                                                <span className="w-32 shrink-0">Authorization:</span>
                                                <span className="text-slate-300">Bearer &lt;ACCESS_TOKEN&gt;</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 2. Request Parameters */}
                                {activeDoc.api.requestBody && activeDoc.api.requestBody.length > 0 && (
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                            <Hash size={18} className="mr-2 text-slate-400"/> Request Parameters
                                        </h3>
                                        <SchemaTable fields={activeDoc.api.requestBody} />
                                    </section>
                                )}

                                {/* 3. Request Example */}
                                <section>
                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                            <Code size={18} className="mr-2 text-slate-400"/> Request Example
                                        </h3>
                                        {activeDoc.api.playgroundLink && (
                                            <Link to={`/playground?${activeDoc.api.playgroundLink}`}>
                                                <button className="text-xs text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-200 dark:border-primary-900/50 flex items-center gap-1 font-medium px-3 py-1.5 rounded-full transition-all">
                                                    <Play size={10} /> Open in Playground
                                                </button>
                                            </Link>
                                        )}
                                     </div>
                                     <CodeBlock endpoint={activeDoc.api} />
                                </section>

                                {/* 4. Response Schema */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <Layers size={18} className="mr-2 text-slate-400"/> Response Schema
                            </h3>
                            <div className="space-y-6">
                                {activeDoc.api.responses.filter(r => r.code === 200).map((resp, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge color="green">200 OK</Badge>
                                            <span className="text-sm text-slate-500">{resp.description}</span>
                                        </div>
                                        <SchemaTable fields={resp.schema} />
                                    </div>
                                ))}
                                {activeDoc.api.responses.filter(r => r.code !== 200).length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Error Responses</h4>
                                        <div className="grid gap-2">
                                            {activeDoc.api.responses.filter(r => r.code !== 200).map((resp, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <Badge color="red">{resp.code}</Badge>
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">{resp.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};

// ... Helper Components ...

const CopyButton: React.FC<{ text: string, label?: string }> = ({ text, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
        >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {label && <span>{label}</span>}
        </button>
    );
};

const SchemaTable: React.FC<{ fields: ApiField[], isResponse?: boolean }> = ({ fields, isResponse }) => {
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-sm shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Field</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/6">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                        {fields.map((field) => (
                            <SchemaRow key={field.name} field={field} depth={0} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SchemaRow: React.FC<{ field: ApiField, depth: number }> = ({ field, depth }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = field.children && field.children.length > 0;

    return (
        <>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                        {hasChildren && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mr-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        )}
                        {!hasChildren && depth > 0 && <span className="w-5 mr-1"></span>}
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 text-xs">
                            {field.name}
                        </span>
                        {field.required && (
                            <span className="ml-2 text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-1.5 rounded" title="Required">REQ</span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {field.type}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {field.description}
                        {field.enum && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                <span className="text-[10px] text-slate-400 mr-1">Values:</span>
                                {field.enum.map(v => (
                                    <code key={v} className="text-[10px] bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900 px-1 rounded">
                                        "{v}"
                                    </code>
                                ))}
                            </div>
                        )}
                    </div>
                </td>
            </tr>
            {hasChildren && isExpanded && field.children!.map((child) => (
                <SchemaRow key={child.name} field={child} depth={depth + 1} />
            ))}
        </>
    );
};

const CodeBlock: React.FC<{ endpoint: ApiEndpoint }> = ({ endpoint }) => {
    const [copied, setCopied] = useState(false);
    const [lang, setLang] = useState<'curl' | 'python'>('curl');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getCurl = () => {
        const formData = endpoint.requestBody?.filter(f => !f.children);
        // Use dynamic Config Base URL
        const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, '');
        
        if (formData && formData.some(f => f.type === 'file')) {
             const parts = formData.map(f => `  -F "${f.name}=${f.type === 'file' ? '@image.jpg' : 'value'}"`).join(' \\\n');
             return `curl -X POST ${baseUrl}${endpoint.path} \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
${parts ? parts : ''}`;
        } else if (endpoint.requestBody && endpoint.requestBody.length > 0) {
             const body: any = {};
             endpoint.requestBody.forEach(f => body[f.name] = f.type === 'integer' ? 123 : "value");
             return `curl -X POST ${baseUrl}${endpoint.path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'`;
        } else {
             return `curl -X POST ${baseUrl}${endpoint.path}`;
        }
    };

    const getPython = () => {
        const hasFile = endpoint.requestBody?.some(f => f.type === 'file');
        // Use dynamic Config Base URL
        const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, '');
        
        if (hasFile) {
            return `import requests

url = "${baseUrl}${endpoint.path}"
headers = {"Authorization": "Bearer <ACCESS_TOKEN>"}
files = {
    ${endpoint.requestBody?.filter(f=>f.type==='file').map(f => `"${f.name}": open("image.jpg", "rb")`).join(',\n    ')}
}
data = {
    ${endpoint.requestBody?.filter(f=>f.type!=='file').map(f => `"${f.name}": "value"`).join(',\n    ')}
}

resp = requests.post(url, headers=headers, files=files, data=data)
print(resp.json())`;
        } else {
             return `import requests

url = "${baseUrl}${endpoint.path}"
data = {
    ${endpoint.requestBody?.map(f => `"${f.name}": "value"`).join(',\n    ')}
}

resp = requests.post(url, json=data)
print(resp.json())`;
        }
    };

    const code = lang === 'curl' ? getCurl() : getPython();

    return (
        <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-slate-800">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setLang('curl')}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${lang === 'curl' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        cURL
                    </button>
                    <button 
                        onClick={() => setLang('python')}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${lang === 'python' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Python
                    </button>
                </div>
                <button onClick={() => handleCopy(code)} className="text-slate-400 hover:text-white">
                    {copied ? <Check size={14}/> : <Copy size={14}/>}
                </button>
            </div>
            <div className="p-4 overflow-x-auto custom-scrollbar">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{code}</pre>
            </div>
        </div>
    );
};
