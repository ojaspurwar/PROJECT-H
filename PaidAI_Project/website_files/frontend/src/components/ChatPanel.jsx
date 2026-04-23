import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatPanel = () => {
    const { token, user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Gemini H-Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [remaining, setRemaining] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !token) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/chat', {
                messages: [...messages, userMessage]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
            setRemaining(response.data.remaining);
        } catch (error) {
            console.error('Chat Error:', error);
            const detailedError = error.response?.data?.details || 'Session expired or error occurred.';
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, I encountered an error: ${detailedError}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Project H AI</h3>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Always active • Secure</p>
                    </div>
                </div>
                {remaining !== null && (
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold border border-white/5 text-primary">
                        {remaining} Messages Left Today
                    </div>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse text-right' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/10'}`}>
                                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-primary" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/5 border border-white/5 rounded-bl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-spin">
                                <Loader2 size={14} className="text-primary" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs opacity-50">Thinking...</div>
                        </div>
                    </div>
                )}
            </div>

            {/* InputArea */}
            <div className="p-6 border-t border-white/5 bg-white/5">
                <div className="relative flex items-center">
                    <input 
                        className="w-full glass p-4 pr-16 rounded-2xl outline-none text-sm placeholder:opacity-30 focus:ring-1 ring-primary/30 transition-all"
                        placeholder="Type your prompt here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading}
                        className={`absolute right-2 p-3 rounded-xl transition-all ${input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'opacity-20 cursor-not-allowed'}`}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="mt-4 text-center text-[10px] opacity-30 flex items-center justify-center gap-2">
                    <Info size={10} /> Powered by Universal Project H API
                </p>
            </div>
        </div>
    );
};

export default ChatPanel;
