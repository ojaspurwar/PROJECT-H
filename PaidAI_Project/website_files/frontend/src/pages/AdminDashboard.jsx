import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, CheckCircle, Shield, LogOut, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
            const res = await axios.get(`${apiBase}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
            await axios.post(`${apiBase}/api/admin/approve/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error('Approval failed', err);
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0b0f1a] text-white p-4 md:p-12 relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-white/5 p-6 rounded-[32px] border border-white/10 glass">
                    <div className="flex items-center gap-5 w-full lg:w-auto">
                        <Link to="/" className="p-3 glass rounded-xl hover:text-primary transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Terminal</h1>
                            <p className="text-muted text-xs md:text-sm font-bold opacity-50 uppercase tracking-widest leading-none">Access Control Protocol</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search nodes..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 glass rounded-xl outline-none border border-white/10 focus:border-primary/50 transition-all text-sm w-full md:w-64"
                            />
                        </div>
                        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center justify-center gap-2 px-6 py-3 glass text-red-500/80 rounded-xl hover:bg-red-500/10 transition-colors font-bold text-sm border border-red-500/20 w-full md:w-auto">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* User List */}
                <div className="grid gap-4">
                    {filteredUsers.length === 0 ? (
                        <div className="glass p-20 rounded-[40px] text-center border border-white/10">
                            <Users size={40} className="mx-auto mb-6 opacity-10" />
                            <p className="opacity-40 text-sm font-bold uppercase tracking-widest leading-none">No node activity detected.</p>
                        </div>
                    ) : filteredUsers.map(user => (
                        <div key={user.id} className="glass p-5 md:p-6 rounded-[24px] md:rounded-[32px] flex flex-col md:flex-row items-center justify-between border border-white/5 transition-all hover:border-primary/30 group gap-6">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-all ${user.tier === 'paid' ? 'bg-primary text-white scale-105' : 'bg-white/5 opacity-50'}`}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-xl truncate">{user.username}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${user.tier === 'paid' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                                            {user.tier}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 border border-white/5 opacity-40">
                                            Signals: {user.message_count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto">
                                {user.tier === 'free' ? (
                                    <button 
                                        onClick={() => handleApprove(user.id)}
                                        className="w-full md:w-auto px-10 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 text-primary font-black text-sm uppercase tracking-widest bg-primary/5 px-6 py-3.5 rounded-2xl border border-primary/20">
                                        <Shield size={18} /> Verified
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
