import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  MessageCircle,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-16 pb-12 border-t border-zinc-800">
      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#E6007A] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Frete grátis</h4>
              <p className="text-xs text-zinc-400">Em compras a partir de R$ 49,99</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#E6007A] flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Pagamento por gateway</h4>
              <p className="text-xs text-zinc-400">As opções disponíveis são informadas no ambiente de pagamento</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#E6007A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Pagamento em ambiente externo</h4>
              <p className="text-xs text-zinc-400">Confira os dados antes de confirmar a compra</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-[#E6007A] flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Troca Fácil em 7 Dias</h4>
              <p className="text-xs text-zinc-400">Conforme o Código de Defesa do Consumidor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="cursor-pointer flex items-center gap-2 select-none group inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E6007A] to-[#FF4D9E] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#E6007A] transition-colors">
                  CASA &amp; BELEZA
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-[#E6007A] uppercase -mt-1">
                  Express Boutique
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Sua curadoria definitiva em cosméticos de alta performance, maquiagens e soluções sofisticadas de organização para transformar o seu lar e o seu autocuidado.
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E6007A]" />
                <span>{settings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E6007A]" />
                <span>{settings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: +{settings.whatsappNumber}
                </a>
              </p>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-xs">
              Categorias
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:beleza-cosmeticos')}
                  className="hover:text-white transition-colors"
                >
                  Beleza &amp; Cosméticos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:maquiagem-acessorios')}
                  className="hover:text-white transition-colors"
                >
                  Maquiagem &amp; Acessórios
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:produtos-cabelo')}
                  className="hover:text-white transition-colors"
                >
                  Produtos para Cabelo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:organizacao-domestica')}
                  className="hover:text-white transition-colors"
                >
                  Organização Doméstica
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:casa-decoracao')}
                  className="hover:text-white transition-colors"
                >
                  Casa &amp; Decoração
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'cat:utilidades-lar')}
                  className="hover:text-white transition-colors"
                >
                  Utilidades para o Lar
                </button>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-xs">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'sobre')}
                  className="hover:text-white transition-colors"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'como-comprar')}
                  className="hover:text-white transition-colors"
                >
                  Como Comprar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'formas-pagamento')}
                  className="hover:text-white transition-colors"
                >
                  Formas de Pagamento
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'entrega-frete')}
                  className="hover:text-white transition-colors"
                >
                  Entrega &amp; Frete
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'trocas-devolucoes')}
                  className="hover:text-white transition-colors"
                >
                  Trocas &amp; Devoluções
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('acompanhar-pedido')}
                  className="hover:text-white transition-colors text-[#E6007A] font-semibold"
                >
                  Acompanhar Meu Pedido
                </button>
              </li>
            </ul>
          </div>

          {/* Ajuda & Segurança */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-xs">
              Ajuda &amp; Privacidade
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('contato')}
                  className="hover:text-white transition-colors"
                >
                  Fale Conosco
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'faq')}
                  className="hover:text-white transition-colors"
                >
                  Perguntas Frequentes (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'privacidade')}
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidade (LGPD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'termos')}
                  className="hover:text-white transition-colors"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('institucional', 'cookies')}
                  className="hover:text-white transition-colors"
                >
                  Política de Cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Payment Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Casa &amp; Beleza Express © {new Date().getFullYear()} — Todos os direitos reservados.</span>
        </div>

        {/* Security & Accepted Badges */}
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md font-semibold text-[10px]">
            PIX Instantâneo
          </span>
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md font-semibold text-[10px]">
            Cartão de Crédito
          </span>
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md font-semibold text-[10px]">
            Boleto Bancário
          </span>
          <span className="px-2.5 py-1 bg-zinc-800 text-emerald-400 rounded-md font-semibold text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSL 256-Bit
          </span>
        </div>
      </div>
    </footer>
  );
};
