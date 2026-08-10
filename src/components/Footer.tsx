import React from 'react';
import { Globe, ShieldCheck, Download, Code, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Web<span className="text-blue-600">Market</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              O maior mercado brasileiro para comprar e vender sites, SaaS e templates de alta conversão com código fonte aberto e licença sem surpresas.
            </p>
          </div>

          {/* Col 2: Buyers */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Para Compradores</h4>
            <ul className="space-y-1.5 font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition">Como Baixar em .ZIP</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Demo Interativa ao Vivo</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Garantia de Funcionamento</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Tipos de Licença (Padrão & Agência)</li>
            </ul>
          </div>

          {/* Col 3: Sellers */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Para Vendedores</h4>
            <ul className="space-y-1.5 font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition">Publicar Modelo de Site</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Gerador de Copy com IA Gemini</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Comissões e Saque PIX</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Regras da Comunidade</li>
            </ul>
          </div>

          {/* Col 4: Trust */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Segurança & Suporte</h4>
            <div className="space-y-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Pagamento 100% Protegido</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Download Instantâneo em .ZIP</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Código TypeScript & React 19</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] font-medium">
          <p>© 2026 WebMarket Tecnologia. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para programadores e empreendedores.
          </p>
        </div>

      </div>
    </footer>
  );
};
