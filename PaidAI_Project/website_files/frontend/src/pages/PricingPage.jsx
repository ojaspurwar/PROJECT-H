import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const PricingPage = () => {
    const [config, setConfig] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    useEffect(() => {
        const apiPath = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/config' : '/api/config';
        axios.get(apiPath)
            .then(res => setConfig(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!config) return <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white font-black uppercase tracking-widest text-sm animate-pulse">Loading Pricing...</div>;

    const handleSelectPlan = (tier) => {
        if (tier.id === 'free') return;
        setSelectedTier(tier);
        setIsPaymentOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#0b0f1a] text-white py-12 md:py-24 px-4 md:px-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-12 md:mb-20 text-center md:text-left">
                    <Link to="/" className="p-3 glass rounded-xl hover:text-primary transition-all">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Membership Plans</h1>
                        <p className="text-base md:text-lg opacity-50">Professional power features for advanced AI interactions.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20 px-2 md:px-0">
                    {config.tiers.map((tier) => (
                        <div key={tier.id} className="glass p-8 rounded-[32px] md:rounded-[40px] flex flex-col border border-white/5 relative overflow-hidden group transition-all hover:border-primary/30">
                            {tier.id === 'pro' && (
                                <div className="absolute top-0 right-0 px-5 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl shadow-xl">POPULAR</div>
                            )}
                            
                            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                            <div className="text-4xl md:text-5xl font-extrabold text-white mb-8">
                                {tier.price}<span className="text-sm font-normal opacity-40 ml-2 tracking-widest uppercase">/ Month</span>
                            </div>
                            
                            <ul className="space-y-4 mb-10 flex-1">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4 text-sm md:text-base opacity-60 font-medium">
                                        <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handleSelectPlan(tier)}
                                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
                                    tier.id === 'pro' 
                                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95' 
                                    : 'glass border border-white/10 hover:bg-white/5 hover:scale-105 active:scale-95'
                                }`}
                            >
                                {tier.id === 'enterprise' ? 'Contact Sales' : (tier.id === 'free' ? 'Default' : 'Unlock Now')}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="glass p-10 md:p-16 rounded-[40px] text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-[80px] -z-10" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Need enterprise-level scale?</h2>
                    <p className="text-base md:text-lg text-muted mb-10 max-w-2xl mx-auto opacity-50 font-medium leading-relaxed">
                        Our engineering team can deploy dedicated private instances for high-frequency computational tasks with zero data sharing.
                    </p>
                    <button className="px-10 py-4 glass rounded-2xl hover:bg-white/5 font-bold transition-all border border-white/10 uppercase tracking-widest shadow-xl">Connect with HQ</button>
                </div>
            </div>

            <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} tier={selectedTier} />
        </div>
    );
};

export default PricingPage;
