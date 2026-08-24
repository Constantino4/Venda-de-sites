import React, { useState } from 'react';
import { NovaStoreSettings } from '../types';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, ArrowLeft, HelpCircle } from 'lucide-react';

interface NovaStoreContactProps {
  settings: NovaStoreSettings;
  onBackToHome: () => void;
}

export const NovaStoreContact: React.FC<NovaStoreContactProps> = ({
  settings,
  onBackToHome,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Central de Atendimento</h1>
        <p className="text-xs sm:text-sm text-slate-500">Estamos prontos para tirar todas as suas dúvidas sobre pedidos, frete e produtos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: Direct channels */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-black">Fale Conosco</h2>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Nosso time de suporte está disponível de Segunda a Sexta, das 09h às 18h.
            </p>

            <div className="space-y-4 text-xs">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-2xl font-bold transition shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Atendimento Rápido via WhatsApp</span>
              </a>

              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl">
                <Phone className="w-4 h-4 text-indigo-300" />
                <div>
                  <span className="font-bold block">Telefone:</span>
                  <span className="text-indigo-200">{settings.contactPhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl">
                <Mail className="w-4 h-4 text-indigo-300" />
                <div>
                  <span className="font-bold block">E-mail:</span>
                  <span className="text-indigo-200">{settings.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-2xl">
                <MapPin className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Endereço:</span>
                  <span className="text-indigo-200 leading-relaxed">{settings.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 mb-4">Envie uma Mensagem</h2>
            
            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950">Mensagem enviada com sucesso!</h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Recebemos seu contato e nossa equipe responderá no seu e-mail dentro de poucas horas.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Seu Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Seu E-mail</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assunto</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Ex: Dúvida sobre rastreamento de pedido"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Descreva detalhadamente como podemos ajudar..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <span>Perguntas Frequentes (FAQ)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900">Qual é o prazo médio de entrega?</h4>
            <p className="text-slate-600 leading-relaxed">
              O envio é feito em até 24h úteis após aprovação. Para capitais, o prazo médio é de 3 a 5 dias úteis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900">Como funciona a garantia de 30 dias?</h4>
            <p className="text-slate-600 leading-relaxed">
              Se você não ficar 100% satisfeito com o produto, realizamos a troca ou devolução integral do seu dinheiro.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900">Quais formas de pagamento são aceitas?</h4>
            <p className="text-slate-600 leading-relaxed">
              Aceitamos PIX instantâneo com 5% de desconto, Cartão de Crédito em até 12x e Boleto Bancário à vista.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900">Como rastrear a minha encomenda?</h4>
            <p className="text-slate-600 leading-relaxed">
              Assim que o pedido é despachado, você recebe o código de rastreamento por e-mail e pode consultar na aba "Meus Pedidos".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
