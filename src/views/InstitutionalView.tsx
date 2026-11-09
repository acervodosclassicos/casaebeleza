import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Lock,
  HelpCircle,
  FileText,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface InstitutionalViewProps {
  pageSlug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({ pageSlug, onNavigate }) => {
  const { settings } = useStore();

  const pages = [
    { slug: 'sobre', title: 'Sobre Nós', icon: Sparkles },
    { slug: 'como-comprar', title: 'Como Comprar', icon: ShoppingBag },
    { slug: 'formas-pagamento', title: 'Formas de Pagamento', icon: CreditCard },
    { slug: 'entrega-frete', title: 'Entrega & Frete', icon: Truck },
    { slug: 'trocas-devolucoes', title: 'Trocas & Devoluções', icon: RotateCcw },
    { slug: 'privacidade', title: 'Política de Privacidade (LGPD)', icon: Lock },
    { slug: 'termos', title: 'Termos de Uso', icon: FileText },
    { slug: 'cookies', title: 'Política de Cookies', icon: ShieldCheck },
    { slug: 'faq', title: 'Perguntas Frequentes (FAQ)', icon: HelpCircle },
  ];

  const currentPage = pages.find((p) => p.slug === pageSlug) || pages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Institucional
            </h3>
            <div className="space-y-1">
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.slug}
                    onClick={() => onNavigate('institucional', p.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                      currentPage.slug === p.slug
                        ? 'bg-[#E6007A] text-white shadow-xs'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-xs space-y-6 text-zinc-700 text-sm leading-relaxed">
          <div className="border-b border-zinc-100 pb-4">
            <span className="text-xs font-bold text-[#E6007A] uppercase tracking-wider">
              Casa &amp; Beleza Express
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              {currentPage.title}
            </h1>
          </div>

          {currentPage.slug === 'sobre' && (
            <div className="space-y-4">
              <p>
                A <strong>Casa &amp; Beleza Express</strong> nasceu com a missão de unir duas grandes paixões: o autocuidado feminino através de cosméticos e maquiagens de alta performance, e o aconchego do lar através de soluções elegantes e práticas de organização e decoração.
              </p>
              <p>
                Acreditamos que cuidar de si mesma e cuidar do espaço onde vivemos caminham lado a lado. Por isso, selecionamos produtos inovadores, testados e funcionais, que elevam sua autoestima e proporcionam harmonia e praticidade ao seu dia a dia.
              </p>
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900">Nossos Pilares:</h4>
                <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                  <li><strong>Excelência e Qualidade:</strong> Curadoria rigorosa de fórmulas e materiais resistentes.</li>
                  <li><strong>Agilidade Express:</strong> Despacho rápido para todo o território nacional com código de rastreamento.</li>
                  <li><strong>Transparência e Respeito:</strong> Atendimento humanizado e total conformidade com o Código de Defesa do Consumidor.</li>
                </ul>
              </div>
            </div>
          )}

          {currentPage.slug === 'como-comprar' && (
            <div className="space-y-4">
              <p>Comprar na Casa &amp; Beleza Express é rápido, intuitivo e 100% seguro. Siga o passo a passo abaixo:</p>
              <ol className="list-decimal pl-5 space-y-3 text-xs text-zinc-700">
                <li><strong>Escolha seus produtos:</strong> Navegue pelo nosso catálogo ou utilize a barra de busca inteligente.</li>
                <li><strong>Adicione à sacola:</strong> Selecione a quantidade e variações desejadas e clique em "Adicionar à Sacola".</li>
                <li><strong>Informe seu endereço:</strong> No checkout, preencha o CEP para preenchimento automático das informações de entrega.</li>
                <li><strong>Selecione o pagamento:</strong> Conclua sua compra através do link oficial e seguro do gateway de pagamento.</li>
                <li><strong>Acompanhe seu pedido:</strong> Assim que postado, você receberá atualizações em tempo real com seu código de rastreio.</li>
              </ol>
            </div>
          )}

          {currentPage.slug === 'formas-pagamento' && (
            <div className="space-y-4">
              <p>Trabalhamos com os intermediadores de pagamento mais consolidados do Brasil para garantir total proteção às suas compras:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                  <h4 className="font-bold text-zinc-900 mb-1">PIX Instantâneo</h4>
                  <p className="text-zinc-600">Confirmação em tempo real e separação prioritária.</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                  <h4 className="font-bold text-zinc-900 mb-1">Cartão de Crédito</h4>
                  <p className="text-zinc-600">Parcelamento em até 6x sem juros nas principais bandeiras.</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                  <h4 className="font-bold text-zinc-900 mb-1">Boleto Bancário</h4>
                  <p className="text-zinc-600">Disponível no gateway com prazo de compensação de até 48h úteis.</p>
                </div>
              </div>
            </div>
          )}

          {currentPage.slug === 'entrega-frete' && (
            <div className="space-y-4">
              <p>
                Entregamos em todo o Brasil através dos Correios e das melhores transportadoras parceiras privadas.
              </p>
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 text-xs space-y-2">
                <h4 className="font-bold text-zinc-900">Política de Frete Grátis:</h4>
                <p className="text-zinc-700">
                  Aproveite <strong>Frete Grátis</strong> em pedidos a partir de <strong>R$ 199,00</strong>.
                </p>
              </div>
              <p className="text-xs text-zinc-600">
                O prazo de entrega é calculado automaticamente no checkout de acordo com o CEP de destino e passa a contar a partir da confirmação do pagamento pelo gateway.
              </p>
            </div>
          )}

          {currentPage.slug === 'trocas-devolucoes' && (
            <div className="space-y-4">
              <p>
                Respeitamos integralmente o <strong>Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-600">
                <li><strong>Direito de Arrependimento:</strong> Você tem até 7 (sete) dias corridos a contar do recebimento do produto para solicitar a devolução e o estorno integral do valor pago.</li>
                <li><strong>Produtos com Defeito ou Avariados:</strong> Notifique nossa equipe em até 30 dias após o recebimento para substituição imediata ou reembolso.</li>
                <li><strong>Condições:</strong> O produto deve ser devolvido em sua embalagem original, sem indícios de uso indevido e acompanhado dos acessórios.</li>
              </ul>
            </div>
          )}

          {currentPage.slug === 'privacidade' && (
            <div className="space-y-4">
              <p>
                Esta Política de Privacidade cumpre as disposições da <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>.
              </p>
              <h4 className="font-bold text-sm text-zinc-900">1. Coleta e Finalidade dos Dados</h4>
              <p className="text-xs text-zinc-600">
                Coletamos apenas as informações estritamente necessárias para a emissão dos pedidos, faturamento e entrega (nome, e-mail, telefone e endereço). Não comercializamos nem compartilhamos dados com terceiros para fins publicitários não autorizados.
              </p>
              <h4 className="font-bold text-sm text-zinc-900">2. Seus Direitos</h4>
              <p className="text-xs text-zinc-600">
                Você pode a qualquer momento solicitar a confirmação, retificação ou exclusão dos seus dados cadastrais enviando uma mensagem para nossa central de atendimento: <strong>{settings.contactEmail}</strong>.
              </p>
            </div>
          )}

          {currentPage.slug === 'termos' && (
            <div className="space-y-4">
              <p>
                Ao navegar e realizar compras na <strong>Casa &amp; Beleza Express</strong>, você concorda com as condições de uso, políticas de precificação e termos contratuais estabelecidos pela legislação brasileira vigente.
              </p>
            </div>
          )}

          {currentPage.slug === 'cookies' && (
            <div className="space-y-4">
              <p>
                Cookies são pequenos arquivos gravados no seu navegador para permitir o funcionamento da sacola de compras, manter sua sessão segura e lembrar preferências de produtos. Você pode gerenciar ou desativar os cookies a qualquer momento através do nosso banner de consentimento ou das configurações do seu navegador.
              </p>
            </div>
          )}

          {currentPage.slug === 'faq' && (
            <div className="space-y-4 divide-y divide-zinc-100">
              <div className="pt-3 space-y-1">
                <h4 className="font-bold text-xs text-zinc-900">Como rastreio minha encomenda?</h4>
                <p className="text-xs text-zinc-500">
                  Basta acessar a aba "Acompanhar Pedido" no menu superior e inserir o número do seu pedido (Ex: CBE-12345678) ou seu e-mail.
                </p>
              </div>
              <div className="pt-3 space-y-1">
                <h4 className="font-bold text-xs text-zinc-900">Os produtos possuem garantia?</h4>
                <p className="text-xs text-zinc-500">
                  Sim! Todos os nossos produtos possuem garantia de satisfação de 7 dias e garantia legal contra vícios ou defeitos de fabricação.
                </p>
              </div>
              <div className="pt-3 space-y-1">
                <h4 className="font-bold text-xs text-zinc-900">Qual é o prazo para aprovação do PIX?</h4>
                <p className="text-xs text-zinc-500">
                  A confirmação via PIX costuma ocorrer em menos de 2 minutos pelo gateway de pagamento.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
