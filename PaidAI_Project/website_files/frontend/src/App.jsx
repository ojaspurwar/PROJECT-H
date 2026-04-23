import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemePicker from './components/ThemePicker';
import { Login, Register } from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import PricingPage from './pages/PricingPage';
import ChatInterface from './pages/ChatInterface';
import { Shield, LayoutDashboard, ArrowRight, Zap, Globe, LogOut, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [config, setConfig] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Relative path for the Unified Build
    axios.get(`/api/config`)
      .then(res => setConfig(res.data))
      .catch(err => {
        console.error("Config fetch failed", err);
        // Fallback for dev mode
        axios.get(`http://localhost:3001/api/config`)
          .then(res => setConfig(res.data))
          .catch(e => console.error("Total Local Failure", e));
      });
  }, []);

  if (!config) return <div className="h-screen flex items-center justify-center bg-[#0b0f1a] text-white font-black uppercase tracking-widest text-sm animate-pulse">Initializing...</div>;

  return (
    <div className="bg-[#0b0f1a] text-white relative flex flex-col items-center">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -z-10" />

      {/* Symmetric Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto glass rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-5 flex items-center justify-between border border-white/10 shadow-2xl">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform">H</div>
            <span className="text-xl md:text-2xl font-black tracking-tighter">{config.appName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold opacity-80">
            <Link to="/pricing" className="hover:text-primary transition-all">Pricing</Link>
            <Link to="/chat" className="hover:text-primary transition-all">AI Chat</Link>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <ThemePicker />
            {user ? (
                <div className="flex items-center gap-4 ml-4">
                    {user.role === 'admin' && <Link to="/admin" className="p-2.5 glass rounded-xl text-primary hover:bg-white/5 transition-colors"><LayoutDashboard size={20} /></Link>}
                    <Link to="/chat" className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-xl shadow-primary/20">
                        Dashboard <ArrowRight size={18} />
                    </Link>
                    <button onClick={logout} className="p-2.5 glass rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"><LogOut size={20} /></button>
                </div>
            ) : (
                <div className="flex items-center gap-6 ml-4">
                    <Link to="/login" className="hover:text-primary transition-all">Login</Link>
                    <Link to="/register" className="btn-primary px-8 py-2.5 rounded-xl shadow-xl shadow-primary/20">Get Started</Link>
                </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 glass rounded-xl text-primary transition-all">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-4 right-4 mt-4 glass rounded-3xl p-8 animate-fade-in border border-white/10 shadow-2xl z-50">
                <div className="flex flex-col gap-6 text-center">
                    <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black tracking-tight hover:text-primary">Pricing</Link>
                    <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black tracking-tight hover:text-primary">AI Workspace</Link>
                    <div className="h-px bg-white/10 w-full my-2" />
                    <div className="flex justify-center py-2"><ThemePicker /></div>
                    {user ? (
                        <>
                            {user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-primary font-bold">Admin Terminal</Link>}
                            <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg">Enter Workspace <ArrowRight size={20}/></Link>
                            <button onClick={logout} className="text-red-400 font-bold opacity-60">Terminate Session</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold opacity-60">Login</Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary py-4 rounded-2xl font-bold text-lg">Establish Identity</Link>
                        </>
                    )}
                </div>
            </div>
        )}
      </nav>

      {/* Symmetrical Hero Section */}
      <header className="pt-40 md:pt-64 pb-20 md:pb-32 px-6 md:px-12 text-center animate-fade-in w-full flex flex-col items-center">
        <div className="max-w-4xl">
          <span className="inline-block px-4 md:px-5 py-2 rounded-full glass text-primary text-[8px] md:text-[10px] font-black mb-8 md:mb-10 tracking-[0.4em] uppercase border border-primary/30">
            Artificial Intelligence Unleashed
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 md:mb-10 leading-[1] md:leading-[0.95] tracking-tighter">
            Think Massive with <br/><span className="text-primary italic">{config.aiName}</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted mb-12 md:mb-16 max-w-2xl mx-auto opacity-70 font-medium leading-relaxed font-outfit">
            The world's most powerful universal AI engine. Professional, secure, and built for ultimate performance. No boxes. No limits.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <Link to="/chat" className="w-full md:w-auto btn-primary px-10 md:px-12 py-4 md:py-5 text-lg md:text-xl rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                  Enter The Workspace <ArrowRight size={24} />
              </Link>
              <Link to="/pricing" className="w-full md:w-auto glass px-10 md:px-12 py-4 md:py-5 text-lg md:text-xl rounded-2xl font-black border border-white/10 hover:bg-white/5 transition-all text-center">
                  View Plans
              </Link>
          </div>
        </div>
      </header>

      {/* Grid Features */}
      <section className="py-20 md:py-32 px-6 md:px-12 w-full max-w-[1400px]">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
              <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] group relative overflow-hidden border border-white/5 hover:border-primary/30 transition-all">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 md:mb-10 group-hover:scale-110 transition-transform shadow-xl shadow-primary/10 mx-auto"><Zap size={32} /></div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 tracking-tighter">Instant Velocity</h3>
                  <p className="text-base md:text-lg text-muted opacity-60 leading-relaxed font-medium">LPU-powered stream processing for near-zero latency generations across all models.</p>
              </div>
              <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] group relative overflow-hidden border border-white/5 hover:border-primary/30 transition-all">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 md:mb-10 group-hover:scale-110 transition-transform shadow-xl shadow-primary/10 mx-auto"><Shield size={32} /></div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 tracking-tighter">Secured Protocol</h3>
                  <p className="text-base md:text-lg text-muted opacity-60 leading-relaxed font-medium">Enterprise-isolated processing nodes ensure your data is encrypted and private at all times.</p>
              </div>
              <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] group relative overflow-hidden border border-white/5 hover:border-primary/30 transition-all">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 md:mb-10 group-hover:scale-110 transition-transform shadow-xl shadow-primary/10 mx-auto"><Globe size={32} /></div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 tracking-tighter">Universal Reach</h3>
                  <p className="text-base md:text-lg text-muted opacity-60 leading-relaxed font-medium">Navigate between world-class models like Groq, Gemini, and OpenAI with a single identity.</p>
              </div>
          </div>
      </section>

      <footer className="py-20 border-t border-white/5 w-full text-center opacity-40 text-[10px] font-black tracking-widest uppercase italic">
          Project H Universal Intelligence Terminal © 2026
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen bg-[#0b0f1a] flex items-center justify-center text-primary font-black animate-pulse">AUTHENTICATING...</div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

const App = () => (
    <Router>
        <AuthProvider>
            <ThemeProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                </Routes>
            </ThemeProvider>
        </AuthProvider>
    </Router>
);

export default App;
