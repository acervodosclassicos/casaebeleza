import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, X, Check } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cbe_cookie_consent');
    if (!saved) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'cbe_cookie_consent',
      JSON.stringify({ necessary: true, analytics: true, marketing: true, timestamp: Date.now() })
    );
    setIsVisible(false);
  };

  const handleRejectOptional = () => {
    localStorage.setItem(
      'cbe_cookie_consent',
      JSON.stringify({ necessary: true, analytics: false, marketing: false, timestamp: Date.now() })
    );
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      'cbe_cookie_consent',
      JSON.stringify({ ...preferences, necessary: true, timestamp: Date.now() })
    );
    setIsModalOpen(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-pink-100 text-zinc-800 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pink-100 text-[#E6007A] rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-zinc-900 mb-1">
              Privacidade &amp; Cookies (LGPD)
            </h4>
            <p className="text-zinc-600 leading-relaxed mb-3">
              Utilizamos cookies para aprimorar sua experiência de navegação, personalizar recomendações de produtos e analisar o tráfego da nossa loja conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold transition-all shadow-xs"
              >
                Aceitar Todos
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold transition-colors"
              >
                Rejeitar Opcionais
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 text-zinc-500 hover:text-zinc-900 underline font-medium"
              >
                Personalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#E6007A]" /> Preferências de Cookies
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-zinc-600">
              <div className="flex items-start justify-between gap-4 p-3 bg-zinc-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-zinc-900 mb-0.5">Cookies Essenciais</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Necessários para o funcionamento da sacola de compras, login e segurança. Não podem ser desativados.
                  </p>
                </div>
                <span className="px-2 py-1 bg-zinc-200 text-zinc-600 rounded text-[10px] font-bold">
                  Sempre Ativo
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-zinc-100 rounded-xl">
                <div>
                  <h4 className="font-bold text-zinc-900 mb-0.5">Cookies Analíticos</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Ajudam a entender quais produtos são mais visitados para aprimorarmos nossa plataforma.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="w-4 h-4 text-[#E6007A] rounded border-zinc-300 focus:ring-[#E6007A] mt-1"
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-zinc-100 rounded-xl">
                <div>
                  <h4 className="font-bold text-zinc-900 mb-0.5">Cookies de Marketing</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Permitem exibir ofertas exclusivas e descontos relevantes baseados nas suas preferências.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="w-4 h-4 text-[#E6007A] rounded border-zinc-300 focus:ring-[#E6007A] mt-1"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
