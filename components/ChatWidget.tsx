
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, History, ChevronLeft, Trash2, Plus, Minimize2, Sparkles, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../App';
import { sendMessageToGemini, ChatMessage } from '../lib/ai';
import { TRANSLATIONS } from '../constants';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export const ChatWidget: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang].chat;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Current active chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // History state
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('verilocale_chat_history');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  // Save history whenever sessions change
  useEffect(() => {
    localStorage.setItem('verilocale_chat_history', JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view, isOpen]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    setMessages([{
      role: 'model',
      text: t.welcome,
      timestamp: Date.now()
    }]);
    setCurrentSessionId(newId);
    setView('chat');
  };

  const updateCurrentSession = (newMessages: ChatMessage[]) => {
    if (!currentSessionId) return;

    setSessions(prev => {
      const existing = prev.find(s => s.id === currentSessionId);
      const title = existing?.title || (newMessages.find(m => m.role === 'user')?.text.slice(0, 30) || 'New Conversation');
      
      const updatedSession: ChatSession = {
        id: currentSessionId,
        title: title,
        messages: newMessages,
        lastUpdated: Date.now()
      };

      // Remove existing and add updated to top
      const filtered = prev.filter(s => s.id !== currentSessionId);
      return [updatedSession, ...filtered];
    });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      updateCurrentSession(updated); // Update storage immediately
      return updated;
    });
    
    setInputText('');
    setIsLoading(true);

    // If this is the first message of a session (or auto-started), ensure we track ID
    if (!currentSessionId) {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
    }

    try {
      const responseText = await sendMessageToGemini(userMsg.text, messages, lang);
      
      const botMsg: ChatMessage = {
        role: 'model',
        text: responseText || t.error_response,
        timestamp: Date.now()
      };

      setMessages(prev => {
        const updated = [...prev, botMsg];
        updateCurrentSession(updated);
        return updated;
      });

    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setView('chat');
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // Initial welcome
  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentSessionId) {
        createNewSession();
    }
  }, [isOpen]);

  // Update welcome message if language changes and it's the only message
  useEffect(() => {
      if (messages.length === 1 && messages[0].role === 'model' && currentSessionId) {
          setMessages([{ ...messages[0], text: t.welcome }]);
      }
  }, [lang]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-primary-600 to-accent-400 rounded-full shadow-lg hover:shadow-primary-500/50 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-50 group"
      >
        <MessageSquare size={26} className="group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] md:w-[420px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 z-50 animate-slide-up">
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
            {view === 'history' ? (
                <button onClick={() => setView('chat')} className="text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
            ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white">
                    <Sparkles size={16} />
                </div>
            )}
            <div>
                <h3 className="text-white font-bold text-sm">VeriBot AI</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </p>
            </div>
        </div>
        <div className="flex items-center gap-1">
            {view === 'chat' && (
                <button 
                    onClick={() => setView('history')} 
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title={t.history}
                >
                    <History size={18} />
                </button>
            )}
            <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                <Minimize2 size={18} />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
        
        {view === 'history' ? (
            <div className="h-full flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t.history}</h4>
                    <button 
                        onClick={createNewSession}
                        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-2 py-1.5 rounded-md"
                    >
                        <Plus size={14} /> {t.new_chat}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {sessions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <History size={48} className="mb-2" />
                            <p>{t.no_history}</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div 
                                key={session.id}
                                onClick={() => loadSession(session)}
                                className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                    currentSessionId === session.id 
                                    ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-900' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{session.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(session.lastUpdated).toLocaleDateString()} • {new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-slate-600 dark:text-slate-300" />
                                </div>
                            )}
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-primary-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                            }`}>
                                {msg.role === 'model' ? (
                                    <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-code:text-xs">
                                        <ReactMarkdown 
                                            components={{
                                                code({children}) {
                                                    return <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono">{children}</code>
                                                }
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <User size={16} className="text-slate-600 dark:text-slate-300" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-bl-none">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={t.placeholder}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-sm max-h-32 text-slate-900 dark:text-white"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400">{t.powered_by}</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
