import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard, MessageCircle, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps { onNavigate: (view: string, param?: string) => void; }

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const go = (view: string) => onNavigate(view);
  return (
    <footer className="mt-16 bg-[#171717] text-zinc-300">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex gap-3 items-center"><Truck className="w-6 h-6 text-pink-400 shrink-0"/><div><b className="block text-white text-sm">Entrega para todo o Brasil</b><span className="text-xs text-zinc-400">Consulte prazos e condições</span></div></div>
          <div className="flex gap-3 items-center"><CreditCard className="w-6 h-6 text-pink-400 shrink-0"/><div><b className="block text-white text-sm">Pagamento facilitado</b><span className="text-xs text-zinc-400">Pix e opções disponíveis no checkout</span></div></div>
          <div className="flex gap-3 items-center"><ShieldCheck className="w-6 h-6 text-pink-400 shrink-0"/><div><b className="block text-white text-sm">Compra com segurança</b><span className="text-xs text-zinc-400">Seus dados protegidos</span></div></div>
          <div className="flex gap-3 items-center"><RotateCcw className="w-6 h-6 text-pink-400 shrink-0"/><div><b className="block text-white text-sm">Atendimento pós-venda</b><span className="text-xs text-zinc-400">Conte com nosso suporte</span></div></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <button onClick={() => go('home')} className="text-left text-xl font-black tracking-tight text-white">{settings.storeName || 'Casa & Beleza Express'}</button>
          <p className="text-sm leading-relaxed text-zinc-400">Sua loja de beleza, cuidados pessoais, casa e decoração. Produtos selecionados para facilitar o seu dia a dia.</p>
          <div className="flex gap-3">
            {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded-lg bg-white/10 hover:bg-pink-600"><Instagram className="w-4 h-4"/></a>}
            {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded-lg bg-white/10 hover:bg-pink-600"><Facebook className="w-4 h-4"/></a>}
          </div>
        </div>
        <div><h3 className="font-bold text-white mb-4">Institucional</h3><ul className="space-y-3 text-sm"><li><button onClick={() => onNavigate('institucional', 'sobre')} className="hover:text-pink-300">Sobre a loja</button></li><li><button onClick={() => onNavigate('institucional', 'privacidade')} className="hover:text-pink-300">Privacidade</button></li><li><button onClick={() => onNavigate('institucional', 'termos')} className="hover:text-pink-300">Termos de uso</button></li><li><button onClick={() => onNavigate('institucional', 'trocas-devolucoes')} className="hover:text-pink-300">Trocas e devoluções</button></li></ul></div>
        <div><h3 className="font-bold text-white mb-4">Atendimento</h3><ul className="space-y-3 text-sm"><li><button onClick={() => go('contato')} className="hover:text-pink-300">Fale conosco</button></li><li><button onClick={() => go('acompanhar-pedido')} className="hover:text-pink-300">Rastrear pedido</button></li><li><button onClick={() => go('conta')} className="hover:text-pink-300">Minha conta</button></li></ul><div className="mt-4 space-y-2 text-xs text-zinc-400">{settings.contactEmail && <p className="flex gap-2 items-center"><Mail className="w-4 h-4"/>{settings.contactEmail}</p>}{settings.contactPhone && <p className="flex gap-2 items-center"><Phone className="w-4 h-4"/>{settings.contactPhone}</p>}{settings.whatsappNumber && <p className="flex gap-2 items-center"><MessageCircle className="w-4 h-4"/>WhatsApp: {settings.whatsappNumber}</p>}</div></div>
        <div><h3 className="font-bold text-white mb-4">Dados da empresa</h3><div className="space-y-3 text-sm text-zinc-400">{settings.cnpj && <p><span className="text-zinc-200">CNPJ:</span> {settings.cnpj}</p>}{settings.businessAddress && <p className="flex gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5"/>{settings.businessAddress}</p>}<p className="text-xs leading-relaxed">As informações comerciais e de atendimento são apresentadas para facilitar o contato com nossa equipe.</p></div></div>
      </div>
      <div className="border-t border-white/10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-3 justify-between text-xs text-zinc-500"><span>© {new Date().getFullYear()} {settings.storeName || 'Casa & Beleza Express'}. Todos os direitos reservados.</span><span>Comércio eletrônico • Atendimento ao consumidor</span></div></div>
    </footer>
  );
};
