import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  if (!settings.whatsappNumber) return null;

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
  const message = encodeURIComponent(
    'Olá! Estou na loja Casa & Beleza Express e gostaria de tirar uma dúvida sobre um produto.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Casa & Beleza Express pelo WhatsApp"
      title="WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-900/25 ring-4 ring-white/90 transition-transform duration-200 hover:scale-110 active:scale-95"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
      <MessageCircle className="relative z-10 h-7 w-7 sm:h-8 sm:w-8 fill-white/15 stroke-[2.2]" />
      <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
    </a>
  );
};
