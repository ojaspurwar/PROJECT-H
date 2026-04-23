import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, tier }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 md:px-6">
      {/* Overlay - Darker for focus */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal content - Theme Aware */}
      <div className="relative bg-[var(--bg-main)] w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in border border-[var(--border-main)]">
        <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight">Upgrade Protocol</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-50 hover:opacity-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                Awaiting Node Credit: {tier?.name}
            </span>
          </div>
          
          <div className="inline-block p-4 bg-white rounded-3xl mb-8 shadow-2xl border-4 border-primary/20">
            <img 
              src="/payment_qr.png" 
              alt="Payment QR" 
              className="w-40 h-40 block mx-auto"
            />
          </div>

          <div className="space-y-1 mb-10">
            <h4 className="text-5xl font-black text-primary">{tier?.price}</h4>
            <p className="text-xs font-bold opacity-40 pt-4 uppercase tracking-widest">
                Scan to pay with Secure Gateways
            </p>
          </div>

          <div className="p-5 glass rounded-2xl border border-[var(--border-main)] flex items-center gap-4 text-left">
            <div className="p-2.5 bg-primary/20 rounded-xl text-primary shadow-lg shadow-primary/10">
                <ShieldCheck size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-tight text-primary">Quantum-Secured Signal</p>
                <p className="text-[10px] opacity-40 font-bold leading-tight">Manual node audit required for session unlock.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-main)] text-center bg-white/[0.02]">
          <p className="text-[10px] opacity-30 font-black uppercase tracking-widest leading-relaxed">
            Identity verification typically completes in<br/>5-10 machine-minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
