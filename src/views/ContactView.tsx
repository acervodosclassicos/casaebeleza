import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactView: React.FC = () => {
  const { settings, submitContact, showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Dúvida sobre Produto');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitContact(name.trim(), email.trim(), message.trim(), phone.trim(), subject);
      setIsSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-wider">
          Estamos Aqui Para Você
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
          Central de Atendimento
        </h1>
        <p className="text-xs text-zinc-500">
          Tire dúvidas sobre produtos, entregas ou trocas. Preencha o formulário e informe um e-mail válido para receber o retorno.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900">Canais Oficiais</h3>

            <div className="space-y-3 text-xs">
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5" /></div>
                  <div><h4 className="font-bold text-emerald-950">Atendimento WhatsApp</h4><p className="text-[11px] text-emerald-700">Conversar pelo WhatsApp</p></div>
                </a>
              )}

              {settings.contactEmail && (
                <div className="flex items-center gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#E6007A] flex items-center justify-center shrink-0"><Mail className="w-5 h-5" /></div>
                  <div><h4 className="font-bold text-zinc-900">E-mail de Suporte</h4><p className="text-[11px] text-zinc-500">{settings.contactEmail}</p></div>
                </div>
              )}

              {settings.contactPhone && (
                <div className="flex items-center gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#E6007A] flex items-center justify-center shrink-0"><Phone className="w-5 h-5" /></div>
                  <div><h4 className="font-bold text-zinc-900">Telefone Direto</h4><p className="text-[11px] text-zinc-500">{settings.contactPhone}</p></div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#E6007A] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Atendimento</h4>
                  <p className="text-[11px] text-zinc-500">Envie sua mensagem pelo formulário desta página.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Area (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs">
          <h3 className="font-extrabold text-base text-zinc-900 mb-4 pb-3 border-b border-zinc-100">
            Envie sua Mensagem
          </h3>

          {isSuccess ? (
            <div className="p-8 text-center space-y-3 bg-pink-50/50 rounded-2xl border border-pink-100">
              <CheckCircle2 className="w-12 h-12 text-[#E6007A] mx-auto" />
              <h4 className="font-bold text-base text-zinc-900">Mensagem Enviada!</h4>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Recebemos sua mensagem com sucesso. Nossa equipe entrará em contato através do seu e-mail cadastrado.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-2 bg-[#E6007A] text-white rounded-xl text-xs font-bold hover:bg-[#D0006E] transition-colors"
              >
                Enviar Outra Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Luiza Prado"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    WhatsApp ou Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Assunto do Contato
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  >
                    <option value="Dúvida sobre Produto">Dúvida sobre Produto</option>
                    <option value="Acompanhamento de Pedido">Acompanhamento de Pedido</option>
                    <option value="Trocas e Devoluções">Trocas e Devoluções</option>
                    <option value="Elogio ou Sugestão">Elogio ou Sugestão</option>
                    <option value="Outro Assunto">Outro Assunto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Sua Mensagem *
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:bg-white focus:border-[#E6007A] focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#E6007A] hover:bg-[#D0006E] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando Mensagem...' : 'Enviar Mensagem'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
