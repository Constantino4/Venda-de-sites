import React, { useState } from 'react';
import { NovaStoreSettings } from '../types';
import { Store, ShieldCheck, Mail, Check, ArrowRight, Heart } from 'lucide-react';

interface NovaStoreFooterProps {
  settings: NovaStoreSettings;
  onNavigateCategory: (cat: string) => void;
  onNavigateContact: () => void;
  onNavigateAdmin: () => void;
}

export const NovaStoreFooter: React.FC<NovaStoreFooterProps> = ({
  settings,
  onNavigateCategory,
  onNavigateContact,
  onNavigateAdmin,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Newsletter Strip */}
      <div className="bg-indigo-950/60 border-b border-slate-800/80 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-black text-white flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Receba Ofertas Exclusivas e Descontos VIP</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Cadastre seu e-mail e ganhe 10% OFF na sua primeira compra com o cupom <strong className="text-amber-300">NOVA10</strong>
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto max-w-md">
            {newsletterSubscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs">
                <Check className="w-4 h-4" />
                <span>Obrigado! Cupom enviado para seu e-mail.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Digite seu melhor e-mail"
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 flex-1 md:w-64"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Cadastrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">{settings.storeName}</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.storeTagline}. Trabalhamos com produtos originais, garantia de fábrica e envio com seguro para todo o território nacional.
            </p>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>📍 {settings.address}</p>
              <p>📞 {settings.contactPhone} | ✉️ {settings.contactEmail}</p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Departamentos</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigateCategory('eletronicos')} className="hover:text-white transition">
                  Eletrônicos & Smart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('moda-acessorios')} className="hover:text-white transition">
                  Moda & Acessórios
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('calcados-tenis')} className="hover:text-white transition">
                  Calçados & Tênis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('casa-decor')} className="hover:text-white transition">
                  Casa & Decoração
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('beleza-saude')} className="hover:text-white transition">
                  Beleza & Cuidados
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Ajuda & Suporte</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onNavigateContact} className="hover:text-white transition">
                  Central de Atendimento
                </button>
              </li>
              <li>
                <button onClick={onNavigateContact} className="hover:text-white transition">
                  Rastreamento de Pedidos
                </button>
              </li>
              <li>
                <button onClick={onNavigateContact} className="hover:text-white transition">
                  Trocas e Devoluções
                </button>
              </li>
              <li>
                <button onClick={onNavigateContact} className="hover:text-white transition">
                  Prazos e Formas de Envio
                </button>
              </li>
              <li>
                <button onClick={onNavigateAdmin} className="text-amber-400 hover:text-amber-300 font-bold transition">
                  ⚙️ Painel do Lojista
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Payments */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Segurança & Pagamentos</h4>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-slate-300">
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold">PIX</span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold">VISA</span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold">MASTERCARD</span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold">ELO</span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold">BOLETO</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Site 100% Criptografado</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Certificado SSL com proteção contra fraudes.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 {settings.storeName}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Plataforma NovaStore Pro E-Commerce
          </p>
        </div>
      </div>
    </footer>
  );
};
