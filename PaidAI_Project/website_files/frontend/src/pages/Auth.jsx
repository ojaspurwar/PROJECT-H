import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemePicker from '../components/ThemePicker';

const AuthCard = ({ title, children, footer }) => (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f1a] text-white relative overflow-hidden px-4 md:px-6 py-12 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <header className="absolute top-0 w-full p-8 flex justify-center md:justify-end z-10 scale-90 md:scale-100">
            <ThemePicker />
        </header>

        <div className="w-full max-w-5xl glass rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col md:flex-row items-stretch animate-fade-in shadow-2xl border border-white/10 relative">
            {/* Art Side - Hidden on small mobile */}
            <div className="hidden lg:flex w-[45%] p-12 flex-col justify-between bg-white/[0.02] border-r border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
                <div>
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-12 shadow-lg shadow-primary/20">H</div>
                    <h1 className="text-5xl font-extrabold leading-[1.1] mb-8 tracking-tight">Access <br/><span className="text-primary italic">Universal</span> Intelligence.</h1>
                    <p className="text-lg opacity-50 font-medium leading-relaxed font-outfit">The world's most powerful universal AI engine. Elite performance, secured protocols.</p>
                </div>
                <div className="opacity-20 font-bold text-xs tracking-[0.3em] uppercase italic font-outfit">Project H Universal Intel</div>
            </div>

            {/* Form Side */}
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">{title}</h2>
                    <p className="text-sm opacity-50 font-bold uppercase tracking-widest leading-none font-outfit">Identity Authentication Protocol</p>
                </div>
                
                <div className="w-full">
                    {children}
                </div>

                <div className="mt-12 text-[10px] font-black opacity-20 italic tracking-[0.3em] uppercase text-center md:text-left border-t border-white/5 pt-6 font-outfit">
                    {footer}
                </div>
            </div>
        </div>
    </div>
);

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
            const res = await axios.post(`${apiBase}/api/auth/login`, { username, password });
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <AuthCard 
            title="Welcome Back"
            footer="SECURED BY PROJECT H GLOBAL PROTOCOLS"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 group-focus-within:text-primary transition-colors font-outfit">Identity</label>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-white transition-all font-bold font-outfit"
                        required
                    />
                </div>
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 group-focus-within:text-primary transition-colors font-outfit">Security Key</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-white transition-all font-bold font-outfit"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-xs font-black uppercase tracking-widest px-1 animate-fade-in font-outfit">{error}</p>}
                <button 
                    type="submit"
                    className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 font-outfit"
                >
                    Initialize Access
                </button>
            </form>
            <p className="mt-8 text-sm opacity-50 text-center font-medium font-outfit">
                New user? <a href="/register" className="text-primary hover:underline font-bold uppercase tracking-tighter">Establish Identity</a>
            </p>
        </AuthCard>
    );
};

export const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
            await axios.post(`${apiBase}/api/auth/register`, { username, password });
            const res = await axios.post(`${apiBase}/api/auth/login`, { username, password });
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Identity establishment failed');
        }
    };

    return (
        <AuthCard 
            title="Create Identity"
            footer="NEW NODE REGISTRATION ACTIVE"
        >
           <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 group-focus-within:text-primary transition-colors font-outfit">New Identity</label>
                    <input 
                        type="text" 
                        placeholder="Choose Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-white transition-all font-bold font-outfit"
                        required
                    />
                </div>
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 group-focus-within:text-primary transition-colors font-outfit">Security Key</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-primary/50 text-white transition-all font-bold font-outfit"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-xs font-black uppercase tracking-widest px-1 animate-fade-in font-outfit">{error}</p>}
                <button 
                    type="submit"
                    className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 font-outfit"
                >
                    Create Node
                </button>
            </form>
            <p className="mt-8 text-sm opacity-50 text-center font-medium font-outfit">
                Existing identity? <a href="/login" className="text-primary hover:underline font-bold uppercase tracking-tighter">Access Terminal</a>
            </p>
        </AuthCard>
    );
};
