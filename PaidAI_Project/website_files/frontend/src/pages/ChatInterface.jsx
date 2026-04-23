import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Plus, MessageSquare, PanelLeftClose, PanelLeft, Bot, User, LogOut, Loader2, Sparkles, Menu, X } from 'lucide-react';
import ThemePicker from '../components/ThemePicker';

const getApiBase = () => {
    // Use relative path for Unified Build, fallback to localhost for Dev
    return window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
};

const API_BASE = getApiBase();

const ChatInterface = () => {
    const { token, user, logout } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchSessions();
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        if (currentSessionId) {
            fetchMessages(currentSessionId);
            if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
        } else {
            setMessages([]);
        }
    }, [currentSessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
            if (res.data.length > 0 && !currentSessionId) {
                setCurrentSessionId(res.data[0].id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await axios.get(`${API_BASE}/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };

    const handleNewChat = async () => {
        try {
            const res = await axios.post(`${API_BASE}/sessions`, { title: 'New Chat' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions([res.data, ...sessions]);
            setCurrentSessionId(res.data.id);
            setMessages([]);
        } catch (err) { console.error(err); }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        let sessionId = currentSessionId;
        if (!sessionId) {
            try {
                const res = await axios.post(`${API_BASE}/sessions`, { title: 'New Chat' }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                sessionId = res.data.id;
                setCurrentSessionId(sessionId);
                setSessions([res.data, ...sessions]);
            } catch (err) { return; }
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            await axios.post(`${API_BASE}/chat`, {
                messages: [...messages, userMessage],
                sessionId: sessionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMessages(sessionId);
            fetchSessions();
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Check backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0b0f1a] text-white overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[120px] -z-10" />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isSidebarOpen ? 'lg:w-80' : 'lg:w-0'}
                fixed lg:relative z-50 h-full glass border-r border-white/10 transition-all duration-300 flex flex-col
            `}>
                <div className={`${(isSidebarOpen || isMobileMenuOpen) ? 'opacity-100' : 'opacity-0'} flex flex-col h-full overflow-hidden w-80`}>
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tighter text-primary">Chat History</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white/50"><X size={20}/></button>
                    </div>

                    <div className="px-6 pb-2">
                        <button onClick={handleNewChat} className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold text-sm bg-primary/5 text-primary group">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 space-y-2 py-4 scrollbar-hide">
                        {sessions.map(sess => (
                            <button key={sess.id} onClick={() => setCurrentSessionId(sess.id)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left text-sm transition-all group ${currentSessionId === sess.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                <MessageSquare size={16} />
                                <span className="truncate flex-1 font-medium">{sess.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/10 space-y-4">
                        <div className="flex items-center gap-4 py-4 px-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                {user?.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate">{user?.username}</p>
                                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{user?.tier}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 text-red-500/60 hover:text-red-500 transition-all text-sm font-bold">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                <header className="absolute top-0 w-full h-20 flex items-center justify-between px-6 md:px-8 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2.5 glass rounded-xl text-primary transition-all"><Menu size={20} /></button>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block p-2.5 glass rounded-xl hover:text-primary transition-all">
                            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                        </button>
                    </div>
                    <ThemePicker />
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0 pt-24 pb-48 scrollbar-hide">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in px-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/10">
                                <Sparkles size={32} className="text-primary" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">How can I help you?</h3>
                            <p className="text-base md:text-lg text-muted max-w-md">The universal AI workspace is active.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-12 px-4 md:px-0">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 md:gap-6 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse text-right' : ''}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 text-primary border border-white/10'}`}>
                                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className="mt-1 md:mt-2.5 flex-1 overflow-hidden">
                                        <div className="text-base md:text-xl leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {isLoading && (
                        <div className="max-w-4xl mx-auto mt-12 flex gap-6 animate-pulse px-4 md:px-0">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Loader2 size={20} className="text-primary animate-spin" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 w-full p-4 md:p-8 bg-gradient-to-t from-[#0b0f1a] via-[#0b0f1a] to-transparent">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="relative flex items-end gap-3 md:gap-4 glass p-4 md:p-6 rounded-[28px] border border-white/10 shadow-2xl">
                            <textarea 
                                className="w-full bg-transparent outline-none text-base md:text-lg font-medium resize-none max-h-60 mt-1"
                                placeholder="Message..."
                                rows="1"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                                        e.preventDefault();
                                        handleSend();
                                        e.target.style.height = 'auto';
                                    }
                                }}
                            />
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className={`p-2.5 md:p-3 rounded-2xl transition-all shadow-xl ${input.trim() ? 'bg-primary text-white scale-110' : 'opacity-10 grayscale'}`}>
                                <Send size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatInterface;
