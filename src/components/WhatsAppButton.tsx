import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show a discreet friendly greeting tooltip after 3 seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('cbe_wa_tooltip_dismissed');
      if (!dismissed) {
        setShowTooltip(true);
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(false);
    sessionStorage.setItem('cbe_wa_tooltip_dismissed', 'true');
  };

  if (!settings.whatsappNumber) return null;

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '') || '5511987654321';
  const defaultMessage = encodeURIComponent(
    'Olá! Estou na loja Casa & Beleza Express e gostaria de tirar uma dúvida sobre um produto.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <aside 
      aria-label="Atendimento rápido via WhatsApp" 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none pointer-events-none"
    >
      {/* Floating Greeting Speech Balloon */}
      {showTooltip && (
        <div className="pointer-events-auto mb-2.5 max-w-[260px] sm:max-w-[290px] bg-white rounded-2xl p-3.5 shadow-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
          <button
            onClick={handleDismissTooltip}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center transition-colors shadow-xs"
            aria-label="Fechar balão de atendimento"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[11px] font-extrabold text-zinc-900 leading-none">
                  Atendimento Online
                </p>
              </div>
              <p className="text-xs text-zinc-600 leading-snug">
                Dúvidas sobre frete, pedidos ou produtos? Fale com a gente agora no WhatsApp!
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasInteracted(true)}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#128C7E] hover:text-[#075E54] hover:underline mt-1.5"
              >
                Iniciar conversa no WhatsApp &rarr;
              </a>
            </div>
          </div>

          {/* Balloon Arrow Pointer pointing to the button below */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-emerald-100 rotate-45"></div>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar conosco no WhatsApp - Atendimento rápido"
        className="pointer-events-auto flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] text-white shadow-xl shadow-emerald-600/35 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all group relative border border-white/30"
      >
        {/* Pulsing Online Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white"></span>
        </span>

        {/* WhatsApp Icon */}
        <div className="relative flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 sm:w-6 sm:h-6 fill-current text-white drop-shadow-xs" />
        </div>

        {/* Text Pill label (shown on desktop and larger mobile screens) */}
        <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
            Suporte Rápido
          </span>
          <span className="text-xs font-black tracking-tight text-white drop-shadow-2xs">
            Fale Conosco
          </span>
        </div>
      </a>
    </aside>
  );
};
